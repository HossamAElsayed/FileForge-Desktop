export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const SUPPORTED_INPUT_EXTENSIONS = [".md", ".markdown", ".txt"] as const;

export const FILE_FORMATS = {
  md: { label: "Markdown", extension: "md", enabled: true },
  pdf: { label: "PDF", extension: "pdf", enabled: true },
  docx: { label: "Word", extension: "docx", enabled: false },
  html: { label: "HTML", extension: "html", enabled: false },
  txt: { label: "Plain Text", extension: "txt", enabled: false },
} as const;

export type FileFormatKey = keyof typeof FILE_FORMATS;

export const SAMPLE_MARKDOWN = `# Welcome to FileForge

Convert your **markdown** documents to polished PDFs in seconds.

## Features

- GitHub Flavored Markdown support
- Tables, code blocks, and task lists
- Clean, print-ready output

| Format | Status |
| ------ | ------ |
| MD → PDF | Available |
| More formats | Coming soon |

\`\`\`ts
console.log("Hello, FileForge!");
\`\`\`

> Files are processed locally on your machine and never stored.
`;
