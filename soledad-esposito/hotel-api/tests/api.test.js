import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "../server/app.js";
import { resetHotelData } from "../server/store.js";

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function reservation(overrides = {}) {
  return {
    guestName: "Ada Lovelace",
    guestEmail: "ada@example.com",
    roomId: "101",
    checkIn: isoDate(5),
    checkOut: isoDate(8),
    ...overrides,
  };
}

describe("hotel reservation API", () => {
  beforeEach(() => resetHotelData());

  it("reports service health", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "hotel-reservations",
    });
  });

  it("lists only ready and unbooked rooms for a date range", async () => {
    await request(app).post("/api/reservations").send(reservation());

    const response = await request(app)
      .get("/api/rooms/available")
      .query({ checkIn: isoDate(6), checkOut: isoDate(7) });

    expect(response.status).toBe(200);
    expect(response.body.data.map((room) => room.id)).toEqual(["102", "202"]);
  });

  it("creates reservations with deterministic IDs", async () => {
    const response = await request(app)
      .post("/api/reservations")
      .send(reservation());

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe("/api/reservations/res-1");
    expect(response.body.data).toMatchObject({
      id: "res-1",
      roomId: "101",
      status: "reserved",
    });
  });

  it("prevents overlapping bookings but permits adjacent stays", async () => {
    await request(app).post("/api/reservations").send(reservation());

    const conflict = await request(app)
      .post("/api/reservations")
      .send(reservation({ guestName: "Grace Hopper", checkIn: isoDate(7) }));
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe("ROOM_ALREADY_BOOKED");

    const adjacent = await request(app)
      .post("/api/reservations")
      .send(
        reservation({
          guestName: "Grace Hopper",
          checkIn: isoDate(8),
          checkOut: isoDate(10),
        }),
      );
    expect(adjacent.status).toBe(201);
  });

  it("does not assign rooms that are not ready", async () => {
    const response = await request(app)
      .post("/api/reservations")
      .send(reservation({ roomId: "201" }));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("ROOM_NOT_READY");
  });

  it("allows a guest to cancel before the stay", async () => {
    await request(app).post("/api/reservations").send(reservation());

    const cancelled = await request(app).post("/api/reservations/res-1/cancel");
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe("cancelled");

    const replacement = await request(app)
      .post("/api/reservations")
      .send(reservation({ guestName: "Katherine Johnson" }));
    expect(replacement.status).toBe(201);
  });

  it("supports check-in, check-out, and housekeeping readiness", async () => {
    await request(app)
      .post("/api/reservations")
      .send(reservation({ checkIn: isoDate(0), checkOut: isoDate(2) }));

    const checkedIn = await request(app).post("/api/reservations/res-1/check-in");
    expect(checkedIn.status).toBe(200);
    expect(checkedIn.body.data.status).toBe("checked_in");

    const occupiedReady = await request(app)
      .patch("/api/rooms/101/readiness")
      .send({ ready: true });
    expect(occupiedReady.status).toBe(409);
    expect(occupiedReady.body.error.code).toBe("ROOM_OCCUPIED");

    const checkedOut = await request(app).post(
      "/api/reservations/res-1/check-out",
    );
    expect(checkedOut.status).toBe(200);
    expect(checkedOut.body.data.status).toBe("checked_out");

    const roomsAfterCheckout = await request(app).get("/api/rooms");
    expect(
      roomsAfterCheckout.body.data.find((room) => room.id === "101").ready,
    ).toBe(false);

    const prepared = await request(app)
      .patch("/api/rooms/101/readiness")
      .send({ ready: true });
    expect(prepared.status).toBe(200);
    expect(prepared.body.data.ready).toBe(true);
  });

  it("rejects check-in outside the reserved dates", async () => {
    await request(app).post("/api/reservations").send(reservation());

    const response = await request(app).post("/api/reservations/res-1/check-in");
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("OUTSIDE_STAY_DATES");
  });

  it("validates ranges and malformed JSON", async () => {
    const invalidRange = await request(app)
      .get("/api/rooms/available")
      .query({ checkIn: isoDate(4), checkOut: isoDate(4) });
    expect(invalidRange.status).toBe(400);
    expect(invalidRange.body.error.code).toBe("VALIDATION_ERROR");

    const malformed = await request(app)
      .post("/api/reservations")
      .set("Content-Type", "application/json")
      .send('{"guestName":');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe("MALFORMED_JSON");
  });
});
