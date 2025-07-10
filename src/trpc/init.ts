import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { auth } from "@/modules/auth/lib/auth";
import { headers } from "next/headers";

// Types
import type { Session } from "@/modules/auth/lib/auth-types";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const session: Session | null = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id ?? null;

  return { userId };
});

// Types
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async function isAuthed(
  opts
) {
  const { ctx } = opts;

  if (!ctx.userId) {
    throw new Error("Not authenticated");
  }

  return opts.next({
    ctx: {
      ...ctx,
    },
  });
});
