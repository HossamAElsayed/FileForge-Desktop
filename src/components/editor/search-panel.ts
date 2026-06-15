import {
  SearchQuery,
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  replaceAll,
  replaceNext,
  selectMatches,
  setSearchQuery,
} from "@codemirror/search";
import { runScopeHandlers, type EditorView, type ViewUpdate } from "@codemirror/view";

export let focusReplaceFieldOnMount = false;

export function requestReplaceFieldFocus() {
  focusReplaceFieldOnMount = true;
}

function svgIcon(path: string) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS(ns, "path");
  p.setAttribute("d", path);
  svg.appendChild(p);
  return svg;
}

const ICONS = {
  prev: "m15 18-6-6 6-6",
  next: "m9 18 6-6-6-6",
  close: "M18 6 6 18M6 6l12 12",
} as const;

function iconButton(
  name: string,
  label: string,
  iconPath: string,
  onClick: () => void,
) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.name = name;
  btn.className = "ff-search__icon-btn";
  btn.setAttribute("aria-label", label);
  btn.title = label;
  btn.appendChild(svgIcon(iconPath));
  btn.addEventListener("click", onClick);
  return btn;
}

function textButton(name: string, label: string, onClick: () => void, primary = false) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.name = name;
  btn.className = primary ? "ff-search__btn ff-search__btn--primary" : "ff-search__btn";
  btn.textContent = label;
  btn.title = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function toggleButton(name: string, label: string, title: string) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.name = name;
  btn.className = "ff-search__toggle";
  btn.textContent = label;
  btn.title = title;
  btn.setAttribute("aria-pressed", "false");
  btn.setAttribute("aria-label", title);
  return btn;
}

function labeledInput(placeholder: string, ariaLabel: string, mainField = false) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "ff-search__input";
  input.placeholder = placeholder;
  input.setAttribute("aria-label", ariaLabel);
  input.autocomplete = "off";
  input.spellcheck = false;
  if (mainField) {
    input.setAttribute("main-field", "true");
  }
  return input;
}

class FileForgeSearchPanel {
  readonly dom: HTMLElement;
  private readonly view: EditorView;
  private query: SearchQuery;
  private readonly searchField: HTMLInputElement;
  private readonly replaceField: HTMLInputElement;
  private readonly caseBtn: HTMLButtonElement;
  private readonly reBtn: HTMLButtonElement;
  private readonly wordBtn: HTMLButtonElement;
  private readonly replaceRow: HTMLElement;

  constructor(view: EditorView) {
    this.view = view;
    this.query = getSearchQuery(view.state);
    this.commit = this.commit.bind(this);
    this.keydown = this.keydown.bind(this);

    this.searchField = labeledInput("Find in document…", "Find", true);
    this.replaceField = labeledInput("Replace with…", "Replace");
    this.caseBtn = toggleButton("case", "Aa", "Match case");
    this.reBtn = toggleButton("re", ".*", "Regular expression");
    this.wordBtn = toggleButton("word", "W", "Whole word");

    for (const input of [this.searchField, this.replaceField]) {
      input.addEventListener("input", this.commit);
      input.addEventListener("change", this.commit);
    }

    for (const btn of [this.caseBtn, this.reBtn, this.wordBtn]) {
      btn.addEventListener("click", () => {
        const pressed = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", String(!pressed));
        this.commit();
      });
    }

    const findRow = document.createElement("div");
    findRow.className = "ff-search__row";
    findRow.append(
      this.searchField,
      iconButton("prev", "Previous match", ICONS.prev, () => findPrevious(view)),
      iconButton("next", "Next match", ICONS.next, () => findNext(view)),
      textButton("select", "All", () => selectMatches(view)),
      this.caseBtn,
      this.reBtn,
      this.wordBtn,
      iconButton("close", "Close search", ICONS.close, () => closeSearchPanel(view)),
    );

    this.replaceRow = document.createElement("div");
    this.replaceRow.className = "ff-search__row ff-search__row--replace";

    if (!view.state.readOnly) {
      const replaceActions = document.createElement("div");
      replaceActions.className = "ff-search__actions";
      replaceActions.append(
        textButton("replace", "Replace", () => replaceNext(view)),
        textButton("replaceAll", "Replace all", () => replaceAll(view), true),
      );
      this.replaceRow.append(this.replaceField, replaceActions);
    }

    const inner = document.createElement("div");
    inner.className = "ff-search";
    inner.addEventListener("keydown", this.keydown);
    inner.append(findRow);
    if (!view.state.readOnly) {
      inner.append(this.replaceRow);
    }

    this.dom = document.createElement("div");
    this.dom.className = "ff-search-panel";
    this.dom.append(inner);

    this.syncFields(this.query);
  }

  get top() {
    return true;
  }

  mount() {
    if (focusReplaceFieldOnMount && !this.view.state.readOnly) {
      focusReplaceFieldOnMount = false;
      this.replaceField.focus();
      this.replaceField.select();
    } else {
      this.searchField.focus();
      this.searchField.select();
    }
  }

  update(update: ViewUpdate) {
    for (const tr of update.transactions) {
      for (const effect of tr.effects) {
        if (effect.is(setSearchQuery) && !effect.value.eq(this.query)) {
          this.syncFields(effect.value);
        }
      }
    }
  }

  private syncFields(query: SearchQuery) {
    this.query = query;
    this.searchField.value = query.search;
    this.replaceField.value = query.replace;
    this.caseBtn.setAttribute("aria-pressed", String(query.caseSensitive));
    this.reBtn.setAttribute("aria-pressed", String(query.regexp));
    this.wordBtn.setAttribute("aria-pressed", String(query.wholeWord));
  }

  private commit() {
    const next = new SearchQuery({
      search: this.searchField.value,
      replace: this.replaceField.value,
      caseSensitive: this.caseBtn.getAttribute("aria-pressed") === "true",
      regexp: this.reBtn.getAttribute("aria-pressed") === "true",
      wholeWord: this.wordBtn.getAttribute("aria-pressed") === "true",
    });

    if (!next.eq(this.query)) {
      this.query = next;
      this.view.dispatch({ effects: setSearchQuery.of(next) });
    }
  }

  private keydown(event: KeyboardEvent) {
    if (runScopeHandlers(this.view, event, "search-panel")) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter" && event.target === this.searchField) {
      event.preventDefault();
      (event.shiftKey ? findPrevious : findNext)(this.view);
    } else if (event.key === "Enter" && event.target === this.replaceField) {
      event.preventDefault();
      replaceNext(this.view);
    }
  }
}

export function createFileForgeSearchPanel(view: EditorView) {
  return new FileForgeSearchPanel(view);
}
