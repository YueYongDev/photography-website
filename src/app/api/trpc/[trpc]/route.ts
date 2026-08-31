import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = async (req: Request) => {
  const startedAt = performance.now();
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

  const headers = new Headers(response.headers);
  headers.append(
    "Server-Timing",
    `trpc;dur=${(performance.now() - startedAt).toFixed(1)}`,
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export { handler as GET, handler as POST };
