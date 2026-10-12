import {
  Backpack,
  CookingPot,
  Dumbbell,
  Gift,
  Headphones,
  Keyboard,
  NotebookPen,
  PawPrint,
  Puzzle,
  Shirt,
  Sofa,
  Sparkles,
} from "lucide-react"

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const sub = (...names) => names.map((name) => ({ name, slug: slugify(name) }))

/**
 * Navigation taxonomy (static config shared by the header, mobile menu and home tiles).
 * Product seed data in Phase 2 references these slugs.
 * `tone` = tile background + icon colour classes.
 */
export const CATEGORIES = [
  {
    slug: "electronics",
    emoji: "🎧",
    name: "Electronics",
    icon: Headphones,
    tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    subcategories: sub("Headphones", "Speakers", "Chargers & cables", "Smart home"),
  },
  {
    slug: "computers",
    emoji: "💻",
    name: "Computers & Desk",
    icon: Keyboard,
    tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
    subcategories: sub("Keyboards", "Mice", "Monitor stands", "Desk lamps"),
  },
  {
    slug: "fashion",
    emoji: "👕",
    name: "Fashion",
    icon: Shirt,
    tone: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    subcategories: sub("Hoodies", "T-shirts", "Caps", "Socks"),
  },
  {
    slug: "bags",
    emoji: "🎒",
    name: "Bags & Travel",
    icon: Backpack,
    tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    subcategories: sub("Backpacks", "Totes", "Pouches", "Travel accessories"),
  },
  {
    slug: "home",
    emoji: "🛋️",
    name: "Home & Living",
    icon: Sofa,
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    subcategories: sub("Candles", "Planters", "Throws", "Wall art"),
  },
  {
    slug: "kitchen",
    emoji: "🍳",
    name: "Kitchen",
    icon: CookingPot,
    tone: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    subcategories: sub("Mugs", "Coffee gear", "Bottles", "Lunch boxes"),
  },
  {
    slug: "stationery",
    emoji: "📓",
    name: "Stationery",
    icon: NotebookPen,
    tone: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    subcategories: sub("Notebooks", "Pens", "Planners", "Desk organisers"),
  },
  {
    slug: "fitness",
    emoji: "🏋️",
    name: "Sports & Fitness",
    icon: Dumbbell,
    tone: "bg-lime-50 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400",
    subcategories: sub("Yoga mats", "Resistance bands", "Gym bags", "Recovery"),
  },
  {
    slug: "beauty",
    emoji: "💄",
    name: "Beauty & Care",
    icon: Sparkles,
    tone: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
    subcategories: sub("Skincare", "Fragrance", "Grooming", "Bath"),
  },
  {
    slug: "kids",
    emoji: "🧸",
    name: "Kids & Toys",
    icon: Puzzle,
    tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
    subcategories: sub("Puzzles", "Plush", "Building sets", "Art supplies"),
  },
  {
    slug: "pets",
    emoji: "🐾",
    name: "Pet Supplies",
    icon: PawPrint,
    tone: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    subcategories: sub("Beds", "Toys", "Bowls", "Leashes"),
  },
  {
    slug: "gifts",
    emoji: "🎁",
    name: "Gifts",
    icon: Gift,
    tone: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
    subcategories: sub("Gift sets", "Gift cards", "Under ₹1,000", "For teams"),
  },
]

export function categoryHref(categorySlug, subSlug) {
  const params = new URLSearchParams({ category: categorySlug })
  if (subSlug) params.set("sub", subSlug)
  return `/products?${params}`
}

export const DEALS_HREF = "/products?deals=true"
