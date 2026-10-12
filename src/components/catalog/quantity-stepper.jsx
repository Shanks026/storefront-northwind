import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function QuantityStepper({ value, onChange, min = 1, max = 10, disabled, size = "default", className }) {
  const btn = size === "sm" ? "size-7" : "size-9"

  return (
    <div className={cn("inline-flex items-center rounded-lg border bg-background", disabled && "opacity-50", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(btn, "rounded-r-none")}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus />
      </Button>
      <span className={cn("min-w-9 text-center text-sm font-semibold tabular-nums")} aria-live="polite" aria-label={`Quantity ${value}`}>
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(btn, "rounded-l-none")}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus />
      </Button>
    </div>
  )
}
