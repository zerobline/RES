// Trial-booking delivery. Success is only a real HTTP success response.
// A network error or an HTTP error must not be reported as sent.
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RiehenBooking = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function deliverTrialBooking(body, fetchImpl) {
    var fetchFn = fetchImpl || fetch;
    return Promise.resolve()
      .then(function () {
        return fetchFn("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body
        });
      })
      .then(function (response) {
        if (response && response.ok) return { ok: true, status: response.status };
        return { ok: false, reason: "http", status: response ? response.status : 0 };
      })
      .catch(function () {
        return { ok: false, reason: "network" };
      });
  }

  return { deliverTrialBooking: deliverTrialBooking };
});
