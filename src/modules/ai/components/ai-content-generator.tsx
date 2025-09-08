"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";

interface AIContentGeneratorProps {
  onContentGenerated?: (content: string) => void;
}

export function AIContentGenerator({ onContentGenerated }: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState<"title" | "description" | "article" | "story" | "poem" | "other">("other");
  const [maxLength, setMaxLength] = useState(500);
  const [temperature, setTemperature] = useState(0.7);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateContent = trpc.ai.generateContent.useMutation();

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast.error("请输入提示词");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateContent.mutateAsync({
        prompt,
        contentType,
        maxLength,
        temperature,
      });

      setGeneratedContent(result.content);
      if (onContentGenerated) {
        onContentGenerated(result.content);
      }
      toast.success("内容生成成功");
    } catch (error) {
      console.error("内容生成失败:", error);
      toast.error("内容生成失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI内容生成器</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">提示词</Label>
          <Textarea
            id="prompt"
            placeholder="请输入您想要生成内容的提示词..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contentType">内容类型</Label>
            <select
              id="contentType"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as "title" | "description" | "article" | "story" | "poem" | "other")}
            >
              <option value="other">其他</option>
              <option value="title">标题</option>
              <option value="description">描述</option>
              <option value="article">文章</option>
              <option value="story">故事</option>
              <option value="poem">诗歌</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLength">最大长度: {maxLength} 字符</Label>
            <Input
              id="maxLength"
              type="range"
              min="50"
              max="2000"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">创意度: {temperature.toFixed(1)}</Label>
          <Input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>

        <Button 
          onClick={handleGenerateContent} 
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            "生成内容"
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-2">
            <Label>生成结果</Label>
            <div className="rounded-md border p-4 bg-muted">
              <p className="whitespace-pre-wrap">{generatedContent}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}