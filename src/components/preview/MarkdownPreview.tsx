import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { Components } from "react-markdown";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
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
            customStyle={{
              margin: 0,
              borderRadius: "8px",
              fontSize: "0.85em",
              background: "#1e1e2e",
            }}
          >
            {code}
          </SyntaxHighlighter>
        );
      },
    }),
    [],
  );

  if (!content.trim()) {
    return (
      <div className="preview-pane panel-enter">
        <div className="empty-preview">Your markdown preview will appear here.</div>
      </div>
    );
  }

  return (
    <div className="preview-pane panel-enter">
      <div className="preview-content" role="region" aria-label="Markdown preview">
        <div className="markdown-preview">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
