import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

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

export const PostPreview = ({ content }: { content: string | null }) => {
  if (content) {
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
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
                <img
                  src={src}
                  alt={alt}
                  className="rounded-lg shadow-md mx-auto max-w-full h-auto"
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
    );
  }
  
  return <div>No content</div>;
};
