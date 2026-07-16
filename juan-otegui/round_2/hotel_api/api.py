import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from .database import Database
from .domain import DomainError, HotelService


RESERVATION_PATH = re.compile(r"^/reservations/(\d+)$")
CHECK_IN_PATH = re.compile(r"^/reservations/(\d+)/check-in$")
CHECK_OUT_PATH = re.compile(r"^/reservations/(\d+)/check-out$")
ROOM_READY_PATH = re.compile(r"^/rooms/(\d+)/ready$")


class HotelRequestHandler(BaseHTTPRequestHandler):
    service = None
    server_version = "HotelAPI/1.0"

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            return self._execute(self.service.health)
        if parsed.path == "/rooms":
            return self._execute(self.service.list_rooms)
        if parsed.path == "/rooms/availability":
            query = parse_qs(parsed.query, keep_blank_values=True)
            return self._execute(lambda: self._available_rooms(query))
        match = RESERVATION_PATH.match(parsed.path)
        if match:
            return self._execute(lambda: self.service.get_reservation(int(match.group(1))))
        self._error(404, "route_not_found", "Route not found")

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/reservations":
            payload = self._read_json()
            if payload is None:
                return
            return self._execute(lambda: self.service.create_reservation(payload), success_status=201)
        match = CHECK_IN_PATH.match(path)
        if match:
            return self._execute(lambda: self.service.check_in(int(match.group(1))))
        match = CHECK_OUT_PATH.match(path)
        if match:
            return self._execute(lambda: self.service.check_out(int(match.group(1))))
        match = ROOM_READY_PATH.match(path)
        if match:
            return self._execute(lambda: self.service.mark_room_ready(int(match.group(1))))
        self._error(404, "route_not_found", "Route not found")

    def do_DELETE(self):
        path = urlparse(self.path).path
        match = RESERVATION_PATH.match(path)
        if match:
            return self._execute(lambda: self.service.cancel_reservation(int(match.group(1))))
        self._error(404, "route_not_found", "Route not found")

    def do_PUT(self):
        self._error(405, "method_not_allowed", "Method not allowed")

    def do_PATCH(self):
        self._error(405, "method_not_allowed", "Method not allowed")

    def _single_query_value(self, query, name):
        values = query.get(name)
        if not values or len(values) != 1 or not values[0]:
            raise DomainError(422, "validation_error", "Request validation failed", {name: "is required exactly once"})
        return values[0]

    def _available_rooms(self, query):
        check_in = self._single_query_value(query, "check_in")
        check_out = self._single_query_value(query, "check_out")
        return self.service.available_rooms(check_in, check_out)

    def _read_json(self):
        content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        if content_type != "application/json":
            self._error(415, "unsupported_media_type", "Content-Type must be application/json")
            return None
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._error(400, "invalid_request", "Invalid Content-Length")
            return None
        if length <= 0:
            self._error(400, "invalid_json", "Request body must contain JSON")
            return None
        if length > 1_000_000:
            self._error(413, "payload_too_large", "Request body is too large")
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._error(400, "invalid_json", "Request body contains invalid JSON")
            return None

    def _execute(self, action, success_status=200):
        try:
            data = action()
            self._json(success_status, {"success": True, "data": data})
        except DomainError as error:
            self._error(error.status, error.code, error.message, error.details)
        except Exception:
            self._error(500, "internal_error", "An unexpected server error occurred")

    def _error(self, status, code, message, details=None):
        error = {"code": code, "message": message}
        if details:
            error["details"] = details
        self._json(status, {"success": False, "error": error})

    def _json(self, status, payload):
        encoded = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, message_format, *args):
        print("%s - %s" % (self.address_string(), message_format % args))


def create_server(host="127.0.0.1", port=8000, database_path=None):
    service = HotelService(Database(database_path))
    handler = type("ConfiguredHotelRequestHandler", (HotelRequestHandler,), {"service": service})
    return ThreadingHTTPServer((host, port), handler)


def main():
    host = os.environ.get("HOST", "127.0.0.1")
    try:
        port = int(os.environ.get("PORT", "8000"))
    except ValueError:
        raise SystemExit("PORT must be an integer")
    server = create_server(host, port, os.environ.get("HOTEL_DB_PATH"))
    print("Hotel API listening on http://%s:%d" % server.server_address)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
