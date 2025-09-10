"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link, List, ListOrdered, Heading1, Heading2, Image as ImageIcon } from "lucide-react";
import { useState, useCallback } from "react";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MarkdownEditor = ({ content, onChange }: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);

  // 插入 Markdown 语法的函数
  const insertMarkdown = useCallback((syntax: string, wrap: boolean = false, placeholder: string = "") => {
    const textarea = document.getElementById("markdown-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newText = "";
    let newCursorPos = start;

    if (wrap) {
      // 包装选中的文本
      newText = content.substring(0, start) + syntax + selectedText + syntax + content.substring(end);
      newCursorPos = start + syntax.length + selectedText.length + syntax.length;
    } else {
      // 在光标位置插入语法
      newText = content.substring(0, start) + syntax + placeholder + content.substring(end);
      newCursorPos = start + syntax.length + placeholder.length;
    }

    onChange(newText);
    
    // 稍后设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  // 插入链接
  const insertLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) {
      const text = window.prompt("Enter link text:") || url;
      insertMarkdown(`[${text}](${url})`);
    }
  }, [insertMarkdown]);

  // 插入图片
  const insertImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      const alt = window.prompt("Enter alt text:") || "";
      insertMarkdown(`![${alt}](${url})`);
    }
  }, [insertMarkdown]);

  // 预览 Markdown 内容
  const previewContent = (markdown: string) => {
    // 简单的 Markdown 到 HTML 转换
    return markdown
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // 粗体
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // 斜体
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">') // 图片
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // 链接
      .replace(/^# (.*$)/gm, "<h1>$1</h1>") // H1
      .replace(/^## (.*$)/gm, "<h2>$1</h2>") // H2
      .replace(/^\* (.*$)/gm, "<ul><li>$1</li></ul>") // 无序列表
      .replace(/^\d+\. (.*$)/gm, "<ol><li>$1</li></ol>") // 有序列表
      .replace(/\n/g, "<br>"); // 换行
  };

  return (
    <div className="w-full">
      <div className="bg-muted p-2 rounded-t-md border border-border border-b-0 flex flex-wrap gap-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => insertMarkdown("**", true)}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => insertMarkdown("*", true)}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => insertMarkdown("# ")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => insertMarkdown("## ")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => insertMarkdown("* ")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => insertMarkdown("1. ")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={insertLink}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={insertImage}
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant={isPreview ? "default" : "ghost"}
          size="sm"
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="ml-auto"
        >
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>
      
      {isPreview ? (
        <div 
          className="min-h-[200px] p-4 border border-border rounded-b-md bg-background prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: previewContent(content) }}
        />
      ) : (
        <Textarea
          id="markdown-editor"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] p-4 focus:outline-hidden border border-border rounded-b-md font-mono"
          placeholder="Start writing your post content in Markdown..."
        />
      )}
    </div>
  );
};

export default MarkdownEditor;