# Hotel Reservation API

An in-memory REST JSON API implementing the supplied hotel guest, reception,
housekeeping, and manager user stories. It uses Node.js, Express, Zod, Vitest,
Supertest, and real curl smoke tests.

## Run Locally

```bash
npm install
npm run verify
npm start
```

Base URL: `http://localhost:8787/api`

Health check:

```bash
curl -i http://localhost:8787/api/health
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health |
| `GET` | `/api/rooms` | List rooms and readiness |
| `GET` | `/api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` | List ready, unbooked rooms |
| `PATCH` | `/api/rooms/:id/readiness` | Mark a room ready or not ready |
| `GET` | `/api/reservations?status=reserved` | List reservations, optionally by status |
| `GET` | `/api/reservations/:id` | Get one reservation |
| `POST` | `/api/reservations` | Reserve a ready room |
| `POST` | `/api/reservations/:id/cancel` | Cancel before check-in date |
| `POST` | `/api/reservations/:id/check-in` | Check in during stay dates |
| `POST` | `/api/reservations/:id/check-out` | Check out and mark room not ready |

## Reservation Example

```bash
curl -i -X POST http://localhost:8787/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "guestName": "Ada Lovelace",
    "guestEmail": "ada@example.com",
    "roomId": "101",
    "checkIn": "2030-08-10",
    "checkOut": "2030-08-13"
  }'
```

Availability uses half-open date ranges: a stay occupies `[checkIn, checkOut)`,
so another reservation may begin on the previous reservation's checkout date.

## Error Format

```json
{
  "error": {
    "code": "ROOM_ALREADY_BOOKED",
    "message": "Room is already booked for part of this date range"
  }
}
```

Validation failures return `400`, missing resources return `404`, and business
conflicts such as double booking, invalid state transitions, or unready rooms
return `409`.

## Assumptions

- Data is intentionally stored in memory and resets when the server restarts.
- Room and reservation IDs are strings; generated reservation IDs are deterministic.
- Seed rooms are `101`, `102`, `201`, and `202`; room `201` starts unready.
- Reservations require a selected `roomId`; room assignment is part of creation.
- New reservations cannot start in the past or use a room currently marked unready.
- Guests may cancel only while status is `reserved` and before the check-in date.
- Check-in is allowed from the check-in date through the day before checkout.
- Checkout marks the room unready; housekeeping must mark it ready again.
- An occupied room cannot be marked ready.
- Cancelled and checked-out stays no longer block future date ranges.
