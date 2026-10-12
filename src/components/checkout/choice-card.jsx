import { cn } from "@/lib/utils"

/** Radio-button card used for delivery and payment options. */
export function ChoiceCard({ name, value, checked, onChange, title, description, aside, icon: Icon, children, className }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-colors has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50",
        checked ? "border-primary bg-primary/[0.03]" : "hover:border-foreground/20",
        className,
      )}
    >
      <label className="flex cursor-pointer items-start gap-3 p-4">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        {Icon && <Icon className={cn("mt-0.5 size-4.5 shrink-0", checked ? "text-primary" : "text-muted-foreground")} />}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{title}</span>
          {description && <span className="block text-[13px] text-muted-foreground">{description}</span>}
        </span>
        {aside && <span className="shrink-0 text-right text-[13px] font-semibold">{aside}</span>}
      </label>
      {checked && children && <div className="border-t px-4 pt-4 pb-4 sm:pl-11">{children}</div>}
    </div>
  )
}
