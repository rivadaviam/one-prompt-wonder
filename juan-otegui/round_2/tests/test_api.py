import json
import tempfile
import threading
import unittest
from datetime import date, timedelta
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from hotel_api.api import create_server


class HotelApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_directory = tempfile.TemporaryDirectory()
        database_path = str(Path(self.temp_directory.name) / "test.db")
        self.server = create_server("127.0.0.1", 0, database_path)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = "http://127.0.0.1:%d" % self.server.server_address[1]
        self.today = date.today()
        self.tomorrow = self.today + timedelta(days=1)
        self.next_week = self.today + timedelta(days=7)
        self.next_week_end = self.today + timedelta(days=9)

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)
        self.temp_directory.cleanup()

    def request(self, method, path, payload=None, content_type="application/json"):
        body = json.dumps(payload).encode() if payload is not None else None
        headers = {"Content-Type": content_type} if payload is not None else {}
        request = Request(self.base_url + path, data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=3) as response:
                return response.status, json.loads(response.read())
        except HTTPError as error:
            return error.code, json.loads(error.read())

    def reserve(self, room_id=101, start=None, end=None):
        return self.request(
            "POST",
            "/reservations",
            {
                "guest_name": "Ada Lovelace",
                "guest_email": "ada@example.com",
                "room_id": room_id,
                "check_in": (start or self.today).isoformat(),
                "check_out": (end or self.tomorrow).isoformat(),
            },
        )

    def test_health_and_seeded_rooms(self):
        status, response = self.request("GET", "/health")
        self.assertEqual(200, status)
        self.assertEqual("ready", response["data"]["status"])
        status, response = self.request("GET", "/rooms")
        self.assertEqual(3, len(response["data"]))
        self.assertEqual("dirty", response["data"][2]["status"])

    def test_primary_stay_workflow_and_housekeeping(self):
        status, response = self.reserve()
        self.assertEqual(201, status)
        reservation_id = response["data"]["id"]
        self.assertEqual("reserved", response["data"]["status"])

        status, response = self.request("POST", "/reservations/%d/check-in" % reservation_id)
        self.assertEqual(200, status)
        self.assertEqual("checked_in", response["data"]["status"])

        status, response = self.request("POST", "/reservations/%d/check-out" % reservation_id)
        self.assertEqual(200, status)
        self.assertEqual("checked_out", response["data"]["status"])

        status, response = self.reserve(room_id=101, start=self.next_week, end=self.next_week_end)
        self.assertEqual(409, status)
        self.assertEqual("room_not_ready", response["error"]["code"])

        status, response = self.request("POST", "/rooms/101/ready")
        self.assertEqual(200, status)
        self.assertEqual("ready", response["data"]["status"])

    def test_availability_and_double_booking_prevention(self):
        status, first = self.reserve(start=self.next_week, end=self.next_week_end)
        self.assertEqual(201, status)
        status, response = self.reserve(start=self.next_week + timedelta(days=1), end=self.next_week_end + timedelta(days=1))
        self.assertEqual(409, status)
        self.assertEqual("room_unavailable", response["error"]["code"])

        status, response = self.request(
            "GET",
            "/rooms/availability?check_in=%s&check_out=%s"
            % (self.next_week.isoformat(), self.next_week_end.isoformat()),
        )
        self.assertEqual(200, status)
        room_ids = [room["id"] for room in response["data"]["rooms"]]
        self.assertNotIn(101, room_ids)
        self.assertIn(102, room_ids)
        self.assertNotIn(201, room_ids)
        self.assertEqual("reserved", first["data"]["status"])

    def test_future_reservation_can_be_cancelled_and_dates_are_released(self):
        status, response = self.reserve(start=self.next_week, end=self.next_week_end)
        reservation_id = response["data"]["id"]
        status, response = self.request("DELETE", "/reservations/%d" % reservation_id)
        self.assertEqual(200, status)
        self.assertEqual("cancelled", response["data"]["status"])
        status, response = self.reserve(start=self.next_week, end=self.next_week_end)
        self.assertEqual(201, status)

    def test_dirty_room_cannot_be_reserved_or_checked_as_available(self):
        status, response = self.reserve(room_id=201, start=self.next_week, end=self.next_week_end)
        self.assertEqual(409, status)
        self.assertEqual("room_not_ready", response["error"]["code"])

    def test_invalid_payload_and_missing_resource(self):
        status, response = self.request(
            "POST",
            "/reservations",
            {"guest_name": "", "guest_email": "bad", "room_id": "101", "check_in": "nope", "check_out": "2020-01-01"},
        )
        self.assertEqual(422, status)
        self.assertEqual("validation_error", response["error"]["code"])
        status, response = self.request("GET", "/reservations/999999")
        self.assertEqual(404, status)
        self.assertEqual("reservation_not_found", response["error"]["code"])

        status, response = self.request("GET", "/rooms/availability?check_in=2030-01-01")
        self.assertEqual(422, status)
        self.assertEqual("validation_error", response["error"]["code"])

    def test_illegal_transitions_are_rejected(self):
        status, response = self.reserve(start=self.next_week, end=self.next_week_end)
        reservation_id = response["data"]["id"]
        status, response = self.request("POST", "/reservations/%d/check-in" % reservation_id)
        self.assertEqual(409, status)
        self.assertEqual("check_in_too_early", response["error"]["code"])
        status, response = self.request("POST", "/reservations/%d/check-out" % reservation_id)
        self.assertEqual(409, status)
        self.assertEqual("invalid_reservation_state", response["error"]["code"])


if __name__ == "__main__":
    unittest.main()
