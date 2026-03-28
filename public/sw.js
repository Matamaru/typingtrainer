const CACHE_VERSION = "typingtrainer-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

function getScopeUrl(relativePath = "") {
  return new URL(relativePath, self.registration.scope).href;
}

const precacheUrls = [
  getScopeUrl(),
  getScopeUrl("index.html"),
  getScopeUrl("manifest.webmanifest"),
  getScopeUrl("favicon.svg"),
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(precacheUrls)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.payload)) {
    return;
  }

  const urls = event.data.payload
    .map((entry) => {
      try {
        const url = new URL(entry, self.location.origin);

        if (url.origin !== self.location.origin) {
          return null;
        }

        url.hash = "";

        return url.href;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) =>
      Promise.allSettled(urls.map((url) => cache.add(url))),
    ),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    void fetch(request)
      .then((response) => {
        if (response.ok) {
          void cache.put(request, response.clone());
        }
      })
      .catch(() => undefined);

    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

async function handleNavigation(request) {
  const shellCache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await shellCache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedRoute = await shellCache.match(request);

    if (cachedRoute) {
      return cachedRoute;
    }

    const cachedIndex =
      (await shellCache.match(getScopeUrl("index.html"))) ?? (await shellCache.match(getScopeUrl()));

    if (cachedIndex) {
      return cachedIndex;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  const cacheableDestination = ["script", "style", "image", "font", "manifest"];

  if (cacheableDestination.includes(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
