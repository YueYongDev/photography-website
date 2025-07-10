import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  citySets,
  photos,
  photosUpdateSchema,
  photosInsertSchema,
} from "@/db/schema/photos";
import { and, eq, lt, or, desc, sql } from "drizzle-orm";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3-client";

export const photosRouter = createTRPCRouter({
  create: protectedProcedure
    .input(photosInsertSchema)
    .mutation(async ({ input }) => {
      const values = input;

      try {
        const [insertedPhoto] = await db
          .insert(photos)
          .values(values)
          .returning();

        const cityName =
          values.countryCode === "JP" || values.countryCode === "TW"
            ? values.region
            : values.city;

        if (insertedPhoto.country && cityName && insertedPhoto.countryCode) {
          await db
            .insert(citySets)
            .values({
              country: insertedPhoto.country,
              countryCode: insertedPhoto.countryCode,
              city: cityName,
              photoCount: 1,
              coverPhotoId: insertedPhoto.id,
            })
            .onConflictDoUpdate({
              target: [citySets.country, citySets.city],
              set: {
                countryCode: insertedPhoto.countryCode,
                photoCount: sql`${citySets.photoCount} + 1`,
                coverPhotoId: sql`COALESCE(${citySets.coverPhotoId}, ${insertedPhoto.id})`,
                updatedAt: new Date(),
              },
            });

          const updatedCitySet = await db
            .select()
            .from(citySets)
            .where(
              and(
                eq(citySets.country, insertedPhoto.country),
                eq(citySets.city, cityName)
              )
            );

          console.log("Updated city set:", updatedCitySet);
        } else {
          console.log(
            "No geo information available for photo:",
            insertedPhoto.id
          );
        }

        return insertedPhoto;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create photo",
        });
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      try {
        const [photo] = await db.select().from(photos).where(eq(photos.id, id));
        if (!photo)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Photo not found",
          });

        if (photo.country && photo.city) {
          const [citySet] = await db
            .select()
            .from(citySets)
            .where(
              and(
                eq(citySets.country, photo.country),
                eq(citySets.city, photo.city)
              )
            );

          if (citySet) {
            if (citySet.photoCount === 1) {
              await db.delete(citySets).where(eq(citySets.id, citySet.id));
            } else if (citySet.coverPhotoId === photo.id) {
              const [newCoverPhoto] = await db
                .select()
                .from(photos)
                .where(
                  and(
                    eq(photos.country, photo.country),
                    eq(photos.city, photo.city),
                    sql`${photos.id} != ${photo.id}`
                  )
                );

              await db
                .update(citySets)
                .set({
                  photoCount: sql`${citySets.photoCount} - 1`,
                  coverPhotoId: newCoverPhoto?.id ?? null,
                  updatedAt: new Date(),
                })
                .where(
                  and(
                    eq(citySets.country, photo.country),
                    eq(citySets.city, photo.city)
                  )
                );
            } else {
              await db
                .update(citySets)
                .set({
                  photoCount: sql`${citySets.photoCount} - 1`,
                  updatedAt: new Date(),
                })
                .where(
                  and(
                    eq(citySets.country, photo.country),
                    eq(citySets.city, photo.city)
                  )
                );
            }
          }
        }

        try {
          const key = new URL(photo.url).pathname.slice(1);
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
              Key: key,
            })
          );
        } catch (error) {
          console.error("S3 delete failed", error);
        }

        await db.delete(photos).where(eq(photos.id, id));
        return photo;
      } catch (error) {
        console.error("Photo deletion error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete photo",
        });
      }
    }),

  update: protectedProcedure
    .input(photosUpdateSchema)
    .mutation(async ({ input }) => {
      const { id } = input;
      if (!id) throw new TRPCError({ code: "BAD_REQUEST" });

      const [updatedPhoto] = await db
        .update(photos)
        .set(input)
        .where(eq(photos.id, id))
        .returning();

      if (!updatedPhoto) throw new TRPCError({ code: "NOT_FOUND" });
      return updatedPhoto;
    }),

  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, input.id));
      return photo;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      const whereClause = cursor
        ? or(
            lt(photos.updatedAt, cursor.updatedAt),
            and(
              eq(photos.updatedAt, cursor.updatedAt),
              eq(photos.visibility, "public"),
              lt(photos.id, cursor.id)
            )
          )
        : undefined;

      const data = await db
        .select()
        .from(photos)
        .where(whereClause)
        .orderBy(desc(photos.updatedAt))
        .limit(limit + 1);
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),

  getManyWithPrivate: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      const whereClause = cursor
        ? or(
            lt(photos.updatedAt, cursor.updatedAt),
            and(
              eq(photos.updatedAt, cursor.updatedAt),
              lt(photos.id, cursor.id)
            )
          )
        : undefined;

      const data = await db
        .select()
        .from(photos)
        .where(whereClause)
        .orderBy(desc(photos.updatedAt))
        .limit(limit + 1);
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),

  getLikedPhotos: baseProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(photos)
        .where(
          and(eq(photos.isFavorite, true), eq(photos.visibility, "public"))
        )
        .orderBy(desc(photos.updatedAt))
        .limit(input.limit);
    }),

  getCitySets: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      const whereClause = cursor
        ? or(
            lt(citySets.updatedAt, cursor.updatedAt),
            and(
              eq(citySets.updatedAt, cursor.updatedAt),
              lt(citySets.id, cursor.id)
            )
          )
        : undefined;

      const data = await db.query.citySets.findMany({
        with: { coverPhoto: true, photos: true },
        where: whereClause,
        orderBy: [desc(citySets.updatedAt)],
        limit: limit + 1,
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),

  getCitySetByCity: baseProcedure
    .input(z.object({ city: z.string() }))
    .query(async ({ input }) => {
      return (
        (await db.query.citySets.findFirst({
          with: { coverPhoto: true, photos: true },
          where: eq(citySets.city, input.city),
        })) ?? null
      );
    }),
});
