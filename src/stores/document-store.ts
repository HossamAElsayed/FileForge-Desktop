import { create } from "zustand";

interface DocumentState {
  content: string;
  filename: string | null;
  isDirty: boolean;
  isConverting: boolean;
  convertProgress: number;
  statusMessage: string;
  editorFocusToken: number;
  setContent: (content: string, options?: { filename?: string | null; dirty?: boolean }) => void;
  setFilename: (filename: string | null) => void;
  markDirty: () => void;
  markClean: () => void;
  setConverting: (isConverting: boolean) => void;
  setConvertProgress: (progress: number, message?: string) => void;
  requestEditorFocus: () => void;
  reset: () => void;
  newDocument: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  content: "",
  filename: null,
  isDirty: false,
  isConverting: false,
  convertProgress: 0,
  statusMessage: "",
  editorFocusToken: 0,
  setContent: (content, options) =>
    set((state) => ({
      content,
      filename:
        options?.filename !== undefined ? options.filename : state.filename,
      isDirty: options?.dirty ?? true,
    })),
  setFilename: (filename) => set({ filename }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  setConverting: (isConverting) =>
    set({ isConverting, convertProgress: isConverting ? 0 : 0, statusMessage: "" }),
  setConvertProgress: (convertProgress, statusMessage = "") =>
    set({ convertProgress, statusMessage }),
  requestEditorFocus: () =>
    set((state) => ({ editorFocusToken: state.editorFocusToken + 1 })),
  reset: () =>
    set({
      content: "",
      filename: null,
      isDirty: false,
      isConverting: false,
      convertProgress: 0,
      statusMessage: "",
    }),
  newDocument: () =>
    set((state) => ({
      content: "",
      filename: null,
      isDirty: false,
      isConverting: false,
      convertProgress: 0,
      statusMessage: "",
      editorFocusToken: state.editorFocusToken + 1,
    })),
}));
