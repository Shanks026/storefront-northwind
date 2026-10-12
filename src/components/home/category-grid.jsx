import { Link } from "react-router"

import { CATEGORIES, categoryHref } from "@/lib/categories"

/** Square tile + label. The emoji tile stands in for a category image (swap in an <img> when you have them). */
export function CategoryGrid() {
  return (
    <section aria-labelledby="shop-by-category">
      <div className="mb-4 flex items-end justify-between">
        <h2 id="shop-by-category" className="text-lg font-semibold tracking-tight">
          Shop by category
        </h2>
        <p className="text-[13px] text-muted-foreground">{CATEGORIES.length} categories</p>
      </div>
      <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 lg:grid-cols-6">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link to={categoryHref(c.slug)} className="group flex flex-col items-center gap-2.5 text-center outline-none">
              <span
                className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl bg-muted/60 transition-shadow group-hover:shadow-md group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50"
              >
                <span aria-hidden className="text-4xl transition-transform duration-300 group-hover:scale-110 sm:text-5xl">
                  {c.emoji}
                </span>
              </span>
              <span className="text-[13px] leading-tight font-medium group-hover:text-primary">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
