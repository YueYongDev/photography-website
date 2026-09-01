import { db } from "@/db/drizzle";
import { citySets, photos } from "@/db/schema/photos";
import { posts } from "@/db/schema/posts";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, gte, isNotNull, or, sql } from "drizzle-orm";

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
        .select({ count: count() })
        .from(photos)
        .limit(1),
      db
        .select({ count: count() })
        .from(citySets)
        .limit(1),
      db
        .select({ count: count() })
        .from(posts)
        .limit(1),
      db
        .select({ count: count() })
        .from(photos)
        .where(
          or(
            eq(photos.isFavorite, true),
            eq(photos.visibility, "public"),
          ),
        )
        .limit(1),
      db
        .select({
          year: sql<number>`YEAR(${photos.dateTimeOriginal})`,
          count: count(),
        })
        .from(photos)
        .where(
          and(
            isNotNull(photos.dateTimeOriginal),
            gte(sql<number>`YEAR(${photos.dateTimeOriginal})`, startYear)
          )
        )
        .groupBy(sql`YEAR(${photos.dateTimeOriginal})`)
        .orderBy(desc(sql`YEAR(${photos.dateTimeOriginal})`)),
      db
        .select({
          city: citySets.city,
          photoCount: citySets.photoCount,
          countryCode: citySets.countryCode,
        })
        .from(citySets)
        .orderBy(desc(citySets.photoCount))
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
        yearCounts[year] = Number(count);
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
