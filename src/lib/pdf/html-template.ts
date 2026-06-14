export function wrapHtmlDocument(bodyHtml: string, title = "Document"): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 0;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
    }

    .document {
      max-width: 100%;
      padding: 0;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      line-height: 1.25;
      font-weight: 600;
      page-break-after: avoid;
    }

    h1 { font-size: 1.75em; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.25em; }
    h2 { font-size: 1.4em; }
    h3 { font-size: 1.15em; }

    p { margin: 0 0 1em; }

    a { color: #2563eb; text-decoration: underline; }

    ul, ol { margin: 0 0 1em; padding-left: 1.5em; }
    li { margin-bottom: 0.25em; }

    blockquote {
      margin: 0 0 1em;
      padding: 0.5em 1em;
      border-left: 4px solid #d4d4d4;
      color: #525252;
      background: #fafafa;
    }

    code {
      font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
      font-size: 0.9em;
      background: #f4f4f5;
      padding: 0.15em 0.35em;
      border-radius: 4px;
    }

    pre {
      margin: 0 0 1em;
      padding: 1em;
      background: #18181b;
      color: #fafafa;
      border-radius: 6px;
      overflow-x: auto;
      page-break-inside: avoid;
    }

    pre code {
      background: none;
      padding: 0;
      color: inherit;
      font-size: 0.85em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 1em;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #d4d4d4;
      padding: 0.5em 0.75em;
      text-align: left;
    }

    th { background: #f4f4f5; font-weight: 600; }

    hr {
      border: none;
      border-top: 1px solid #e5e5e5;
      margin: 2em 0;
    }

    img { max-width: 100%; height: auto; }

    input[type="checkbox"] { margin-right: 0.5em; }
  </style>
</head>
<body>
  <main class="document">
    ${bodyHtml}
  </main>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
