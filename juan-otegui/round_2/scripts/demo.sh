#!/bin/sh
set -eu

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"
TODAY="$(python3 -c 'from datetime import date; print(date.today().isoformat())')"
TOMORROW="$(python3 -c 'from datetime import date, timedelta; print((date.today() + timedelta(days=1)).isoformat())')"

echo "Health"
curl --fail --silent --show-error "$BASE_URL/health"
echo

echo "Available rooms for $TODAY to $TOMORROW"
AVAILABLE="$(curl --fail --silent --show-error "$BASE_URL/rooms/availability?check_in=$TODAY&check_out=$TOMORROW")"
echo "$AVAILABLE"
ROOM_ID="$(printf '%s' "$AVAILABLE" | python3 -c 'import json,sys; rooms=json.load(sys.stdin)["data"]["rooms"]; print(rooms[0]["id"] if rooms else "")')"
if [ -z "$ROOM_ID" ]; then
  echo "No ready room is available for the demo dates" >&2
  exit 1
fi

echo "Reserve room $ROOM_ID"
RESERVATION="$(curl --fail --silent --show-error -X POST "$BASE_URL/reservations" \
  -H 'Content-Type: application/json' \
  -d "{\"guest_name\":\"Ada Lovelace\",\"guest_email\":\"ada@example.com\",\"room_id\":$ROOM_ID,\"check_in\":\"$TODAY\",\"check_out\":\"$TOMORROW\"}")"
echo "$RESERVATION"
RESERVATION_ID="$(printf '%s' "$RESERVATION" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["id"])')"

echo "Check in reservation $RESERVATION_ID"
curl --fail --silent --show-error -X POST "$BASE_URL/reservations/$RESERVATION_ID/check-in"
echo

echo "Check out reservation $RESERVATION_ID"
curl --fail --silent --show-error -X POST "$BASE_URL/reservations/$RESERVATION_ID/check-out"
echo

echo "Mark room $ROOM_ID ready"
curl --fail --silent --show-error -X POST "$BASE_URL/rooms/$ROOM_ID/ready"
echo
