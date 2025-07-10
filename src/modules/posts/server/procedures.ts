import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { posts, postsInsertSchema, postsUpdateSchema } from "@/db/schema/posts";
import { db } from "@/db/drizzle";
import { z } from "zod";
import { and, eq, lt, or, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(postsInsertSchema)
    .mutation(async ({ input }) => {
      const values = input;

      const [newPost] = await db.insert(posts).values(values).returning();

      return newPost;
    }),
  update: protectedProcedure
    .input(postsUpdateSchema)
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updatedPost] = await db
        .update(posts)
        .set({
          ...input,
        })
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedPost;
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [deletedPost] = await db
        .delete(posts)
        .where(eq(posts.id, id))
        .returning();

      if (!deletedPost) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedPost;
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
      })
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
      })
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
});
