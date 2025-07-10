import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db/drizzle";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { citySets } from "@/db/schema/photos";
import { z } from "zod";

export const travelRouter = createTRPCRouter({
  getLatestTravel: baseProcedure.query(async () => {
    const [latestTravel] = await db.query.citySets.findMany({
      with: {
        photos: true,
        coverPhoto: true,
      },
      orderBy: desc(citySets.createdAt),
      limit: 1,
    });

    return latestTravel;
  }),
  getCitySets: baseProcedure
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

      const data = await db.query.citySets.findMany({
        with: {
          coverPhoto: true,
          photos: true,
        },
        where: cursor
          ? or(
              lt(citySets.updatedAt, cursor.updatedAt),
              and(
                eq(citySets.updatedAt, cursor.updatedAt),
                lt(citySets.id, cursor.id)
              )
            )
          : undefined,
        orderBy: [desc(citySets.updatedAt)],
        limit: limit + 1,
      });

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
