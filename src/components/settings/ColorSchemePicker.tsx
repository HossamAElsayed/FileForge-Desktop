import { Button } from "@/components/ui/button";
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
        <Button
          key={scheme.id}
          type="button"
          variant="outline"
          onClick={() => onChange(scheme.id)}
          className={cn(
            "h-auto justify-start gap-1.5 px-2.5 py-1.5 text-left text-xs font-normal",
            value === scheme.id && "border-primary bg-primary/10",
          )}
        >
          <span
            className="size-4 shrink-0 rounded-full border border-border"
            style={{
              background: `linear-gradient(135deg, ${scheme.light["--accent"]}, ${scheme.dark["--accent"]})`,
            }}
          />
          {scheme.label}
        </Button>
      ))}
    </div>
  );
}
