import type { EditorView } from "@codemirror/view";
import { create } from "zustand";

import {
  insertSnippet,
  type MarkdownSnippet,
} from "@/components/editor/codemirror-setup";

interface EditorState {
  view: EditorView | null;
  setView: (view: EditorView | null) => void;
  insertMarkdown: (snippet: MarkdownSnippet) => void;
  focus: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  view: null,
  setView: (view) => set({ view }),
  insertMarkdown: (snippet) => {
    const { view } = get();
    if (!view) return;
    insertSnippet(view, snippet);
  },
  focus: () => {
    get().view?.focus();
  },
}));
