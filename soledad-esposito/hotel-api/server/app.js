import cors from "cors";
import express from "express";
import { z } from "zod";

import {
  createReservation,
  findReservation,
  findRoom,
  isRoomOccupied,
  listAvailableRooms,
  listReservations,
  listRooms,
  roomHasConflict,
  setReservationStatus,
  setRoomReadiness,
} from "./store.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isRealIsoDate(value) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isRealIsoDate, "Invalid calendar date");

const dateRangeSchema = z
  .object({
    checkIn: dateSchema,
    checkOut: dateSchema,
  })
  .refine((range) => range.checkIn < range.checkOut, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

const reservationSchema = z
  .object({
    guestName: z.string().trim().min(1).max(120),
    guestEmail: z.string().trim().email().max(254).optional(),
    roomId: z.string().trim().regex(/^\d+$/),
    checkIn: dateSchema,
    checkOut: dateSchema,
  })
  .refine((reservation) => reservation.checkIn < reservation.checkOut, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

const readinessSchema = z.object({ ready: z.boolean() }).strict();
const reservationStatusSchema = z.enum([
  "reserved",
  "checked_in",
  "checked_out",
  "cancelled",
]);

function sendError(response, status, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  return response.status(status).json({ error });
}

function validationError(response, result) {
  return sendError(
    response,
    400,
    "VALIDATION_ERROR",
    "Request validation failed",
    result.error.flatten(),
  );
}

function requireReservation(request, response) {
  const reservation = findReservation(request.params.id);
  if (!reservation) {
    sendError(response, 404, "RESERVATION_NOT_FOUND", "Reservation not found");
    return null;
  }
  return reservation;
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "hotel-reservations" });
});

app.get("/api/rooms", (_request, response) => {
  response.json({ data: listRooms() });
});

app.get("/api/rooms/available", (request, response) => {
  const result = dateRangeSchema.safeParse(request.query);
  if (!result.success) return validationError(response, result);

  return response.json({
    data: listAvailableRooms(result.data.checkIn, result.data.checkOut),
    meta: result.data,
  });
});

app.patch("/api/rooms/:id/readiness", (request, response) => {
  const result = readinessSchema.safeParse(request.body);
  if (!result.success) return validationError(response, result);

  const room = findRoom(request.params.id);
  if (!room) {
    return sendError(response, 404, "ROOM_NOT_FOUND", "Room not found");
  }

  if (result.data.ready && isRoomOccupied(room.id)) {
    return sendError(
      response,
      409,
      "ROOM_OCCUPIED",
      "An occupied room cannot be marked as ready",
    );
  }

  return response.json({ data: setRoomReadiness(room.id, result.data.ready) });
});

app.get("/api/reservations", (request, response) => {
  const statusResult = request.query.status
    ? reservationStatusSchema.safeParse(request.query.status)
    : { success: true, data: undefined };

  if (!statusResult.success) return validationError(response, statusResult);
  return response.json({ data: listReservations(statusResult.data) });
});

app.get("/api/reservations/:id", (request, response) => {
  const reservation = requireReservation(request, response);
  if (!reservation) return;
  return response.json({ data: reservation });
});

app.post("/api/reservations", (request, response) => {
  const result = reservationSchema.safeParse(request.body);
  if (!result.success) return validationError(response, result);

  const input = result.data;
  if (input.checkIn < todayIso()) {
    return sendError(
      response,
      400,
      "PAST_CHECK_IN",
      "checkIn cannot be in the past",
    );
  }

  const room = findRoom(input.roomId);
  if (!room) {
    return sendError(response, 404, "ROOM_NOT_FOUND", "Room not found");
  }
  if (!room.ready) {
    return sendError(
      response,
      409,
      "ROOM_NOT_READY",
      "Room is not ready for assignment",
    );
  }
  if (roomHasConflict(input.roomId, input.checkIn, input.checkOut)) {
    return sendError(
      response,
      409,
      "ROOM_ALREADY_BOOKED",
      "Room is already booked for part of this date range",
    );
  }

  const reservation = createReservation(input);
  response.location(`/api/reservations/${reservation.id}`);
  return response.status(201).json({ data: reservation });
});

app.post("/api/reservations/:id/cancel", (request, response) => {
  const reservation = requireReservation(request, response);
  if (!reservation) return;

  if (reservation.status !== "reserved") {
    return sendError(
      response,
      409,
      "INVALID_RESERVATION_STATE",
      "Only reserved stays can be cancelled",
    );
  }
  if (todayIso() >= reservation.checkIn) {
    return sendError(
      response,
      409,
      "CANCELLATION_WINDOW_CLOSED",
      "Reservation can only be cancelled before the check-in date",
    );
  }

  return response.json({
    data: setReservationStatus(reservation.id, "cancelled"),
  });
});

app.post("/api/reservations/:id/check-in", (request, response) => {
  const reservation = requireReservation(request, response);
  if (!reservation) return;

  if (reservation.status !== "reserved") {
    return sendError(
      response,
      409,
      "INVALID_RESERVATION_STATE",
      "Only reserved stays can be checked in",
    );
  }

  const today = todayIso();
  if (today < reservation.checkIn || today >= reservation.checkOut) {
    return sendError(
      response,
      409,
      "OUTSIDE_STAY_DATES",
      "Check-in is only allowed during the reserved stay dates",
    );
  }

  const room = findRoom(reservation.roomId);
  if (!room.ready) {
    return sendError(
      response,
      409,
      "ROOM_NOT_READY",
      "Room must be marked ready before check-in",
    );
  }

  return response.json({
    data: setReservationStatus(reservation.id, "checked_in"),
  });
});

app.post("/api/reservations/:id/check-out", (request, response) => {
  const reservation = requireReservation(request, response);
  if (!reservation) return;

  if (reservation.status !== "checked_in") {
    return sendError(
      response,
      409,
      "INVALID_RESERVATION_STATE",
      "Only checked-in stays can be checked out",
    );
  }

  const updated = setReservationStatus(reservation.id, "checked_out");
  setRoomReadiness(reservation.roomId, false);
  return response.json({ data: updated });
});

app.use("/api", (_request, response) => {
  return sendError(response, 404, "ENDPOINT_NOT_FOUND", "Endpoint not found");
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return sendError(response, 400, "MALFORMED_JSON", "Malformed JSON body");
  }

  console.error(error);
  return sendError(
    response,
    500,
    "INTERNAL_ERROR",
    "Internal server error",
  );
});
