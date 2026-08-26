import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const getZhipuApiKey = () => {
  const apiKey = process.env.ZHIPU_AI_API_KEY;
  if (!apiKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "AI service is not configured",
    });
  }
  return apiKey;
};

/**
 * AI内容生成模块
 * 提供通用的AI内容生成服务，支持多种内容类型并返回中文结果
 */
export const aiRouter = createTRPCRouter({
  /**
   * 通用文本内容生成
   * 根据提供的提示生成指定类型的中文内容
   */
  generateContent: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1, "提示词不能为空"),
      contentType: z.enum(["title", "description", "article", "story", "poem", "other"]).default("other"),
      maxLength: z.number().min(10).max(2000).default(500),
      temperature: z.number().min(0).max(1).default(0.7),
    }))
    .mutation(async ({ input }) => {
      const { prompt, contentType, maxLength, temperature } = input;

      const systemPrompt = `你是一个专业的中文内容创作者。请根据用户的要求生成自然、流畅、符合中文表达习惯的内容。
内容类型: ${contentType}
最大长度: ${maxLength} 字符`;

      try {
        const apiKey = getZhipuApiKey();
        const response = await fetch(`https://open.bigmodel.cn/api/paas/v4/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'glm-4-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: temperature,
            max_tokens: maxLength,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Zhipu AI API error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "内容生成失败";

        // 返回生成的内容
        return {
          content,
          contentType: contentType,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("AI内容生成失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI内容生成失败",
        });
      }
    }),

  /**
   * 照片描述生成
   * 专门为照片生成标题和描述
   */
  generatePhotoDescription: protectedProcedure
    .input(z.object({
      exifData: z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        lensModel: z.string().optional(),
        fNumber: z.number().optional(),
        exposureTime: z.number().optional(),
        iso: z.number().optional(),
        focalLength: z.number().optional(),
        dateTimeOriginal: z.string().optional(),
      }),
      sceneType: z.enum(["landscape", "portrait", "street", "macro", "architecture", "other"]).default("other"),
    }))
    .mutation(async ({ input }) => {
      const { exifData, sceneType } = input;

      // 构造EXIF信息提示词
      const exifInfo = [];
      if (exifData.make) exifInfo.push(`相机品牌: ${exifData.make}`);
      if (exifData.model) exifInfo.push(`相机型号: ${exifData.model}`);
      if (exifData.lensModel) exifInfo.push(`镜头型号: ${exifData.lensModel}`);
      if (exifData.fNumber) exifInfo.push(`光圈值: f/${exifData.fNumber}`);
      if (exifData.exposureTime) exifInfo.push(`曝光时间: ${exifData.exposureTime}s`);
      if (exifData.iso) exifInfo.push(`感光度: ISO ${exifData.iso}`);
      if (exifData.focalLength) exifInfo.push(`焦距: ${exifData.focalLength}mm`);
      if (exifData.dateTimeOriginal) exifInfo.push(`拍摄时间: ${new Date(exifData.dateTimeOriginal).toLocaleString('zh-CN')}`);

      const exifText = exifInfo.length > 0 ? `照片EXIF信息:\n${exifInfo.join('\n')}` : '无可用EXIF信息。';

      // 构造提示词
      const prompt = `根据以下EXIF信息和场景类型为照片生成一个有创意的标题和详细描述。
      
${exifText}
场景类型: ${sceneType}

请提供:
1. 一个有创意、吸引人的标题 (5-15个字)
2. 一个详细的描述 (2-3句话)，根据技术信息和场景类型描述照片可能呈现的视觉内容，重点关注这些设置可能捕捉到的场景或主题。

请用中文回复，并以JSON格式返回，只包含"title"和"description"字段。请确保直接输出合法的 JSON，不要包含 Markdown 代码块。`;

      try {
        const apiKey = getZhipuApiKey();
        const response = await fetch(`https://open.bigmodel.cn/api/paas/v4/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'glm-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`Zhipu AI API error: ${response.status}`);
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
        console.error("照片描述生成失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "照片描述生成失败",
        });
      }
    }),

  /**
   * 根据图片URL生成照片描述
   * 专门为照片生成标题和描述，直接使用图片URL
   */
  generatePhotoDescriptionFromUrl: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url("无效的图片URL"),
    }))
    .mutation(async ({ input }) => {
      const { imageUrl } = input;

      // 构造提示词
      const prompt = `请为这张照片生成一个有创意的标题和详细描述。

请提供:
1. 一个有创意、吸引人的标题 (5-15个字)
2. 一个详细的描述 (2-3句话)，描述照片中的内容、氛围和可能的故事。

直接以JSON格式返回，只包含"title"和"description"字段。请确保输出合法的 JSON，不要包含 Markdown 代码块。字段内容必须是中文。`;

      try {
        const apiKey = getZhipuApiKey();

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
                  { type: 'image_url', image_url: { url: imageUrl } },
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
        console.error("Failed to generate description from URL:", error);
        return {
          title: "未命名照片",
          description: "一个美好的瞬间被永远定格。"
        };
      }
    }),

  /**
   * 博客文章大纲生成
   * 根据主题生成博客文章的大纲结构
   */
  generateBlogOutline: protectedProcedure
    .input(z.object({
      topic: z.string().min(1, "主题不能为空"),
      wordCount: z.number().min(300).max(5000).default(1000),
      tone: z.enum(["professional", "casual", "technical", "creative"]).default("professional"),
    }))
    .mutation(async ({ input }) => {
      const { topic, wordCount, tone } = input;

      const prompt = `请为以下主题生成一个中文博客文章的大纲：
      
主题: ${topic}
目标字数: ${wordCount} 字
语调风格: ${tone}

要求:
1. 提供文章标题
2. 列出3-5个主要章节标题
3. 为每个章节提供简短的描述
4. 包含一个结论部分

以JSON格式返回，结构如下:
{
  "title": "文章标题",
  "sections": [
    {
      "heading": "章节标题",
      "description": "章节描述"
    }
  ],
  "conclusion": "结论描述"
}
请确保输出合法的 JSON，不要包含 Markdown 代码块。`;

      try {
        const apiKey = getZhipuApiKey();
        const response = await fetch(`https://open.bigmodel.cn/api/paas/v4/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'glm-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`Zhipu AI API error: ${response.status}`);
        }

        const data = await response.json();
        const rawResponse = data.choices?.[0]?.message?.content || "";

        try {
          const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
          return JSON.parse(jsonStr);
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "无法解析生成的内容",
          });
        }
      } catch (error) {
        console.error("博客大纲生成失败:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "博客大纲生成失败",
        });
      }
    }),
});
