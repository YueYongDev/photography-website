import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { db } from "@/db/drizzle";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { citySets } from "@/db/schema/photos";
import { z } from "zod";
import { unstable_cache } from "next/cache";
import { PUBLIC_PHOTOS_CACHE_TAG } from "@/lib/cache-tags";

const getCachedTravelArchive = unstable_cache(
  async (limit: number) => {
    const items = await db.query.citySets.findMany({
      columns: {
        id: true,
        description: true,
        country: true,
        countryCode: true,
        city: true,
        photoCount: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        coverPhoto: {
          columns: {
            id: true,
            url: true,
            title: true,
            blurData: true,
            width: true,
            height: true,
            aspectRatio: true,
            dateTimeOriginal: true,
            captureTimezoneOffset: true,
          },
        },
      },
      orderBy: [desc(citySets.updatedAt)],
      limit,
    });

    return { items };
  },
  ["travel-archive-v2"],
  { revalidate: 300, tags: [PUBLIC_PHOTOS_CACHE_TAG] }
);

export const travelRouter = createTRPCRouter({
  getLatestTravel: baseProcedure.query(async () => {
    const [latestTravel] = await db.query.citySets.findMany({
      with: {
        coverPhoto: true,
      },
      orderBy: desc(citySets.createdAt),
      limit: 1,
    });

    return latestTravel;
  }),
  getArchive: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(60).default(48),
      })
    )
    .query(async ({ input }) => getCachedTravelArchive(input.limit)),
  getCitySets: protectedProcedure
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
        columns: {
          id: true,
          description: true,
          country: true,
          countryCode: true,
          city: true,
          coverPhotoId: true,
          photoCount: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          coverPhoto: {
            columns: {
              id: true,
              url: true,
              title: true,
              blurData: true,
              width: true,
              height: true,
              aspectRatio: true,
              longitude: true,
              latitude: true,
              dateTimeOriginal: true,
              captureTimezoneOffset: true,
            },
          },
          photos: {
            columns: {
              id: true,
              longitude: true,
              latitude: true,
            },
            limit: 24,
          },
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
      const nextCursor = hasMore && lastItem
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return { items, nextCursor };
    }),
});
