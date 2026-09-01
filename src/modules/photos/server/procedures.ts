import { z } from "zod";
import { db } from "@/db/drizzle";
import {
  citySets,
  photos,
  photosUpdateSchema,
  photosInsertSchema,
} from "@/db/schema/photos";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  like,
  lt,
  ne,
  or,
  sql,
} from "drizzle-orm";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { deletePhotoObjectByUrl } from "@/lib/qiniu-storage";
import { revalidateTag, unstable_cache } from "next/cache";
import { PUBLIC_PHOTOS_CACHE_TAG } from "@/lib/cache-tags";
import { measureServerStep } from "@/lib/server-performance";

type CitySetsCursor =
  | {
      id: string;
      updatedAt: Date;
    }
  | null
  | undefined;

// `visibility` used to control the Work page while `isFavorite` controlled the
// homepage. Treat either legacy flag as selected while old records converge to
// the single `isFavorite` concept through subsequent edits.
const selectedPhotoCondition = or(
  eq(photos.isFavorite, true),
  eq(photos.visibility, "public"),
)!;

const unselectedPhotoCondition = and(
  eq(photos.isFavorite, false),
  eq(photos.visibility, "private"),
)!;

const getCachedSelectedPhotos = unstable_cache(
  async () =>
    db
      .select({
        id: photos.id,
        url: photos.url,
        title: photos.title,
        description: photos.description,
        city: photos.city,
        countryCode: photos.countryCode,
        dateTimeOriginal: photos.dateTimeOriginal,
        captureTimezoneOffset: photos.captureTimezoneOffset,
        blurData: photos.blurData,
        width: photos.width,
        height: photos.height,
        aspectRatio: photos.aspectRatio,
        updatedAt: photos.updatedAt,
      })
      .from(photos)
      .where(selectedPhotoCondition)
      .orderBy(desc(photos.updatedAt), desc(photos.id)),
  ["selected-photos-v2"],
  { revalidate: 300, tags: [PUBLIC_PHOTOS_CACHE_TAG] },
);

const randomSample = <Item>(items: Item[], limit: number) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, limit);
};

const getCachedCitySetsPreview = unstable_cache(
  async (cursor: CitySetsCursor, limit: number) => {
    const whereClause = cursor
      ? or(
          lt(citySets.updatedAt, cursor.updatedAt),
          and(
            eq(citySets.updatedAt, cursor.updatedAt),
            lt(citySets.id, cursor.id),
          ),
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
  { revalidate: 300, tags: [PUBLIC_PHOTOS_CACHE_TAG] },
);

export const photosRouter = createTRPCRouter({
  create: protectedProcedure
    .input(photosInsertSchema)
    .mutation(async ({ input }) => {
      const id = input.id ?? crypto.randomUUID();
      const values = {
        ...input,
        id,
        isFavorite: false,
        visibility: "private" as const,
      };

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
                eq(citySets.city, cityName),
              ),
            );

          console.log("Updated city set:", updatedCitySet);
        } else {
          console.log(
            "No geo information available for photo:",
            insertedPhoto.id,
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
                eq(citySets.city, photo.city),
              ),
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
                    ne(photos.id, photo.id),
                  ),
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
                    eq(citySets.city, photo.city),
                  ),
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
                    eq(citySets.city, photo.city),
                  ),
                );
            }
          }
        }

        try {
          await deletePhotoObjectByUrl(photo.url);
        } catch (error) {
          console.error("Qiniu media delete failed", error);
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

      const values = {
        ...input,
        ...(input.isFavorite !== undefined
          ? {
              visibility: input.isFavorite
                ? ("public" as const)
                : ("private" as const),
            }
          : {}),
      };

      await db.update(photos).set(values).where(eq(photos.id, id));
      const [updatedPhoto] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, id))
        .limit(1);

      if (!updatedPhoto) throw new TRPCError({ code: "NOT_FOUND" });
      revalidateTag(PUBLIC_PHOTOS_CACHE_TAG, { expire: 0 });
      return updatedPhoto;
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [photo] = await measureServerStep("photos.getOne", async () =>
        db
          .select()
          .from(photos)
          .where(eq(photos.id, input.id))
          .limit(1),
      );
      return photo
        ? {
            ...photo,
            isFavorite: photo.isFavorite || photo.visibility === "public",
          }
        : photo;
    }),

  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      const whereClause = cursor
        ? or(
            lt(photos.updatedAt, cursor.updatedAt),
            and(
              eq(photos.updatedAt, cursor.updatedAt),
              lt(photos.id, cursor.id),
            ),
          )
        : undefined;

      const data = await db
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          description: photos.description,
          dateTimeOriginal: photos.dateTimeOriginal,
          captureTimezoneOffset: photos.captureTimezoneOffset,
          make: photos.make,
          model: photos.model,
          lensModel: photos.lensModel,
          focalLength35mm: photos.focalLength35mm,
          city: photos.city,
          countryCode: photos.countryCode,
          isFavorite:
            sql<boolean>`(${photos.isFavorite} = true or ${photos.visibility} = 'public')`.mapWith(
              Boolean,
            ),
          blurData: photos.blurData,
          width: photos.width,
          height: photos.height,
          aspectRatio: photos.aspectRatio,
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
        search: z.string().trim().max(120).optional(),
        selection: z.enum(["all", "selected", "unselected"]).default("all"),
        sort: z.enum(["newest", "oldest"]).default("newest"),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit, search, selection, sort } = input;
      const isAscending = sort === "oldest";
      const searchTerm = search
        ? `%${search.replace(/[\\%_]/g, "\\$&")}%`
        : undefined;
      const cursorClause = cursor
        ? or(
            isAscending
              ? gt(photos.updatedAt, cursor.updatedAt)
              : lt(photos.updatedAt, cursor.updatedAt),
            and(
              eq(photos.updatedAt, cursor.updatedAt),
              isAscending
                ? gt(photos.id, cursor.id)
                : lt(photos.id, cursor.id),
            ),
          )
        : undefined;
      const searchClause = searchTerm
        ? or(
            like(photos.title, searchTerm),
            like(photos.description, searchTerm),
            like(photos.city, searchTerm),
            like(photos.country, searchTerm),
            like(photos.make, searchTerm),
            like(photos.model, searchTerm),
          )
        : undefined;
      const whereClause = and(
        selection === "selected"
          ? selectedPhotoCondition
          : selection === "unselected"
            ? unselectedPhotoCondition
            : undefined,
        searchClause,
        cursorClause,
      );

      const data = await db
        .select({
          id: photos.id,
          url: photos.url,
          title: photos.title,
          description: photos.description,
          dateTimeOriginal: photos.dateTimeOriginal,
          captureTimezoneOffset: photos.captureTimezoneOffset,
          make: photos.make,
          model: photos.model,
          lensModel: photos.lensModel,
          focalLength35mm: photos.focalLength35mm,
          city: photos.city,
          countryCode: photos.countryCode,
          isFavorite:
            sql<boolean>`(${photos.isFavorite} = true or ${photos.visibility} = 'public')`.mapWith(
              Boolean,
            ),
          blurData: photos.blurData,
          width: photos.width,
          height: photos.height,
          aspectRatio: photos.aspectRatio,
          updatedAt: photos.updatedAt,
        })
        .from(photos)
        .where(whereClause)
        .orderBy(
          isAscending ? asc(photos.updatedAt) : desc(photos.updatedAt),
          isAscending ? asc(photos.id) : desc(photos.id),
        )
        .limit(limit + 1);
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt ?? new Date() }
        : null;

      return { items, nextCursor };
    }),

  getStudioStats: protectedProcedure.query(async () => {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        selected: sql<number>`coalesce(sum(case when ${photos.isFavorite} = true or ${photos.visibility} = 'public' then 1 else 0 end), 0)`.mapWith(Number),
        unselected: sql<number>`coalesce(sum(case when ${photos.isFavorite} = false and ${photos.visibility} = 'private' then 1 else 0 end), 0)`.mapWith(Number),
      })
      .from(photos);

    return stats ?? { total: 0, selected: 0, unselected: 0 };
  }),

  bulkUpdate: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()).min(1).max(100),
        isFavorite: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const changes = {
        isFavorite: input.isFavorite,
        visibility: input.isFavorite
          ? ("public" as const)
          : ("private" as const),
        updatedAt: new Date(),
      };

      await db
        .update(photos)
        .set(changes)
        .where(inArray(photos.id, input.ids));

      revalidateTag(PUBLIC_PHOTOS_CACHE_TAG, { expire: 0 });
      return { updated: input.ids.length };
    }),

  getSelectedPhotos: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(500).optional(),
        random: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => {
      const selectedPhotos = await getCachedSelectedPhotos();
      const limit = input.limit ?? selectedPhotos.length;
      return input.random
        ? randomSample(selectedPhotos, limit)
        : selectedPhotos.slice(0, limit);
    }),

  getCitySets: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;
      const whereClause = cursor
        ? or(
            lt(citySets.updatedAt, cursor.updatedAt),
            and(
              eq(citySets.updatedAt, cursor.updatedAt),
              lt(citySets.id, cursor.id),
            ),
          )
        : undefined;

      const data = await db.query.citySets.findMany({
        where: whereClause,
        orderBy: [desc(citySets.updatedAt)],
        limit: limit + 1,
        with: {
          coverPhoto: true,
          photos: true,
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
      }),
    )
    .query(async ({ input }) =>
      getCachedCitySetsPreview(input.cursor, input.limit),
    ),

  getCitySetByCity: baseProcedure
    .input(
      z.object({
        city: z.string(),
        countryCode: z.string().length(2).optional(),
      }),
    )
    .query(async ({ input }) => {
      return (
        (await db.query.citySets.findFirst({
          where: input.countryCode
            ? and(
                eq(citySets.city, input.city),
                eq(citySets.countryCode, input.countryCode.toUpperCase()),
              )
            : eq(citySets.city, input.city),
          with: {
            coverPhoto: true,
            photos: true,
          },
        })) ?? null
      );
    }),

  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      // 获取照片信息
      const [photo] = await db.select().from(photos).where(eq(photos.id, id));

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
              title:
                photo.make || photo.model
                  ? `使用${photo.make || ""} ${photo.model || ""}拍摄`.trim()
                  : "未命名照片",
              description: "一个美好的瞬间被永远定格。",
            };
          }

          const response = await fetch(
            `https://open.bigmodel.cn/api/paas/v4/chat/completions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: "glm-4v-plus-0111",
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "image_url", image_url: { url: photo.url } },
                      { type: "text", text: prompt },
                    ],
                  },
                ],
                stream: false,
              }),
            },
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Zhipu AI API error: ${response.status} ${errorText}`,
            );
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
              description: "一个美好的瞬间被永远定格。",
            };
          }

          return content;
        } catch (error) {
          console.error("Failed to call Zhipu AI API:", error);
          return {
            title:
              photo.make || photo.model
                ? `使用${photo.make || ""} ${photo.model || ""}拍摄`.trim()
                : "未命名照片",
            description: "一个美好的瞬间被永远定格。",
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
