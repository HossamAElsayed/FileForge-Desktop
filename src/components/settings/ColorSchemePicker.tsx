import { COLOR_SCHEMES, type ColorSchemeId } from "@/themes";
import { cn } from "@/lib/utils";

interface ColorSchemePickerProps {
  value: ColorSchemeId;
  onChange: (scheme: ColorSchemeId) => void;
}

export function ColorSchemePicker({ value, onChange }: ColorSchemePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {COLOR_SCHEMES.map((scheme) => (
        <button
          key={scheme.id}
          type="button"
          onClick={() => onChange(scheme.id)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
            value === scheme.id
              ? "border-accent bg-accent-subtle text-accent"
              : "border-border hover:bg-muted",
          )}
        >
          <span
            className="size-4 rounded-full border border-border"
            style={{
              background: `linear-gradient(135deg, ${scheme.light["--accent"]}, ${scheme.dark["--accent"]})`,
            }}
          />
          {scheme.label}
        </button>
      ))}
    </div>
  );
}
