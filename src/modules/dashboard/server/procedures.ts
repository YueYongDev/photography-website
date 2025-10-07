import { db } from "@/db/drizzle";
import { citySets, photos } from "@/db/schema/photos";
import { posts } from "@/db/schema/posts";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, sql } from "drizzle-orm";

export const summaryRouter = createTRPCRouter({
  getSummary: protectedProcedure.query(async () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;

    const [
      photoCountRows,
      cityCountRows,
      postCountRows,
      favoritePhotoRows,
      yearlyStats,
      topCities,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(photos)
        .limit(1),
      db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(citySets)
        .limit(1),
      db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(posts)
        .limit(1),
      db
        .select({ count: sql<number>`COUNT(*)::integer` })
        .from(photos)
        .where(eq(photos.isFavorite, true))
        .limit(1),
      db
        .select({
          year: sql<number>`EXTRACT(YEAR FROM ${photos.dateTimeOriginal})::integer`,
          count: sql<number>`COUNT(*)::integer`,
        })
        .from(photos)
        .where(
          sql`${photos.dateTimeOriginal} IS NOT NULL AND EXTRACT(YEAR FROM ${photos.dateTimeOriginal}) >= ${startYear}`
        )
        .groupBy(sql`EXTRACT(YEAR FROM ${photos.dateTimeOriginal})`)
        .orderBy(sql`EXTRACT(YEAR FROM ${photos.dateTimeOriginal}) DESC`),
      db
        .select({
          city: citySets.city,
          photoCount: citySets.photoCount,
          countryCode: citySets.countryCode,
        })
        .from(citySets)
        .orderBy(sql`${citySets.photoCount} DESC`)
        .limit(5),
    ]);

    const photoCount = photoCountRows[0]?.count ?? 0;
    const cityCount = cityCountRows[0]?.count ?? 0;
    const postCount = postCountRows[0]?.count ?? 0;
    const favoriteCount = favoritePhotoRows[0]?.count ?? 0;

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
        photoCount,
        cityCount,
        yearlyStats: yearCounts,
        topCities,
        postCount,
        favoriteCount,
      },
    };
  }),
});
