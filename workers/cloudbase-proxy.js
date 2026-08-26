const ORIGIN =
  "https://photo-site-web-direct-303209-11-1253563876.sh.run.tcloudbase.com";
const PUBLIC_ORIGIN = "https://p.yueyong.fun";

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, ORIGIN);
    const headers = new Headers(request.headers);

    headers.set("host", target.host);
    headers.set("x-forwarded-host", incoming.host);
    headers.set("x-forwarded-proto", "https");

    if (
      incoming.origin === PUBLIC_ORIGIN &&
      incoming.pathname.startsWith("/api/auth/")
    ) {
      if (headers.get("origin") === PUBLIC_ORIGIN) {
        headers.set("origin", ORIGIN);
      }

      const referer = headers.get("referer");
      if (referer?.startsWith(PUBLIC_ORIGIN + "/")) {
        headers.set("referer", ORIGIN + referer.slice(PUBLIC_ORIGIN.length));
      }
    }

    const upstream = await fetch(
      new Request(target, {
        method: request.method,
        headers,
        body:
          request.method === "GET" || request.method === "HEAD"
            ? undefined
            : request.body,
        redirect: "manual",
      })
    );

    const responseHeaders = new Headers(upstream.headers);
    const location = responseHeaders.get("location");
    if (location?.startsWith(ORIGIN)) {
      responseHeaders.set(
        "location",
        incoming.origin + location.slice(ORIGIN.length)
      );
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  },
};
