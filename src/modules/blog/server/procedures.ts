import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { posts } from "@/db/schema/posts";
import { db } from "@/db/drizzle";
import { z } from "zod";
import { and, eq, lt, or, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const blogRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const data = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.visibility, "public"),
            cursor
              ? or(
                  lt(posts.updatedAt, cursor.updatedAt),
                  and(
                    eq(posts.updatedAt, cursor.updatedAt),
                    lt(posts.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .limit(limit + 1)
        .orderBy(desc(posts.updatedAt));

      const hasMore = data.length > limit;
      // Remove the last item if there is more data
      const items = hasMore ? data.slice(0, -1) : data;
      // Set the next cursor to the last item if there is more data
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return { items, nextCursor };
    }),
  getOne: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { slug } = input;

      // 首先尝试通过 slug 查找
      let [blog] = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.visibility, "public"),
            eq(posts.slug, slug)
          )
        )
        .limit(1);

      // 如果通过 slug 没找到，且 slug 看起来像 UUID，则尝试通过 id 查找
      if (!blog && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
        [blog] = await db
          .select()
          .from(posts)
          .where(
            and(
              eq(posts.visibility, "public"),
              eq(posts.id, slug)
            )
          )
          .limit(1);
      }

      if (!blog) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog not found",
        });
      }

      return blog;
    }),
  getLatest: baseProcedure.query(async () => {
    const [data] = await db
      .select()
      .from(posts)
      .where(eq(posts.visibility, "public"))
      .orderBy(desc(posts.updatedAt))
      .limit(1);

    // Ensure we return null instead of undefined if no data is found
    return data || null;
  }),
});
