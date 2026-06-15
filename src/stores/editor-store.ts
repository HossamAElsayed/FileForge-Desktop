import type { EditorView } from "@codemirror/view";
import { create } from "zustand";

import {
  insertHorizontalRule,
  insertImage,
  insertLink,
  insertTable,
  insertCodeBlock,
  openFind,
  openReplace,
  runRedo,
  runUndo,
  setHeading,
  toggleBlockquote,
  toggleBulletList,
  toggleOrderedList,
  toggleTaskList,
  toggleWrap,
} from "@/lib/editor-commands";

interface EditorState {
  view: EditorView | null;
  setView: (view: EditorView | null) => void;
  focus: () => void;
  undo: () => void;
  redo: () => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleStrikethrough: () => void;
  toggleInlineCode: () => void;
  setHeading: (level: number) => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  toggleTaskList: () => void;
  toggleBlockquote: () => void;
  insertLink: (label: string, url: string) => void;
  insertImage: (alt: string, src: string) => void;
  insertTable: () => void;
  insertHorizontalRule: () => void;
  insertCodeBlock: () => void;
  openFind: () => void;
  openReplace: () => void;
}

function withView(
  get: () => EditorState,
  run: (view: EditorView) => void,
) {
  const { view } = get();
  if (!view) return;
  run(view);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  view: null,
  setView: (view) => set({ view }),
  focus: () => get().view?.focus(),
  undo: () => withView(get, runUndo),
  redo: () => withView(get, runRedo),
  toggleBold: () => withView(get, (view) => toggleWrap(view, "**", "**", "text")),
  toggleItalic: () => withView(get, (view) => toggleWrap(view, "*", "*", "text")),
  toggleStrikethrough: () =>
    withView(get, (view) => toggleWrap(view, "~~", "~~", "text")),
  toggleInlineCode: () => withView(get, insertCodeBlock),
  setHeading: (level) => withView(get, (view) => setHeading(view, level)),
  toggleBulletList: () => withView(get, toggleBulletList),
  toggleOrderedList: () => withView(get, toggleOrderedList),
  toggleTaskList: () => withView(get, toggleTaskList),
  toggleBlockquote: () => withView(get, toggleBlockquote),
  insertLink: (label, url) => withView(get, (view) => insertLink(view, label, url)),
  insertImage: (alt, src) => withView(get, (view) => insertImage(view, alt, src)),
  insertTable: () => withView(get, insertTable),
  insertHorizontalRule: () => withView(get, insertHorizontalRule),
  insertCodeBlock: () => withView(get, insertCodeBlock),
  openFind: () => withView(get, openFind),
  openReplace: () => withView(get, openReplace),
}));
