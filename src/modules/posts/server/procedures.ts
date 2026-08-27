import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { posts, postsInsertSchema, postsUpdateSchema } from "@/db/schema/posts";
import { db } from "@/db/drizzle";
import { z } from "zod";
import { and, eq, lt, or, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";

import { PUBLIC_JOURNEYS_CACHE_TAG } from "@/lib/cache-tags";

export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(postsInsertSchema)
    .mutation(async ({ input }) => {
      // 如果slug为空，则使用id作为slug
      const values = {
        ...input,
        id: input.id ?? crypto.randomUUID(),
        slug: input.slug || crypto.randomUUID(), // 使用随机ID作为默认slug
      };

      await db.insert(posts).values(values);
      const [newPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, values.id))
        .limit(1);

      revalidateTag(PUBLIC_JOURNEYS_CACHE_TAG, { expire: 0 });
      return newPost;
    }),
  update: protectedProcedure
    .input(postsUpdateSchema)
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      await db
        .update(posts)
        .set({
          ...input,
        })
        .where(eq(posts.id, id));

      const [updatedPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);

      if (!updatedPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      revalidateTag(PUBLIC_JOURNEYS_CACHE_TAG, { expire: 0 });
      return updatedPost;
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [deletedPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);

      if (!deletedPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db.delete(posts).where(eq(posts.id, id));

      revalidateTag(PUBLIC_JOURNEYS_CACHE_TAG, { expire: 0 });
      return deletedPost;
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const { postId } = input;

      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      return post;
    }),
  getMany: protectedProcedure
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
});
