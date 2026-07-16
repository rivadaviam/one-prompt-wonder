import re
import sqlite3
from datetime import date, datetime, timezone

from .database import Database


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
ACTIVE_RESERVATION_STATUSES = ("reserved", "checked_in")


class DomainError(Exception):
    def __init__(self, status, code, message, details=None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse_iso_date(value, field):
    if not isinstance(value, str):
        raise DomainError(422, "validation_error", "Request validation failed", {field: "must be an ISO date (YYYY-MM-DD)"})
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise DomainError(422, "validation_error", "Request validation failed", {field: "must be a valid ISO date (YYYY-MM-DD)"})


def validate_date_range(check_in, check_out, future_only=False):
    start = parse_iso_date(check_in, "check_in")
    end = parse_iso_date(check_out, "check_out")
    details = {}
    if start >= end:
        details["check_out"] = "must be after check_in"
    if future_only and start < date.today():
        details["check_in"] = "cannot be in the past"
    if details:
        raise DomainError(422, "validation_error", "Request validation failed", details)
    return start, end


def serialize_row(row):
    return dict(row) if row is not None else None


class HotelService:
    def __init__(self, database=None):
        self.database = database or Database()
        self.database.initialize()

    def health(self):
        try:
            with self.database.connect() as connection:
                connection.execute("SELECT 1").fetchone()
        except sqlite3.Error:
            raise DomainError(503, "not_ready", "Database is unavailable")
        return {"status": "ready", "database": "connected"}

    def list_rooms(self):
        with self.database.connect() as connection:
            rows = connection.execute(
                "SELECT id, number, room_type, capacity, status FROM rooms ORDER BY number"
            ).fetchall()
        return [serialize_row(row) for row in rows]

    def available_rooms(self, check_in, check_out):
        validate_date_range(check_in, check_out)
        with self.database.connect() as connection:
            rows = connection.execute(
                """
                SELECT room.id, room.number, room.room_type, room.capacity, room.status
                FROM rooms room
                WHERE room.status = 'ready'
                  AND NOT EXISTS (
                    SELECT 1 FROM reservations reservation
                    WHERE reservation.room_id = room.id
                      AND reservation.status IN ('reserved', 'checked_in')
                      AND reservation.check_in < ?
                      AND reservation.check_out > ?
                  )
                ORDER BY room.number
                """,
                (check_out, check_in),
            ).fetchall()
        return {
            "check_in": check_in,
            "check_out": check_out,
            "rooms": [serialize_row(row) for row in rows],
        }

    def create_reservation(self, payload):
        if not isinstance(payload, dict):
            raise DomainError(422, "validation_error", "Request body must be a JSON object")

        details = {}
        name = payload.get("guest_name")
        email = payload.get("guest_email")
        room_id = payload.get("room_id")
        if not isinstance(name, str) or not name.strip():
            details["guest_name"] = "is required and must be a non-empty string"
        elif len(name.strip()) > 120:
            details["guest_name"] = "must be at most 120 characters"
        if not isinstance(email, str) or not EMAIL_PATTERN.match(email):
            details["guest_email"] = "must be a valid email address"
        if isinstance(room_id, bool) or not isinstance(room_id, int) or room_id <= 0:
            details["room_id"] = "must be a positive integer"
        if details:
            raise DomainError(422, "validation_error", "Request validation failed", details)

        validate_date_range(payload.get("check_in"), payload.get("check_out"), future_only=True)
        check_in = payload["check_in"]
        check_out = payload["check_out"]

        connection = self.database.connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            room = connection.execute(
                "SELECT id, status FROM rooms WHERE id = ?", (room_id,)
            ).fetchone()
            if room is None:
                raise DomainError(404, "room_not_found", "Room not found")
            if room["status"] != "ready":
                raise DomainError(409, "room_not_ready", "Room is not ready for assignment")
            overlap = connection.execute(
                """
                SELECT id FROM reservations
                WHERE room_id = ?
                  AND status IN ('reserved', 'checked_in')
                  AND check_in < ? AND check_out > ?
                LIMIT 1
                """,
                (room_id, check_out, check_in),
            ).fetchone()
            if overlap:
                raise DomainError(409, "room_unavailable", "Room is already booked for this date range")
            cursor = connection.execute(
                """
                INSERT INTO reservations(
                    guest_name, guest_email, room_id, check_in, check_out, status, created_at
                ) VALUES (?, ?, ?, ?, ?, 'reserved', ?)
                """,
                (name.strip(), email.lower(), room_id, check_in, check_out, utc_now()),
            )
            reservation_id = cursor.lastrowid
            connection.commit()
        except DomainError:
            connection.rollback()
            raise
        except sqlite3.IntegrityError as error:
            connection.rollback()
            if "already booked" in str(error):
                raise DomainError(409, "room_unavailable", "Room is already booked for this date range")
            raise
        finally:
            connection.close()
        return self.get_reservation(reservation_id)

    def get_reservation(self, reservation_id):
        with self.database.connect() as connection:
            row = connection.execute(
                """
                SELECT reservation.*, room.number AS room_number, room.room_type
                FROM reservations reservation
                JOIN rooms room ON room.id = reservation.room_id
                WHERE reservation.id = ?
                """,
                (reservation_id,),
            ).fetchone()
        if row is None:
            raise DomainError(404, "reservation_not_found", "Reservation not found")
        return serialize_row(row)

    def cancel_reservation(self, reservation_id):
        connection = self.database.connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            reservation = self._reservation_for_update(connection, reservation_id)
            if reservation["status"] != "reserved":
                raise DomainError(409, "invalid_reservation_state", "Only reserved stays can be cancelled")
            if date.today() >= date.fromisoformat(reservation["check_in"]):
                raise DomainError(409, "cancellation_window_closed", "Reservation can only be cancelled before the stay begins")
            connection.execute(
                "UPDATE reservations SET status = 'cancelled', cancelled_at = ? WHERE id = ?",
                (utc_now(), reservation_id),
            )
            connection.commit()
        except DomainError:
            connection.rollback()
            raise
        finally:
            connection.close()
        return self.get_reservation(reservation_id)

    def check_in(self, reservation_id):
        connection = self.database.connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            reservation = self._reservation_for_update(connection, reservation_id)
            if reservation["status"] != "reserved":
                raise DomainError(409, "invalid_reservation_state", "Only reserved stays can be checked in")
            today = date.today()
            if today < date.fromisoformat(reservation["check_in"]):
                raise DomainError(409, "check_in_too_early", "Guest cannot check in before the reserved date")
            if today >= date.fromisoformat(reservation["check_out"]):
                raise DomainError(409, "reservation_expired", "Reservation check-out date has passed")
            room = connection.execute(
                "SELECT status FROM rooms WHERE id = ?", (reservation["room_id"],)
            ).fetchone()
            if room["status"] != "ready":
                raise DomainError(409, "room_not_ready", "Room is not ready for check-in")
            now = utc_now()
            connection.execute(
                "UPDATE reservations SET status = 'checked_in', actual_check_in = ? WHERE id = ?",
                (now, reservation_id),
            )
            connection.execute(
                "UPDATE rooms SET status = 'occupied' WHERE id = ?", (reservation["room_id"],)
            )
            connection.commit()
        except DomainError:
            connection.rollback()
            raise
        finally:
            connection.close()
        return self.get_reservation(reservation_id)

    def check_out(self, reservation_id):
        connection = self.database.connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            reservation = self._reservation_for_update(connection, reservation_id)
            if reservation["status"] != "checked_in":
                raise DomainError(409, "invalid_reservation_state", "Only checked-in stays can be checked out")
            room = connection.execute(
                "SELECT status FROM rooms WHERE id = ?", (reservation["room_id"],)
            ).fetchone()
            if room["status"] != "occupied":
                raise DomainError(409, "invalid_room_state", "Assigned room is not occupied")
            now = utc_now()
            connection.execute(
                "UPDATE reservations SET status = 'checked_out', actual_check_out = ? WHERE id = ?",
                (now, reservation_id),
            )
            connection.execute(
                "UPDATE rooms SET status = 'dirty' WHERE id = ?", (reservation["room_id"],)
            )
            connection.commit()
        except DomainError:
            connection.rollback()
            raise
        finally:
            connection.close()
        return self.get_reservation(reservation_id)

    def mark_room_ready(self, room_id):
        connection = self.database.connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            room = connection.execute(
                "SELECT id, status FROM rooms WHERE id = ?", (room_id,)
            ).fetchone()
            if room is None:
                raise DomainError(404, "room_not_found", "Room not found")
            if room["status"] == "occupied":
                raise DomainError(409, "room_occupied", "An occupied room cannot be marked ready")
            if room["status"] == "ready":
                raise DomainError(409, "invalid_room_state", "Room is already ready")
            connection.execute("UPDATE rooms SET status = 'ready' WHERE id = ?", (room_id,))
            connection.commit()
        except DomainError:
            connection.rollback()
            raise
        finally:
            connection.close()
        with self.database.connect() as read_connection:
            row = read_connection.execute(
                "SELECT id, number, room_type, capacity, status FROM rooms WHERE id = ?", (room_id,)
            ).fetchone()
        return serialize_row(row)

    @staticmethod
    def _reservation_for_update(connection, reservation_id):
        row = connection.execute(
            "SELECT * FROM reservations WHERE id = ?", (reservation_id,)
        ).fetchone()
        if row is None:
            raise DomainError(404, "reservation_not_found", "Reservation not found")
        return row
