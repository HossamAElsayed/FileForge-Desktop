import { redo, undo } from "@codemirror/commands";
import {
  closeSearchPanel,
  getSearchQuery,
  openSearchPanel,
  SearchQuery,
  setSearchQuery,
} from "@codemirror/search";
import type { EditorView } from "@codemirror/view";

import { requestReplaceFieldFocus } from "@/components/editor/search-panel";

function getSelectionOrWord(view: EditorView): { from: number; to: number; text: string } {
  const { from, to } = view.state.selection.main;
  if (from !== to) {
    return { from, to, text: view.state.sliceDoc(from, to) };
  }

  const line = view.state.doc.lineAt(from);
  const before = view.state.sliceDoc(line.from, from);
  const after = view.state.sliceDoc(from, line.to);
  const wordBefore = before.match(/[\w*-]+$/)?.[0] ?? "";
  const wordAfter = after.match(/^[\w*-]+/)?.[0] ?? "";
  const wordFrom = from - wordBefore.length;
  const wordTo = from + wordAfter.length;

  if (wordFrom < wordTo) {
    return { from: wordFrom, to: wordTo, text: view.state.sliceDoc(wordFrom, wordTo) };
  }

  return { from, to, text: "" };
}

export function toggleWrap(view: EditorView, before: string, after: string, placeholder = "text") {
  const { from, to, text } = getSelectionOrWord(view);
  const inner = text || placeholder;
  const wrapped = `${before}${inner}${after}`;

  if (text && text.startsWith(before) && text.endsWith(after) && text.length >= before.length + after.length) {
    const unwrapped = text.slice(before.length, text.length - after.length);
    view.dispatch({
      changes: { from, to, insert: unwrapped },
      selection: { anchor: from, head: from + unwrapped.length },
    });
  } else if (
    from > before.length &&
    view.state.sliceDoc(from - before.length, from) === before &&
    view.state.sliceDoc(to, to + after.length) === after
  ) {
    view.dispatch({
      changes: [
        { from: to, to: to + after.length },
        { from: from - before.length, to: from },
      ],
      selection: { anchor: from - before.length, head: to - before.length },
    });
  } else {
    view.dispatch({
      changes: { from, to, insert: wrapped },
      selection: text
        ? { anchor: from + before.length, head: from + before.length + inner.length }
        : { anchor: from + before.length, head: from + before.length + placeholder.length },
    });
  }
  view.focus();
}

function getLineRanges(view: EditorView): { from: number; to: number; line: number }[] {
  const { from, to } = view.state.selection.main;
  const startLine = view.state.doc.lineAt(from).number;
  const endLine = view.state.doc.lineAt(to).number;
  const ranges: { from: number; to: number; line: number }[] = [];

  for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
    const line = view.state.doc.line(lineNum);
    ranges.push({ from: line.from, to: line.to, line: lineNum });
  }
  return ranges;
}

export function toggleLinePrefix(
  view: EditorView,
  prefix: string,
  existingPrefix = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
) {
  const ranges = getLineRanges(view);
  const changes: { from: number; to: number; insert: string }[] = [];
  let allHavePrefix = ranges.length > 0;

  for (const range of ranges) {
    const lineText = view.state.sliceDoc(range.from, range.to);
    if (!existingPrefix.test(lineText)) {
      allHavePrefix = false;
      break;
    }
  }

  for (const range of ranges) {
    const lineText = view.state.sliceDoc(range.from, range.to);
    if (allHavePrefix) {
      const match = lineText.match(existingPrefix);
      if (match) {
        changes.push({ from: range.from, to: range.from + match[0].length, insert: "" });
      }
    } else if (!existingPrefix.test(lineText)) {
      changes.push({ from: range.from, to: range.from, insert: prefix });
    }
  }

  if (changes.length > 0) {
    view.dispatch({ changes });
  }
  view.focus();
}

const HEADING_PREFIX_RE = /^#{1,6}\s/;

export function setHeading(view: EditorView, level: number) {
  const ranges = getLineRanges(view);
  const changes: { from: number; to: number; insert: string }[] = [];

  for (const range of ranges) {
    const lineText = view.state.sliceDoc(range.from, range.to);
    const headingMatch = lineText.match(HEADING_PREFIX_RE);
    const contentStart = range.from + (headingMatch?.[0].length ?? 0);

    if (level === 0) {
      if (headingMatch) {
        changes.push({ from: range.from, to: contentStart, insert: "" });
      }
    } else {
      const prefix = `${"#".repeat(level)} `;
      if (headingMatch) {
        changes.push({ from: range.from, to: contentStart, insert: prefix });
      } else {
        changes.push({ from: range.from, to: range.from, insert: prefix });
      }
    }
  }

  if (changes.length > 0) {
    view.dispatch({ changes });
  }
  view.focus();
}

export function toggleBulletList(view: EditorView) {
  toggleLinePrefix(view, "- ", /^[-*+]\s/);
}

export function toggleOrderedList(view: EditorView) {
  const ranges = getLineRanges(view);
  const changes: { from: number; to: number; insert: string }[] = [];
  const orderedRe = /^\d+\.\s/;
  let allOrdered = ranges.every((range) => {
    const lineText = view.state.sliceDoc(range.from, range.to);
    return orderedRe.test(lineText);
  });

  ranges.forEach((range, index) => {
    const lineText = view.state.sliceDoc(range.from, range.to);
    if (allOrdered) {
      const match = lineText.match(orderedRe);
      if (match) {
        changes.push({ from: range.from, to: range.from + match[0].length, insert: "" });
      }
    } else if (!orderedRe.test(lineText) && !/^[-*+]\s/.test(lineText)) {
      changes.push({ from: range.from, to: range.from, insert: `${index + 1}. ` });
    }
  });

  if (changes.length > 0) {
    view.dispatch({ changes });
  }
  view.focus();
}

export function toggleTaskList(view: EditorView) {
  toggleLinePrefix(view, "- [ ] ", /^- \[[ xX]\]\s/);
}

export function toggleBlockquote(view: EditorView) {
  toggleLinePrefix(view, "> ", /^>\s/);
}

export function insertBlock(view: EditorView, text: string) {
  const { from, to } = view.state.selection.main;
  const needsLeadingNewline = from > 0 && view.state.sliceDoc(from - 1, from) !== "\n";
  const insert = `${needsLeadingNewline ? "\n" : ""}${text}\n`;

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
  });
  view.focus();
}

export function insertHorizontalRule(view: EditorView) {
  insertBlock(view, "---");
}

export function insertTable(view: EditorView) {
  insertBlock(
    view,
    "| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell     | Cell     |",
  );
}

export function insertCodeBlock(view: EditorView) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);

  if (selected.includes("\n")) {
    toggleWrap(view, "\n```\n", "\n```\n", selected);
  } else {
    toggleWrap(view, "`", "`", selected || "code");
  }
}

export function insertLink(view: EditorView, label: string, url: string) {
  const { from, to, text } = getSelectionOrWord(view);
  const linkLabel = label || text || "label";
  const insert = `[${linkLabel}](${url || "url"})`;

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
  });
  view.focus();
}

export function insertImage(view: EditorView, alt: string, src: string) {
  const { from, to, text } = getSelectionOrWord(view);
  const imageAlt = alt || text || "alt";
  const insert = `![${imageAlt}](${src || "url"})`;

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + insert.length },
  });
  view.focus();
}

export function runUndo(view: EditorView) {
  undo(view);
  view.focus();
}

export function runRedo(view: EditorView) {
  redo(view);
  view.focus();
}

export function openFind(view: EditorView) {
  openSearchPanel(view);
  view.focus();
}

export function openReplace(view: EditorView) {
  requestReplaceFieldFocus();
  openSearchPanel(view);
  const current = getSearchQuery(view.state);
  view.dispatch({
    effects: setSearchQuery.of(
      new SearchQuery({
        search: current.search,
        replace: current.replace || "",
        caseSensitive: current.caseSensitive,
        literal: current.literal,
        regexp: current.regexp,
        wholeWord: current.wholeWord,
      }),
    ),
  });
  view.focus();
}

export function closeFind(view: EditorView) {
  closeSearchPanel(view);
}
