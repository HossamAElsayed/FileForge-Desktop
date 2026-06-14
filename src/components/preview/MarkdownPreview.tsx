import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { Components } from "react-markdown";

import { PreviewEmptyState } from "@/components/preview/PreviewEmptyState";
import type { LayoutMode } from "@/themes";

interface MarkdownPreviewProps {
  content: string;
  layoutMode: LayoutMode;
}

export function MarkdownPreview({ content, layoutMode }: MarkdownPreviewProps) {
  const codeBlockStyle = useMemo(
    () => ({
      margin: 0,
      borderRadius: "8px",
      fontSize: "0.85em",
      background: "var(--muted)",
      color: "var(--foreground)",
    }),
    [],
  );

  const components = useMemo<Components>(
    () => ({
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className ?? "");
        const code = String(children).replace(/\n$/, "");
        const inline = !match && !code.includes("\n");

        if (inline) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }

        return (
          <SyntaxHighlighter
            language={match?.[1] ?? "text"}
            PreTag="div"
            customStyle={codeBlockStyle}
            style={{}}
          >
            {code}
          </SyntaxHighlighter>
        );
      },
    }),
    [codeBlockStyle],
  );

  if (!content.trim()) {
    return (
      <div className="preview-pane h-full w-full overflow-hidden">
        <PreviewEmptyState layoutMode={layoutMode} />
      </div>
    );
  }

  return (
    <div
      className="preview-pane h-full w-full overflow-hidden"
      data-layout={layoutMode}
    >
      <div
        className="preview-content h-full overflow-auto"
        role="region"
        aria-label="Markdown preview"
      >
        <div className="markdown-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
