import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
} from "@codemirror/view";

export interface ThemeOpts {
  dark: boolean;
  fontSize: number;
  lineHeight: number;
}

const themeCompartment = new Compartment();
const readOnlyCompartment = new Compartment();

function buildTheme(opts: ThemeOpts): Extension {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        fontSize: `${opts.fontSize}px`,
      },
      ".cm-scroller": {
        lineHeight: String(opts.lineHeight),
        fontFamily: "var(--font-mono)",
      },
      ".cm-content": {
        caretColor: "var(--accent)",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--accent)",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor: "var(--accent-subtle) !important",
        },
      ".cm-gutters": {
        backgroundColor: "transparent",
        color: "var(--muted-foreground)",
        borderRight: "1px solid var(--border)",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "var(--accent-subtle)",
      },
      ".cm-activeLine": {
        backgroundColor: "var(--btn-hover)",
      },
    },
    { dark: opts.dark },
  );
}

function baseExtensions(
  theme: ThemeOpts,
  onChange: (value: string) => void,
  readOnly = false,
): Extension[] {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      onChange(update.state.doc.toString());
    }
  });

  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    drawSelection(),
    indentOnInput(),
    bracketMatching(),
    foldGutter(),
    history(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
    }),
    themeCompartment.of(buildTheme(theme)),
    readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
    keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
    placeholder("Write or paste markdown here…"),
    EditorView.lineWrapping,
    updateListener,
  ];
}

export const createMarkdownEditor = {
  buildTheme,

  create(options: {
    parent: HTMLElement;
    initialDoc: string;
    theme: ThemeOpts;
    onChange: (value: string) => void;
    readOnly?: boolean;
  }): EditorView {
    const state = EditorState.create({
      doc: options.initialDoc,
      extensions: baseExtensions(
        options.theme,
        options.onChange,
        options.readOnly,
      ),
    });

    return new EditorView({ state, parent: options.parent });
  },

  reconfigureTheme(view: EditorView, theme: ThemeOpts) {
    view.dispatch({
      effects: themeCompartment.reconfigure(buildTheme(theme)),
    });
  },

  reconfigureReadOnly(view: EditorView, readOnly: boolean) {
    view.dispatch({
      effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  },

  setDocument(view: EditorView, content: string) {
    const current = view.state.doc.toString();
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      });
    }
  },
};

export interface MarkdownSnippet {
  before: string;
  after?: string;
  placeholder?: string;
}

export function insertSnippet(view: EditorView, snippet: MarkdownSnippet) {
  const { from, to } = view.state.selection.main;
  const selected = view.state.sliceDoc(from, to);
  const after = snippet.after ?? "";
  const text = selected || snippet.placeholder || "";
  const insert = `${snippet.before}${text}${after}`;

  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + snippet.before.length + text.length },
  });
  view.focus();
}
