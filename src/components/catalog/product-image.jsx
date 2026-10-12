import { useState } from "react"
import {
  Activity,
  Backpack,
  Blocks,
  Bone,
  Cable,
  CalendarDays,
  Cat,
  Coffee,
  CreditCard,
  Dog,
  Droplet,
  Dumbbell,
  FlameKindling,
  Footprints,
  Gift,
  Headphones,
  HeartPulse,
  Keyboard,
  LampDesk,
  Luggage,
  Milk,
  Mouse,
  Notebook,
  Package,
  Pen,
  Puzzle,
  Rabbit,
  Scissors,
  Shirt,
  ShoppingBag,
  Sofa,
  Speaker,
  SprayCan,
  Sprout,
} from "lucide-react"

import { cn } from "@/lib/utils"

const ICONS = {
  Activity, Backpack, Blocks, Bone, Cable, CalendarDays, Cat, Coffee, CreditCard, Dog, Droplet, Dumbbell,
  FlameKindling, Footprints, Gift, Headphones, HeartPulse, Keyboard, LampDesk, Luggage, Milk, Mouse, Notebook,
  Package, Pen, Puzzle, Rabbit, Scissors, Shirt, ShoppingBag, Sofa, Speaker, SprayCan, Sprout,
}

/** Very light colours (white, silver) would vanish as an icon stroke; draw them in grey. */
function strokeFor(hex) {
  const n = parseInt(hex.slice(1), 16)
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.8 ? "#9ca3af" : hex
}

// Four "camera angles" so the gallery has distinct shots without real photos.
const VIEWS = [
  { icon: "size-[46%]", wrap: "" },
  { icon: "size-[40%] -rotate-12 translate-x-[8%]", wrap: "" },
  { icon: "size-[120%] translate-x-[22%] translate-y-[18%]", wrap: "" },
  { icon: "size-[30%] -translate-y-[6%]", wrap: "after:absolute after:bottom-[24%] after:h-[5%] after:w-[34%] after:rounded-[50%] after:bg-black/10 after:blur-sm" },
]

/**
 * Product visual. Renders the `product.image` photo when present; falls back to generated
 * art (tinted by the product tone and selected colour) if there's no photo or it fails to load.
 */
export function ProductImage({ product, color, view = 0, className, iconClassName, eager = false }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const hex = (color ?? product.colors?.[0])?.hex ?? "#6b7280"
  const tone = product.art?.tone ?? "#e5e7eb"

  if (product.image && failedSrc !== product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailedSrc(product.image)}
        className={cn("aspect-square w-full bg-muted object-cover", className)}
      />
    )
  }

  const Icon = ICONS[product.art?.icon] ?? Package
  const v = VIEWS[view % VIEWS.length]

  return (
    <div
      role="img"
      aria-label={`${product.name}${color ? ` in ${color.name}` : ""}`}
      className={cn("relative grid aspect-square w-full place-items-center overflow-hidden", v.wrap, className)}
      style={{
        backgroundColor: `color-mix(in oklab, ${tone} 35%, var(--muted))`,
        backgroundImage: `radial-gradient(circle at 30% 20%, color-mix(in oklab, white 55%, transparent), transparent 60%), radial-gradient(circle at 80% 90%, color-mix(in oklab, ${hex} 22%, transparent), transparent 55%)`,
      }}
    >
      <Icon
        className={cn("drop-shadow-sm transition-transform duration-500", v.icon, iconClassName)}
        style={{ color: strokeFor(hex) }}
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  )
}
