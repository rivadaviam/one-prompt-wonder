const starterRooms = [
  { id: "101", type: "single", capacity: 1, ready: true },
  { id: "102", type: "double", capacity: 2, ready: true },
  { id: "201", type: "double", capacity: 2, ready: false },
  { id: "202", type: "suite", capacity: 4, ready: true },
];

const blockingStatuses = new Set(["reserved", "checked_in"]);

let rooms = [];
let reservations = [];
let nextReservationId = 1;

function clone(value) {
  return value ? { ...value } : value;
}

export function resetHotelData() {
  rooms = starterRooms.map(clone);
  reservations = [];
  nextReservationId = 1;
}

export function listRooms() {
  return rooms.map(clone);
}

export function findRoom(id) {
  return clone(rooms.find((room) => room.id === id) ?? null);
}

export function setRoomReadiness(id, ready) {
  const room = rooms.find((candidate) => candidate.id === id);
  if (!room) return null;
  room.ready = ready;
  return clone(room);
}

export function isRoomOccupied(id) {
  return reservations.some(
    (reservation) =>
      reservation.roomId === id && reservation.status === "checked_in",
  );
}

export function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return firstStart < secondEnd && secondStart < firstEnd;
}

export function roomHasConflict(roomId, checkIn, checkOut, excludeId = null) {
  return reservations.some(
    (reservation) =>
      reservation.id !== excludeId &&
      reservation.roomId === roomId &&
      blockingStatuses.has(reservation.status) &&
      rangesOverlap(
        checkIn,
        checkOut,
        reservation.checkIn,
        reservation.checkOut,
      ),
  );
}

export function listAvailableRooms(checkIn, checkOut) {
  return rooms
    .filter(
      (room) =>
        room.ready && !roomHasConflict(room.id, checkIn, checkOut),
    )
    .map(clone);
}

export function listReservations(status) {
  return reservations
    .filter((reservation) => !status || reservation.status === status)
    .map(clone);
}

export function findReservation(id) {
  return clone(
    reservations.find((reservation) => reservation.id === id) ?? null,
  );
}

export function createReservation(input) {
  const reservation = {
    id: `res-${nextReservationId++}`,
    ...input,
    status: "reserved",
  };
  reservations.push(reservation);
  return clone(reservation);
}

export function setReservationStatus(id, status) {
  const reservation = reservations.find((candidate) => candidate.id === id);
  if (!reservation) return null;
  reservation.status = status;
  return clone(reservation);
}

resetHotelData();
