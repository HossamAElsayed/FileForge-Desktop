import { describe, expect, it } from "vitest";

import { markdownToHtml } from "@/lib/converters/markdown-to-html";
import { wrapHtmlDocument } from "@/lib/pdf/html-template";

describe("markdown conversion", () => {
  it("converts basic markdown to html", async () => {
    const html = await markdownToHtml("# Hello\n\n**world**");
    expect(html).toContain("<h1");
    expect(html).toContain("<strong>world</strong>");
  });

  it("wraps html in a printable document", () => {
    const doc = wrapHtmlDocument("<p>Test</p>", "My Doc");
    expect(doc).toContain("<title>My Doc</title>");
    expect(doc).toContain("<p>Test</p>");
  });
});
