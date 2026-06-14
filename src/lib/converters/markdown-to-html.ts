import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { wrapHtmlDocument } from "@/lib/pdf/html-template";

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}

export async function markdownToPdfHtml(
  markdown: string,
  filename?: string | null,
): Promise<string> {
  const bodyHtml = await markdownToHtml(markdown);
  const title =
    filename?.replace(/\.(md|markdown|txt)$/i, "") ?? "Document";
  return wrapHtmlDocument(bodyHtml, title);
}
