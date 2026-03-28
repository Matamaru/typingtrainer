type BuildOfflineCacheUrlListOptions = {
  basePath: string;
  pageUrl: string;
  resourceUrls: string[];
};

function normalizeSameOriginUrl(rawUrl: string, origin: string) {
  try {
    const url = new URL(rawUrl, origin);

    if (url.origin !== origin) {
      return null;
    }

    url.hash = "";

    return url.href;
  } catch {
    return null;
  }
}

export function buildOfflineCacheUrlList(options: BuildOfflineCacheUrlListOptions) {
  const page = new URL(options.pageUrl);
  const base = new URL(options.basePath, page.origin);

  const candidates = [
    page.href,
    base.href,
    new URL("index.html", base).href,
    new URL("manifest.webmanifest", base).href,
    new URL("favicon.svg", base).href,
    ...options.resourceUrls,
  ];

  const uniqueUrls = new Set<string>();

  for (const candidate of candidates) {
    const normalized = normalizeSameOriginUrl(candidate, page.origin);

    if (!normalized) {
      continue;
    }

    uniqueUrls.add(normalized);
  }

  return [...uniqueUrls];
}

export function getLoadedSameOriginResourceUrls() {
  return performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((name) => {
      try {
        return new URL(name).origin === window.location.origin;
      } catch {
        return false;
      }
    });
}
