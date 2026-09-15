/**
 * Service worker — барномаи насбшуда бе хатогӣ кор кунад.
 * API ва POST кеш намешаванд (ИИ бояд зинда бошад).
 */
const CACHE = "bp-shell-v2";
const OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.allSettled([OFFLINE, "/icon-192.png", "/icon-512.png"].map((url) => cache.add(url))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

function isNextDev(url) {
  return url.pathname.startsWith("/_next/");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (isApi(url)) return;

  const host = self.location.hostname;
  const local = host === "localhost" || host === "127.0.0.1";
  if (local && isNextDev(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE).then((row) => row || new Response("Offline", { status: 503 })),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(request);
        try {
          const response = await fetch(request);
          if (response.ok) void cache.put(request, response.clone());
          return response;
        } catch {
          return hit || new Response("", { status: 504 });
        }
      }),
    );
  }
});
