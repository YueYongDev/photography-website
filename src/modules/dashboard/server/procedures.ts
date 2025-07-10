import { db } from "@/db/drizzle";
import { citySets, photos } from "@/db/schema/photos";
import { posts } from "@/db/schema/posts";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { sql } from "drizzle-orm";

export const summaryRouter = createTRPCRouter({
  getSummary: protectedProcedure.query(async () => {
    const photosData = await db.select().from(photos);
    const citySetsData = await db.select().from(citySets);
    const postsData = await db.select().from(posts);

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;

    const yearlyStats = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${photos.dateTimeOriginal})::integer`,
        count: sql<number>`COUNT(*)::integer`,
      })
      .from(photos)
      .where(
        sql`${photos.dateTimeOriginal} IS NOT NULL AND EXTRACT(YEAR FROM ${photos.dateTimeOriginal}) >= ${startYear}`
      )
      .groupBy(sql`EXTRACT(YEAR FROM ${photos.dateTimeOriginal})`)
      .orderBy(sql`EXTRACT(YEAR FROM ${photos.dateTimeOriginal}) DESC`);

    const topCities = await db
      .select({
        city: citySets.city,
        photoCount: citySets.photoCount,
        countryCode: citySets.countryCode,
      })
      .from(citySets)
      .orderBy(sql`${citySets.photoCount} DESC`)
      .limit(5);

    const yearCounts: Record<number, number> = {};
    for (let year = currentYear; year >= startYear; year--) {
      yearCounts[year] = 0;
    }

    yearlyStats.forEach(({ year, count }) => {
      if (year >= startYear && year <= currentYear) {
        yearCounts[year] = count;
      }
    });

    return {
      data: {
        photoCount: photosData.length,
        cityCount: citySetsData.length,
        yearlyStats: yearCounts,
        topCities,
        postCount: postsData.length,
      },
    };
  }),
});
