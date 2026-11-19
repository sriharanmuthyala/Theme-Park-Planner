// Theme Park Planner service worker: lets the planner open with poor or no signal.
// - The page itself: network first (4 s), falling back to the last saved copy.
// - Live waits and weather: network first (8 s), falling back to the last answer, which the app labels with its age.
// - Icons and other files: saved copy first.
const V = "tpp-v1";
const SHELL = ["./", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

function withTimeout(ms, p) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(t); res(v); }, (e) => { clearTimeout(t); rej(e); });
  });
}
function save(key, res) {
  if (res && res.ok) { const c = res.clone(); caches.open(V).then((x) => x.put(key, c)); }
  return res;
}
function networkFirst(req, ms) {
  return withTimeout(ms, fetch(req)).then((res) => save(req, res)).catch(() =>
    caches.match(req).then((m) => m || new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } }))
  );
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) {
    if (u.hostname === "api.weather.gov" || u.hostname === "api.open-meteo.com") e.respondWith(networkFirst(req, 8000));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(
      withTimeout(4000, fetch(req)).then((res) => save(new URL("./", self.registration.scope).href, res))
        .catch(() => caches.match(new URL("./", self.registration.scope).href))
    );
    return;
  }
  if (u.pathname.includes("/api/")) { e.respondWith(networkFirst(req, 8000)); return; }
  e.respondWith(caches.match(req).then((m) => m || fetch(req).then((res) => save(req, res))));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      for (const c of cs) if ("focus" in c) return c.focus();
      return self.clients.openWindow("./");
    })
  );
});
