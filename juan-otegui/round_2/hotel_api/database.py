import os
import sqlite3
from pathlib import Path


SCHEMA = """
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    room_type TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status TEXT NOT NULL CHECK (status IN ('ready', 'occupied', 'dirty'))
);

CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('reserved', 'checked_in', 'checked_out', 'cancelled')),
    created_at TEXT NOT NULL,
    cancelled_at TEXT,
    actual_check_in TEXT,
    actual_check_out TEXT,
    CHECK (check_in < check_out)
);

CREATE INDEX IF NOT EXISTS reservations_room_dates
ON reservations(room_id, check_in, check_out, status);

CREATE TRIGGER IF NOT EXISTS prevent_overlapping_reservations_insert
BEFORE INSERT ON reservations
WHEN NEW.status IN ('reserved', 'checked_in')
BEGIN
    SELECT CASE WHEN EXISTS (
        SELECT 1 FROM reservations existing
        WHERE existing.room_id = NEW.room_id
          AND existing.status IN ('reserved', 'checked_in')
          AND existing.check_in < NEW.check_out
          AND existing.check_out > NEW.check_in
    ) THEN RAISE(ABORT, 'room is already booked for this date range') END;
END;

CREATE TRIGGER IF NOT EXISTS prevent_overlapping_reservations_update
BEFORE UPDATE OF room_id, check_in, check_out, status ON reservations
WHEN NEW.status IN ('reserved', 'checked_in')
BEGIN
    SELECT CASE WHEN EXISTS (
        SELECT 1 FROM reservations existing
        WHERE existing.room_id = NEW.room_id
          AND existing.id != NEW.id
          AND existing.status IN ('reserved', 'checked_in')
          AND existing.check_in < NEW.check_out
          AND existing.check_out > NEW.check_in
    ) THEN RAISE(ABORT, 'room is already booked for this date range') END;
END;
"""

SEED_ROOMS = (
    (101, "101", "single", 1, "ready"),
    (102, "102", "double", 2, "ready"),
    (201, "201", "suite", 4, "dirty"),
)


class Database:
    def __init__(self, path=None):
        self.path = path or os.environ.get("HOTEL_DB_PATH", "data/hotel.db")

    def connect(self):
        connection = sqlite3.connect(self.path, timeout=5)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("PRAGMA busy_timeout = 5000")
        return connection

    def initialize(self):
        if self.path != ":memory:":
            Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            connection.executescript(SCHEMA)
            count = connection.execute("SELECT COUNT(*) FROM rooms").fetchone()[0]
            if count == 0:
                connection.executemany(
                    "INSERT INTO rooms(id, number, room_type, capacity, status) VALUES (?, ?, ?, ?, ?)",
                    SEED_ROOMS,
                )
