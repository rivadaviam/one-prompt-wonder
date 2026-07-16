import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { app } from "../server/app.js";
import { resetHotelData } from "../server/store.js";

const server = await new Promise((resolve) => {
  const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
});

const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;
const execFileAsync = promisify(execFile);
let checks = 0;

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
  checks += 1;
  console.log(`[ok] ${message}`);
}

async function curl(method, path, body) {
  const marker = "__ONE_PROMPT_META__";
  const args = [
    "-sS",
    "-X",
    method,
    `${baseUrl}${path}`,
    "-H",
    "Accept: application/json",
  ];

  if (body !== undefined) {
    args.push(
      "-H",
      "Content-Type: application/json",
      "--data-binary",
      typeof body === "string" ? body : JSON.stringify(body),
    );
  }

  args.push("-w", `\n${marker}%{http_code}|%{content_type}`);
  const { stdout: output } = await execFileAsync("curl", args, {
    encoding: "utf8",
  });
  const [rawBody, metadata] = output.split(`\n${marker}`);
  const [status, contentType] = metadata.trim().split("|");

  return {
    body: rawBody ? JSON.parse(rawBody) : null,
    contentType,
    status: Number(status),
  };
}

try {
  resetHotelData();
  console.log(`Hotel API curl smoke test against ${baseUrl}\n`);

  const health = await curl("GET", "/api/health");
  assert(health.status === 200, "health endpoint returns 200");
  assert(health.contentType.includes("application/json"), "responses are JSON");

  const availability = await curl(
    "GET",
    `/api/rooms/available?checkIn=${isoDate(3)}&checkOut=${isoDate(5)}`,
  );
  assert(availability.status === 200, "availability query succeeds");
  assert(availability.body.data.length === 3, "unready rooms are unavailable");

  const created = await curl("POST", "/api/reservations", {
    guestName: "Smoke Guest",
    guestEmail: "smoke@example.com",
    roomId: "101",
    checkIn: isoDate(3),
    checkOut: isoDate(5),
  });
  assert(created.status === 201, "reservation returns 201");
  assert(created.body.data.id === "res-1", "reservation ID is deterministic");

  const overlap = await curl("POST", "/api/reservations", {
    guestName: "Second Guest",
    roomId: "101",
    checkIn: isoDate(4),
    checkOut: isoDate(6),
  });
  assert(overlap.status === 409, "double booking returns 409");

  const cancelled = await curl("POST", "/api/reservations/res-1/cancel");
  assert(cancelled.body.data.status === "cancelled", "future stay can be cancelled");

  const stay = await curl("POST", "/api/reservations", {
    guestName: "Today Guest",
    roomId: "102",
    checkIn: isoDate(0),
    checkOut: isoDate(2),
  });
  assert(stay.status === 201, "same-day reservation succeeds");

  const checkedIn = await curl(
    "POST",
    `/api/reservations/${stay.body.data.id}/check-in`,
  );
  assert(checkedIn.body.data.status === "checked_in", "reception can check in guest");

  const checkedOut = await curl(
    "POST",
    `/api/reservations/${stay.body.data.id}/check-out`,
  );
  assert(checkedOut.body.data.status === "checked_out", "reception can check out guest");

  const prepared = await curl("PATCH", "/api/rooms/102/readiness", {
    ready: true,
  });
  assert(prepared.body.data.ready === true, "housekeeping can mark room ready");

  const malformed = await curl("POST", "/api/reservations", '{"guestName":');
  assert(malformed.status === 400, "malformed JSON returns 400");

  const missing = await curl("GET", "/api/unknown");
  assert(missing.status === 404, "unknown API route returns 404");

  console.log(`\nSmoke test passed with ${checks} checks.`);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
