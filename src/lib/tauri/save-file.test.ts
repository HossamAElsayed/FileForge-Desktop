import { describe, expect, it } from "vitest";

import { defaultSavePath } from "@/lib/tauri/save-file";
import {
  getDirectoryPath,
  joinPath,
  sanitizeFilename,
} from "@/lib/tauri/rename-file";

describe("defaultSavePath", () => {
  it("returns Untitled.md when filename is null", () => {
    expect(defaultSavePath(null)).toBe("Untitled.md");
  });

  it("preserves markdown extensions", () => {
    expect(defaultSavePath("notes.md")).toBe("notes.md");
    expect(defaultSavePath("notes.markdown")).toBe("notes.markdown");
    expect(defaultSavePath("notes.txt")).toBe("notes.txt");
  });

  it("appends .md when extension is missing", () => {
    expect(defaultSavePath("draft")).toBe("draft.md");
  });
});

describe("sanitizeFilename", () => {
  it("returns Untitled.md for empty input", () => {
    expect(sanitizeFilename("")).toBe("Untitled.md");
    expect(sanitizeFilename("   ")).toBe("Untitled.md");
  });

  it("strips illegal path characters", () => {
    expect(sanitizeFilename('bad:name?.md')).toBe("badname.md");
    expect(sanitizeFilename('file<test>.md')).toBe("filetest.md");
  });

  it("appends .md when extension is missing", () => {
    expect(sanitizeFilename("report")).toBe("report.md");
  });

  it("preserves supported extensions", () => {
    expect(sanitizeFilename("notes.txt")).toBe("notes.txt");
    expect(sanitizeFilename("notes.markdown")).toBe("notes.markdown");
  });
});

describe("path helpers", () => {
  it("joins windows paths", () => {
    expect(joinPath("C:\\Users\\docs", "notes.md")).toBe(
      "C:\\Users\\docs\\notes.md",
    );
  });

  it("joins posix paths", () => {
    expect(joinPath("/home/user/docs", "notes.md")).toBe(
      "/home/user/docs/notes.md",
    );
  });

  it("extracts directory from windows path", () => {
    expect(getDirectoryPath("C:\\Users\\docs\\notes.md")).toBe(
      "C:\\Users\\docs",
    );
  });

  it("extracts directory from posix path", () => {
    expect(getDirectoryPath("/home/user/docs/notes.md")).toBe(
      "/home/user/docs",
    );
  });
});
