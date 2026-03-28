import { describe, expect, it } from "vitest";

import { buildOfflineCacheUrlList } from "./cache-list";

describe("buildOfflineCacheUrlList", () => {
  it("includes base shell URLs and deduplicates same-origin assets", () => {
    const urls = buildOfflineCacheUrlList({
      basePath: "/",
      pageUrl: "https://typingtrainer.local/lesson/en-home-row-foundations",
      resourceUrls: [
        "https://typingtrainer.local/assets/index.js",
        "https://typingtrainer.local/assets/index.js#hash",
        "https://typingtrainer.local/assets/index.css",
        "https://cdn.example.com/font.woff2",
      ],
    });

    expect(urls).toContain("https://typingtrainer.local/");
    expect(urls).toContain("https://typingtrainer.local/index.html");
    expect(urls).toContain("https://typingtrainer.local/manifest.webmanifest");
    expect(urls).toContain("https://typingtrainer.local/favicon.svg");
    expect(urls).toContain("https://typingtrainer.local/assets/index.js");
    expect(urls).toContain("https://typingtrainer.local/assets/index.css");
    expect(urls).not.toContain("https://cdn.example.com/font.woff2");
  });
});
