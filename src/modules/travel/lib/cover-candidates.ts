export const getCoverCandidates = (urls: string[]) =>
  Array.from(new Set(urls.filter(Boolean))).flatMap((src) => {
    const candidates = [{ src, unoptimized: false }];
    try {
      const original = new URL(src);
      // Retry a failed Qiniu transform against the original object. Other hosts
      // may use query parameters for access, so leave their URLs intact.
      if (original.hostname === "cdn.ytools.xyz") {
        original.search = "";
        original.hash = "";
        candidates.push({ src: original.toString(), unoptimized: true });
      }
    } catch {
      // Local images have no separate CDN transform to retry.
    }
    return candidates;
  });
