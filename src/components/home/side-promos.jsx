import { Link } from "react-router"
import { ArrowRight } from "lucide-react"

import { categoryHref } from "@/lib/categories"

// Secondary banners beside the hero carousel. Photos: Unsplash (see CREDITS.md).
const PROMOS = [
  {
    eyebrow: "Deal of the day",
    title: "Extra 15% off bags & travel",
    cta: "Shop the deal",
    to: `${categoryHref("bags")}&deals=true`,
    image: "/images/products/transit-22l-backpack.webp",
    position: "object-[50%_35%]",
  },
  {
    eyebrow: "Members save 10%",
    title: "Join free for member pricing",
    cta: "Create account",
    to: "/register",
    image: "/images/products/northwind-digital-gift-card.webp",
    position: "object-center",
  },
]

export function SidePromos() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
      {PROMOS.map((p) => (
        <Link
          key={p.title}
          to={p.to}
          className="group relative flex min-h-40 overflow-hidden rounded-2xl bg-muted text-white focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:min-h-48 lg:min-h-0"
        >
          <img
            src={p.image}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            className={`absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${p.position}`}
          />
          {/* bottom-up fade keeps the copy readable on any photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" aria-hidden />

          <div className="relative mt-auto p-5">
            <p className="text-[11px] font-semibold tracking-wider text-white/80 uppercase">{p.eyebrow}</p>
            <h3 className="mt-1 text-lg leading-snug font-bold tracking-tight text-balance">{p.title}</h3>
            <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold">
              {p.cta}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
