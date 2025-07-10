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
              sql`${citySets.country} = ${insertedPhoto.country} AND ${citySets.city} = ${insertedPhoto.city}`
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

      try {
        const [photo] = await db.select().from(photos).where(eq(photos.id, id));

        if (!photo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Photo not found",
          });
        }

        // city set related
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

          // if city set photo count is 1, delete the city set
          if (citySet && citySet.photoCount === 1) {
            await db.delete(citySets).where(eq(citySets.id, citySet.id));
          }

          if (citySet) {
            // if this is the cover photo, find a new cover photo
            if (citySet.coverPhotoId === photo.id) {
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

              if (!newCoverPhoto) return;

              await db
                .update(citySets)
                .set({
                  photoCount: sql`${citySets.photoCount} - 1`,
                  coverPhotoId: newCoverPhoto.id,
                  updatedAt: new Date(),
                })
                .where(
                  and(
                    eq(citySets.country, photo.country),
                    eq(citySets.city, photo.city)
                  )
                );
            } else {
              // update the city set photo count
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

        // delete cloudflare r2 file & database record
        try {
          const key = new URL(photo.url).pathname.slice(1);
          const command = new DeleteObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: key,
          });
          await s3Client.send(command);

          await db.delete(photos).where(eq(photos.id, id));
        } catch (error) {
          if (error instanceof Error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete photo",
          });
        }

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

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updatedPhoto] = await db
        .update(photos)
        .set({
          ...input,
        })
        .where(eq(photos.id, id))
        .returning();

      if (!updatedPhoto) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedPhoto;
    }),
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;

      const [photo] = await db.select().from(photos).where(eq(photos.id, id));

      return photo;
    }),
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
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const data = await db
        .select()
        .from(photos)
        .where(
          and(
            cursor
              ? or(
                  lt(photos.updatedAt, cursor.updatedAt),
                  and(
                    eq(photos.updatedAt, cursor.updatedAt),
                    eq(photos.visibility, "public"),
                    lt(photos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(photos.updatedAt))
        .limit(limit + 1);

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
  getManyWithPrivate: protectedProcedure
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
        .from(photos)
        .where(
          and(
            cursor
              ? or(
                  lt(photos.updatedAt, cursor.updatedAt),
                  and(
                    eq(photos.updatedAt, cursor.updatedAt),
                    lt(photos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(photos.updatedAt))
        .limit(limit + 1);

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
  getLikedPhotos: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { limit } = input;

      const data = await db
        .select()
        .from(photos)
        .where(
          and(eq(photos.isFavorite, true), eq(photos.visibility, "public"))
        )
        .orderBy(desc(photos.updatedAt))
        .limit(limit);

      return data;
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
  getCitySetByCity: baseProcedure
    .input(
      z.object({
        city: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { city } = input;

      const data = await db.query.citySets.findFirst({
        with: {
          coverPhoto: true,
          photos: true,
        },
        where: eq(citySets.city, city),
      });

      return data;
    }),
});
