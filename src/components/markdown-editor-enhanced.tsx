"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link, List, ListOrdered, Heading1, Heading2, Image as ImageIcon, Eye, Edit } from "lucide-react";
import { useState, useCallback } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownEditorEnhancedProps {
  content: string;
  onChange: (content: string) => void;
}

// 自定义表格组件
const CustomTable: Components["table"] = ({ children }) => (
  <div className="overflow-x-auto my-4">
    <table className="min-w-full border border-gray-300 dark:border-gray-700">
      {children}
    </table>
  </div>
);

const CustomThead: Components["thead"] = ({ children }) => (
  <thead className="bg-gray-100 dark:bg-gray-800">
    {children}
  </thead>
);

const CustomTbody: Components["tbody"] = ({ children }) => (
  <tbody>
    {children}
  </tbody>
);

const CustomTr: Components["tr"] = ({ children }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    {children}
  </tr>
);

const CustomTh: Components["th"] = ({ children }) => (
  <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
    {children}
  </th>
);

const CustomTd: Components["td"] = ({ children }) => (
  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
    {children}
  </td>
);

// 自定义代码块组件
const CustomCodeBlock: Components["code"] = ({ children, className }) => {
  const match = /language-(\w+)/.exec(className || '');
  return match ? (
    <pre className="rounded-md p-4 my-4 overflow-x-auto bg-gray-900 dark:bg-gray-800">
      <code className={className}>{children}</code>
    </pre>
  ) : (
    <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">{children}</code>
  );
};

const MarkdownEditorEnhanced = ({ content, onChange }: MarkdownEditorEnhancedProps) => {
  const [isPreview, setIsPreview] = useState(false);

  // 插入 Markdown 语法的函数
  const insertMarkdown = useCallback((syntax: string, wrap: boolean = false, placeholder: string = "") => {
    const textarea = document.getElementById("markdown-editor-enhanced") as HTMLTextAreaElement;
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
          className="ml-auto flex items-center gap-1"
        >
          {isPreview ? (
            <>
              <Edit className="h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>
      </div>
      
      {isPreview ? (
        <div className="min-h-[200px] p-4 border border-border rounded-b-md bg-background prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              table: CustomTable,
              thead: CustomThead,
              tbody: CustomTbody,
              tr: CustomTr,
              th: CustomTh,
              td: CustomTd,
              code: CustomCodeBlock,
              // 添加其他自定义组件以改善样式
              h1: ({ children }) => <h1 className="text-3xl font-bold mt-6 mb-4">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold mt-5 mb-3">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
              p: ({ children }) => <p className="my-3">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside my-3">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside my-3">{children}</ol>,
              li: ({ children }) => <li className="my-1">{children}</li>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <div className="my-4">
                  <Image
                    src={src || ""}
                    alt={alt || ""}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="rounded-lg shadow-md mx-auto max-w-full h-auto"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <Textarea
          id="markdown-editor-enhanced"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] p-4 focus:outline-hidden border border-border rounded-b-md font-mono"
          placeholder="Start writing your post content in Markdown..."
        />
      )}
    </div>
  );
};

export default MarkdownEditorEnhanced;