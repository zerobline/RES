import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { deliverTrialBooking } = require("../booking-form.js");

function calls(impl) {
  const seen = [];
  const fetchImpl = async (url, opts) => {
    seen.push({ url, opts });
    return impl();
  };
  return { fetchImpl, seen };
}

test("reports success only when the delivery response is ok", async () => {
  const { fetchImpl, seen } = calls(async () => ({ ok: true, status: 200 }));
  const body = new URLSearchParams({
    "form-name": "trial-booking",
    name: "Ada Example",
    email: "ada@example.com",
    child_age: "8 years old",
    message: "Speaking confidence",
    "bot-field": ""
  }).toString();

  const result = await deliverTrialBooking(body, fetchImpl);

  assert.deepEqual(result, { ok: true, status: 200 });
  assert.equal(seen.length, 1);
  assert.equal(seen[0].url, "/");
  assert.equal(seen[0].opts.method, "POST");
  assert.equal(seen[0].opts.headers["Content-Type"], "application/x-www-form-urlencoded");
  const posted = new URLSearchParams(seen[0].opts.body);
  assert.equal(posted.get("form-name"), "trial-booking");
  assert.equal(posted.get("name"), "Ada Example");
  assert.equal(posted.get("email"), "ada@example.com");
  assert.equal(posted.get("child_age"), "8 years old");
  assert.equal(posted.get("message"), "Speaking confidence");
  assert.equal(posted.get("bot-field"), "");
});

test("reports failure on an HTTP error and does not treat it as sent", async () => {
  for (const status of [400, 404, 500, 502]) {
    const { fetchImpl } = calls(async () => ({ ok: false, status }));
    const result = await deliverTrialBooking("form-name=trial-booking", fetchImpl);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "http");
    assert.equal(result.status, status);
  }
});

test("reports failure when the network request rejects", async () => {
  const result = await deliverTrialBooking("form-name=trial-booking", async () => {
    throw new TypeError("Failed to fetch");
  });
  assert.deepEqual(result, { ok: false, reason: "network" });
});

test("reports failure when fetch returns no response", async () => {
  const result = await deliverTrialBooking("form-name=trial-booking", async () => null);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "http");
});
