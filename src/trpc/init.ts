import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { getCurrentSession } from "@/modules/auth/lib/auth";

export const createTRPCContext = cache(async () => {
  // Public procedures should not pay for an authentication database lookup.
  // Protected procedures invoke this lazy request-cached function below.
  return { getSession: getCurrentSession };
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
  const session = await ctx.getSession();

  if (!session?.user.id) {
    throw new Error("Not authenticated");
  }

  return opts.next({
    ctx: {
      ...ctx,
      userId: session.user.id,
      session,
    },
  });
});
