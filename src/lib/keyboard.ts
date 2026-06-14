export function isModKey(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

export const MOD_LABEL = navigator.platform.includes("Mac") ? "⌘" : "Ctrl";
