import { CATEGORIES } from "@/lib/categories"
import { ApiError, request } from "./client"
import { PRODUCTS } from "./seed"

/** Price buckets in paise; `max` is exclusive. Shared with the filter UI. */
export const PRICE_RANGES = [
  { value: "under-1000", label: "Under ₹1,000", min: 0, max: 100000 },
  { value: "1000-2500", label: "₹1,000 – ₹2,500", min: 100000, max: 250000 },
  { value: "2500-5000", label: "₹2,500 – ₹5,000", min: 250000, max: 500000 },
  { value: "5000-10000", label: "₹5,000 – ₹10,000", min: 500000, max: 1000000 },
  { value: "10000-plus", label: "Over ₹10,000", min: 1000000, max: Infinity },
]

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "bestselling", label: "Best selling" },
  { value: "newest", label: "Newest arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Avg. customer rating" },
  { value: "discount", label: "Biggest discount" },
]

const categoryName = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name]))
const subName = Object.fromEntries(CATEGORIES.flatMap((c) => c.subcategories.map((s) => [`${c.slug}/${s.slug}`, s.name])))

export const discountPercent = (p) =>
  p.compareAtPrice && p.compareAtPrice > p.price ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0

function matchesQuery(p, q) {
  const haystack = [p.name, p.brand, p.tagline, categoryName[p.category], subName[`${p.category}/${p.sub}`], ...p.tags]
    .join(" ")
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

const SORTERS = {
  featured: (a, b) => b.featured - a.featured,
  bestselling: (a, b) => b.soldCount - a.soldCount,
  newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  discount: (a, b) => discountPercent(b) - discountPercent(a),
}

/** Light shape for cards — the detail page fetches the full product. */
const toSummary = ({ description, specs, highlights, ...p }) => p

/**
 * filters: { q, category, sub, deals, price, rating, inStock, sort, limit }
 * `limit` caps `items` (home page rails); `total` is always the full match count.
 * Returns { items, total, facets: { categories: [{ slug, name, count }] } }.
 * Category facet counts ignore the category filter so the sidebar can show alternatives.
 */
export function listProducts(filters = {}) {
  return request(() => {
    const { q, category, sub, deals, price, rating, inStock, sort = "featured", limit } = filters
    const range = PRICE_RANGES.find((r) => r.value === price)

    const base = PRODUCTS.filter(
      (p) =>
        (!q || matchesQuery(p, q)) &&
        (!deals || discountPercent(p) > 0) &&
        (!range || (p.price >= range.min && p.price < range.max)) &&
        (!rating || p.rating >= Number(rating)) &&
        (!inStock || p.stock > 0),
    )

    const counts = {}
    for (const p of base) counts[p.category] = (counts[p.category] ?? 0) + 1

    const items = base
      .filter((p) => (!category || p.category === category) && (!sub || p.sub === sub))
      .sort(SORTERS[sort] ?? SORTERS.featured)
      .map(toSummary)

    return {
      items: limit ? items.slice(0, limit) : items,
      total: items.length,
      facets: {
        categories: CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, count: counts[c.slug] ?? 0 })),
      },
    }
  })
}

export function getProduct(slug) {
  return request(() => {
    const product = PRODUCTS.find((p) => p.slug === slug)
    if (!product) throw new ApiError("Product not found", 404)
    return product
  })
}

/** Same subcategory first, then same category, then best sellers to fill. */
export function getRelatedProducts(slug, limit = 6) {
  return request(() => {
    const product = PRODUCTS.find((p) => p.slug === slug)
    if (!product) return []
    const score = (p) => (p.sub === product.sub ? 3 : 0) + (p.category === product.category ? 2 : 0) + p.featured / 100
    return PRODUCTS.filter((p) => p.id !== product.id)
      .sort((a, b) => score(b) - score(a))
      .slice(0, limit)
      .map(toSummary)
  })
}
