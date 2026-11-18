interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}

/**
 * A switch, drawn here rather than pulled from a component library.
 *
 * One control, one look, and it is keyboard reachable because it is a real button with
 * `role="switch"` rather than a styled div.
 */
export default function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div id={id} className="text-[13px] font-medium text-foreground">
          {label}
        </div>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
