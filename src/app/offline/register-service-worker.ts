import { buildOfflineCacheUrlList, getLoadedSameOriginResourceUrls } from "./cache-list";

function canRegisterServiceWorker() {
  return import.meta.env.PROD && "serviceWorker" in navigator;
}

async function sendCacheUrlsToServiceWorker() {
  const registration = await navigator.serviceWorker.ready;
  const activeWorker =
    registration.active ?? registration.waiting ?? registration.installing ?? null;

  if (!activeWorker) {
    return;
  }

  activeWorker.postMessage({
    type: "CACHE_URLS",
    payload: buildOfflineCacheUrlList({
      basePath: import.meta.env.BASE_URL,
      pageUrl: window.location.href,
      resourceUrls: getLoadedSameOriginResourceUrls(),
    }),
  });
}

export async function registerServiceWorker() {
  if (!canRegisterServiceWorker()) {
    return;
  }

  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  const serviceWorkerUrl = new URL("sw.js", baseUrl);

  await navigator.serviceWorker.register(serviceWorkerUrl, {
    scope: baseUrl.pathname,
  });

  const scheduleCacheSync = () => {
    void sendCacheUrlsToServiceWorker();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(scheduleCacheSync);
  } else {
    globalThis.setTimeout(scheduleCacheSync, 250);
  }
}
