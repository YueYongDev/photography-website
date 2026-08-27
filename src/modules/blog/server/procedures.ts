import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { posts } from "@/db/schema/posts";
import { db } from "@/db/drizzle";
import { z } from "zod";
import { and, eq, lt, or, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { unstable_cache } from "next/cache";

import { PUBLIC_JOURNEYS_CACHE_TAG } from "@/lib/cache-tags";

const getCachedJourneyIndex = unstable_cache(
  async (limit: number) =>
    db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        tags: posts.tags,
        coverImage: posts.coverImage,
        description: posts.description,
        readingTimeMinutes: posts.readingTimeMinutes,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.visibility, "public"))
      .orderBy(desc(posts.updatedAt))
      .limit(limit),
  ["public-journey-index-v1"],
  { revalidate: 300, tags: [PUBLIC_JOURNEYS_CACHE_TAG] },
);

const getCachedPublicStory = unstable_cache(
  async (slug: string) => {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slug,
      );
    const storyCondition = isUuid
      ? or(eq(posts.slug, slug), eq(posts.id, slug))
      : eq(posts.slug, slug);

    const [story] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.visibility, "public"), storyCondition))
      .limit(1);

    return story || null;
  },
  ["public-journey-story-v1"],
  { revalidate: 300, tags: [PUBLIC_JOURNEYS_CACHE_TAG] },
);

export const blogRouter = createTRPCRouter({
  getJourneyIndex: baseProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(24) }))
    .query(({ input }) => getCachedJourneyIndex(input.limit)),
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
      }),
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
                    lt(posts.id, cursor.id),
                  ),
                )
              : undefined,
          ),
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
      const blog = await getCachedPublicStory(input.slug);

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
