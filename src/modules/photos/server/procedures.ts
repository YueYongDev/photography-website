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
import { createS3Client } from "@/lib/s3-client";

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
          const s3Client = createS3Client();
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

  getCitySetByCity: baseProcedure
    .input(z.object({ city: z.string() }))
    .query(async ({ input }) => {
      return (
        (await db.query.citySets.findFirst({
          where: eq(citySets.city, input.city),
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
      
      // 调用ollama服务生成图片描述
      const generateAIContent = async () => {
        // 构造提示词 - 要求中文输出
        const prompt = `请为这张照片生成一个有创意的标题和详细描述。

请提供:
1. 一个有创意、吸引人的标题 (5-15个字)
2. 一个详细的描述 (2-3句话)，描述照片中的内容、氛围和可能的故事。

请用中文回复，并以JSON格式返回，只包含"title"和"description"字段。`;
        
        // 调用ollama服务
        try {
          const ollamaApiUrl = process.env.OLLAMA_API_URL || 'https://ollama.yueyong.fun';
          
          // 构造请求体
          const requestBody: any = {
            model: 'gemma3:4b', // 使用支持中文的多模态模型
            prompt: prompt,
            stream: false,
            format: 'json' // 要求JSON格式响应
          };
          
          // 如果照片URL存在，尝试获取图像数据
          if (photo.url) {
            try {
              // 下载图像数据
              const imageResponse = await fetch(photo.url);
              if (imageResponse.ok) {
                const imageBuffer = await imageResponse.arrayBuffer();
                const base64Image = Buffer.from(imageBuffer).toString('base64');
                
                // 添加图像数据到请求体
                requestBody.images = [base64Image];
              }
            } catch (imageError) {
              console.warn("Failed to fetch image data, using prompt only:", imageError);
            }
          }
          
          const response = await fetch(`${ollamaApiUrl}/api/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });
          
          if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // 解析响应
          let content;
          try {
            // 如果响应是字符串，尝试解析为JSON
            content = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
          } catch {
            // Intentionally ignore parsing errors and use default content
            // 如果解析失败，使用默认标题和描述
            content = {
              title: "未命名照片",
              description: "一个美好的瞬间被永远定格。"
            };
          }
          
          // 确保返回的内容是中文
          if (content && typeof content === 'object') {
            // 清理标题和描述中的非中文字符
            if (content.title) {
              // 移除非中文、非数字、非常见标点的字符
              content.title = content.title.replace(/[^\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef0-9a-zA-Z\s]/g, '');
              // 如果标题中没有中文字符，使用默认标题
              if (!/[\u4e00-\u9fa5]/.test(content.title)) {
                content.title = "未命名照片";
              }
            }
            if (content.description) {
              // 移除非中文、非数字、非常见标点的字符
              content.description = content.description.replace(/[^\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef0-9a-zA-Z\s，。！？；：""''（）、]/g, '');
              // 如果描述中没有中文字符，使用默认描述
              if (!/[\u4e00-\u9fa5]/.test(content.description)) {
                content.description = "一个美好的瞬间被永远定格。";
              }
            }
          }
          
          return content;
        } catch (error) {
          console.error("Failed to call Ollama API:", error);
          // 如果API调用失败，返回默认中文内容
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
