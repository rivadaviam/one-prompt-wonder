# Hotel Stay API

A dependency-free local JSON API for room availability, reservations, cancellation, check-in, check-out, and housekeeping readiness. SQLite transactions and database triggers protect active date ranges from double booking.

## Prerequisites

- Python 3.9 or newer
- `curl` for the demo script

No package installation, private credentials, or external infrastructure is required.

## Run locally

```bash
python3 -m hotel_api.api
```

The API listens at `http://127.0.0.1:8000` and creates `data/hotel.db` on first run. Optional environment variables are `HOST`, `PORT`, and `HOTEL_DB_PATH`.

Seed data includes ready rooms 101 and 102 and dirty room 201.

## Primary workflow

In a second terminal, run a complete same-day reserve → check-in → check-out → housekeeping cycle:

```bash
./scripts/demo.sh
```

The script derives today's dates, finds a ready available room, makes the reservation, completes the stay, and marks the room ready again. Individual copyable requests are also in [`requests.http`](requests.http).

## Routes

| Method | Route | Result |
| --- | --- | --- |
| `GET` | `/health` | Readiness and database connectivity |
| `GET` | `/rooms` | All rooms and operational status |
| `GET` | `/rooms/availability?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD` | Ready, unbooked rooms for the half-open date range |
| `POST` | `/reservations` | Reserve a ready, available room |
| `GET` | `/reservations/{id}` | Retrieve a reservation |
| `DELETE` | `/reservations/{id}` | Cancel a future reservation |
| `POST` | `/reservations/{id}/check-in` | Check in on or after arrival and before departure |
| `POST` | `/reservations/{id}/check-out` | Check out an active stay; room becomes dirty |
| `POST` | `/rooms/{id}/ready` | Mark a dirty room ready |

Successful responses use `{"success":true,"data":...}`. Errors use `{"success":false,"error":{"code":"...","message":"...","details":...}}`. Validation errors are `422`, missing resources are `404`, and booking/state conflicts are `409`.

### Reserve with curl

Use dates today or later:

```bash
curl -i -X POST http://127.0.0.1:8000/reservations \
  -H 'Content-Type: application/json' \
  -d '{
    "guest_name": "Grace Hopper",
    "guest_email": "grace@example.com",
    "room_id": 101,
    "check_in": "2030-06-10",
    "check_out": "2030-06-12"
  }'
```

### Invalid and missing-resource examples

```bash
curl -i -X POST http://127.0.0.1:8000/reservations \
  -H 'Content-Type: application/json' -d '{"guest_name":""}'

curl -i http://127.0.0.1:8000/reservations/999999
```

## Validate

```bash
make check
```

This compiles all Python modules and runs HTTP integration tests against isolated temporary SQLite databases.

## Domain rules and assumptions

- Date ranges are half-open: check-in is included and check-out is excluded, so adjacent stays are allowed.
- New reservations cannot begin in the past. Cancellation is allowed only while reserved and strictly before check-in day.
- Check-in is allowed from the reserved check-in date until (but not including) check-out date, and only if the room is ready.
- Early check-out is allowed. Check-out makes the room dirty; housekeeping must mark it ready before another assignment or check-in.
- Availability lists only rooms that are operationally ready and have no overlapping reserved or checked-in stay.
- Authentication and role authorization are intentionally out of scope; route boundaries represent the requested roles.

## Limitations

- This is a local single-hotel service with no authentication, payments, rate plans, guest accounts, or room inventory administration.
- Dates are hotel-local calendar dates; configurable time zones and check-in hours are not modeled.
- SQLite is appropriate for a local demo and small deployment, not a multi-node service.
