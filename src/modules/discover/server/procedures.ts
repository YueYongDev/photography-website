import { db } from "@/db/drizzle";
import { photos } from "@/db/schema/photos";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { z } from "zod";

export const mapRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(500).default(200),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      const whereClause = and(
        eq(photos.visibility, "public"),
        cursor
          ? or(
              lt(photos.updatedAt, cursor.updatedAt),
              and(
                eq(photos.updatedAt, cursor.updatedAt),
                lt(photos.id, cursor.id)
              )
            )
          : undefined
      );

      const data = await db
        .select()
        .from(photos)
        .where(whereClause)
        .orderBy(desc(photos.updatedAt), desc(photos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
});
