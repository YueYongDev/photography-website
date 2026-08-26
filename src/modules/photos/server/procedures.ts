import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  citySets,
  photos,
  photosUpdateSchema,
  photosInsertSchema,
} from "@/db/schema/photos";
import { and, desc, eq, lt, ne, or, sql } from "drizzle-orm";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { deletePhotoObjectByUrl } from "@/lib/cloudbase-media";
import { revalidateTag, unstable_cache } from "next/cache";
import { PUBLIC_PHOTOS_CACHE_TAG } from "@/lib/cache-tags";

type CitySetsCursor =
  | {
      id: string;
      updatedAt: Date;
    }
  | null
  | undefined;

const getCachedLikedPhotos = unstable_cache(
  async (limit: number) =>
    db
      .select({
        id: photos.id,
        url: photos.url,
        title: photos.title,
        blurData: photos.blurData,
      })
      .from(photos)
      .where(
        and(eq(photos.isFavorite, true), eq(photos.visibility, "public"))
      )
      .orderBy(desc(photos.updatedAt))
      .limit(limit),
  ["liked-photos-v2"],
  { revalidate: 300, tags: [PUBLIC_PHOTOS_CACHE_TAG] }
);

const getCachedCitySetsPreview = unstable_cache(
  async (cursor: CitySetsCursor, limit: number) => {
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
      where: whereClause,
      orderBy: [desc(citySets.updatedAt)],
      limit: limit + 1,
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
          },
        },
      },
    });

    const hasMore = data.length > limit;
    const items = hasMore ? data.slice(0, -1) : data;
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

    return { items, nextCursor };
  },
  ["city-set-previews-v2"],
  { revalidate: 300, tags: [PUBLIC_PHOTOS_CACHE_TAG] }
);

export const photosRouter = createTRPCRouter({
  create: protectedProcedure
    .input(photosInsertSchema)
    .mutation(async ({ input }) => {
      const id = input.id ?? crypto.randomUUID();
      const values = { ...input, id };

      try {
        await db.insert(photos).values(values);
        const [insertedPhoto] = await db
          .select()
          .from(photos)
          .where(eq(photos.id, id))
          .limit(1);

        if (!insertedPhoto) {
          throw new Error("Inserted photo could not be read back");
        }

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
            .onDuplicateKeyUpdate({
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

        revalidateTag(PUBLIC_PHOTOS_CACHE_TAG, { expire: 0 });
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
                    ne(photos.id, photo.id)
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
          await deletePhotoObjectByUrl(photo.url);
        } catch (error) {
          console.error("CloudBase media delete failed", error);
        }

        await db.delete(photos).where(eq(photos.id, id));
        revalidateTag(PUBLIC_PHOTOS_CACHE_TAG, { expire: 0 });
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

      await db.update(photos).set(input).where(eq(photos.id, id));
      const [updatedPhoto] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, id))
        .limit(1);

      if (!updatedPhoto) throw new TRPCError({ code: "NOT_FOUND" });
      revalidateTag(PUBLIC_PHOTOS_CACHE_TAG, { expire: 0 });
      return updatedPhoto;
    }),

  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [photo] = await db
        .select()
        .from(photos)
        .where(
          and(eq(photos.id, input.id), eq(photos.visibility, "public"))
        );
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
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          description: photos.description,
          visibility: photos.visibility,
          dateTimeOriginal: photos.dateTimeOriginal,
          make: photos.make,
          model: photos.model,
          lensModel: photos.lensModel,
          focalLength35mm: photos.focalLength35mm,
          city: photos.city,
          countryCode: photos.countryCode,
          isFavorite: photos.isFavorite,
          blurData: photos.blurData,
          updatedAt: photos.updatedAt,
        })
        .from(photos)
        .where(whereClause)
        .orderBy(desc(photos.updatedAt))
        .limit(limit + 1);
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt ?? new Date() }
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
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          description: photos.description,
          visibility: photos.visibility,
          dateTimeOriginal: photos.dateTimeOriginal,
          make: photos.make,
          model: photos.model,
          lensModel: photos.lensModel,
          focalLength35mm: photos.focalLength35mm,
          city: photos.city,
          countryCode: photos.countryCode,
          isFavorite: photos.isFavorite,
          blurData: photos.blurData,
          updatedAt: photos.updatedAt,
        })
        .from(photos)
        .where(whereClause)
        .orderBy(desc(photos.updatedAt))
        .limit(limit + 1);
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt ?? new Date() }
        : null;

      return { items, nextCursor };
    }),

  getLikedPhotos: baseProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input }) => getCachedLikedPhotos(input.limit)),

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
        where: whereClause,
        orderBy: [desc(citySets.updatedAt)],
        limit: limit + 1,
        with: {
          coverPhoto: true,
          photos: {
            where: eq(photos.visibility, "public"),
          },
        },
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),

  getCitySetsPreview: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) =>
      getCachedCitySetsPreview(input.cursor, input.limit)
    ),

  getCitySetByCity: baseProcedure
    .input(z.object({ city: z.string() }))
    .query(async ({ input }) => {
      return (
        (await db.query.citySets.findFirst({
          where: eq(citySets.city, input.city),
          with: {
            coverPhoto: true,
            photos: {
              where: eq(photos.visibility, "public"),
            },
          },
        })) ?? null
      );
    }),

  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // 获取照片信息
      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, id));

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      // 调用智谱AI服务生成图片描述
      const generateAIContent = async () => {
        const prompt = `请为这张照片生成一个有创意的标题和详细描述。
      
要求:
1. 一个有创意、吸引人的标题 (5-15个字)
2. 一个详细的描述 (2-3句话)，描述照片中的内容、氛围和可能的故事。

直接以JSON格式返回，只包含"title"和"description"字段。请确保输出合法的 JSON，不要包含 Markdown 代码块。字段内容必须是中文。`;

        try {
          const apiKey = process.env.ZHIPU_AI_API_KEY;
          if (!apiKey) {
            return {
              title: photo.make || photo.model
                ? `使用${photo.make || ""} ${photo.model || ""}拍摄`.trim()
                : "未命名照片",
              description: "一个美好的瞬间被永远定格。",
            };
          }

          const response = await fetch(`https://open.bigmodel.cn/api/paas/v4/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'glm-4v-plus-0111',
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'image_url', image_url: { url: photo.url } },
                    { type: 'text', text: prompt }
                  ]
                }
              ],
              stream: false
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Zhipu AI API error: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          const rawResponse = data.choices?.[0]?.message?.content || "";

          let content;
          try {
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
            content = JSON.parse(jsonStr);
          } catch {
            content = {
              title: "未命名照片",
              description: "一个美好的瞬间被永远定格。"
            };
          }

          return content;
        } catch (error) {
          console.error("Failed to call Zhipu AI API:", error);
          return {
            title: photo.make || photo.model
              ? `使用${photo.make || ''} ${photo.model || ''}拍摄`.trim()
              : "未命名照片",
            description: "一个美好的瞬间被永远定格。"
          };
        }
      };

      try {
        const content = await generateAIContent();
        return content;
      } catch (error) {
        console.error("Failed to generate AI description", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate AI description",
        });
      }
    }),
});
