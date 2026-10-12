/**
 * Static, display-only customer ratings and Q&A. Generated deterministically per product
 * (seeded by product id), so each product always shows the same placeholder content and the
 * star distribution averages to the product's listed rating.
 */
import { ApiError, request } from "./client"
import { PRODUCTS } from "./seed"

// ── deterministic randomness ────────────────────────────────────────────────
function seedFrom(text) {
  let h = 2166136261
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}
function rng(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (rand, list) => list[Math.floor(rand() * list.length)]
const DAY = 24 * 60 * 60 * 1000
const BASE = Date.parse("2026-10-01T10:00:00Z")

const NAMES = [
  "Priya Sharma", "Rahul Mehta", "Ananya Iyer", "Vikram Singh", "Sneha Reddy", "Arjun Nair", "Kavya Menon",
  "Rohan Gupta", "Meera Pillai", "Aditya Rao", "Ishita Bose", "Karan Malhotra", "Divya Krishnan", "Nikhil Joshi",
  "Pooja Desai", "Siddharth Kulkarni", "Neha Agarwal", "Varun Chatterjee", "Tanvi Shah", "Harsh Verma",
]

// ── star distribution that averages to the listed rating ───────────────────
function distribution(rating, total) {
  const b = Math.max(0, 5 - rating) // 0 … 1 for typical 4.x ratings
  const p1 = 0.03 * b
  const p2 = 0.03 * b
  const p3 = 0.08 * b
  const rest = 1 - p1 - p2 - p3
  const p5 = rating - (3 * p3 + 2 * p2 + p1) - 4 * rest
  const p4 = rest - p5
  const shares = { 5: p5, 4: p4, 3: p3, 2: p2, 1: p1 }
  const counts = Object.fromEntries(Object.entries(shares).map(([k, v]) => [k, Math.max(0, Math.round(v * total))]))
  counts[5] += total - Object.values(counts).reduce((a, b) => a + b, 0) // rounding remainder
  return counts
}

// ── review copy ─────────────────────────────────────────────────────────────
const REVIEW_COPY = {
  5: [
    ["Exactly what I wanted", "Quality is excellent and it looks even better in person. {hl} is a real highlight. Delivery was quick and the packaging was neat."],
    ["Worth every rupee", "I compared a few options before buying this one and I'm glad I did. Solid build, great finish, and {hl} makes a noticeable difference."],
    ["Second one I've bought", "Bought one for myself and liked it so much that I ordered another as a gift. {brand} clearly pays attention to the details."],
    ["Premium feel", "Feels far more premium than the price suggests. Have been using it daily for a few weeks with zero complaints."],
  ],
  4: [
    ["Very good, minor nitpicks", "Really happy overall. {hl} works as described. Took off one star only because the colour is slightly different from the photos."],
    ["Good value", "Does the job well and feels durable. Packaging could be more eco-friendly, but the product itself is great."],
    ["Solid purchase", "Comfortable to use and well made. Delivery took a day longer than estimated, otherwise no issues."],
  ],
  3: [
    ["Decent, not amazing", "It's okay for the price. {hl} is nice, but I expected a little more from {brand} based on the reviews."],
    ["Average experience", "Works fine but nothing special. The size was a bit smaller than I imagined, so check the specifications."],
  ],
  2: [["Expected better", "Quality didn't quite match the photos for me. Customer support was helpful though and offered a return."]],
  1: [["Not for me", "Arrived with a small defect. Return was easy and the refund came through in a few days."]],
}

const VARIANT_SIZES = (p) => (p.sizes.length ? p.sizes : [null])

function buildReviews(product, counts, rand) {
  // 6 reviews, weighted towards the common star levels, always including at least one critical one
  const levels = [5, 5, 4, 5, 4, counts[3] > 0 ? 3 : 4]
  if (counts[2] > 0 && rand() < 0.6) levels[levels.length - 1] = 2
  // keep the highlight's own casing ("Bluetooth 5.3", "USB-C")
  const hl = product.highlights?.[Math.floor(rand() * product.highlights.length)] ?? "The build quality"
  const used = new Set()
  return levels.map((stars, i) => {
    const pool = REVIEW_COPY[stars].filter(([t]) => !used.has(t))
    const [title, body] = pick(rand, pool.length ? pool : REVIEW_COPY[stars])
    used.add(title)
    const color = pick(rand, product.colors)
    const size = pick(rand, VARIANT_SIZES(product))
    return {
      id: `${product.id}-r${i}`,
      author: pick(rand, NAMES),
      rating: stars,
      title,
      body: body.replace("{hl}", hl).replace("{brand}", product.brand),
      date: new Date(BASE - Math.floor(rand() * 120) * DAY).toISOString(),
      verified: rand() > 0.15,
      variant: [color?.name, size].filter(Boolean).join(" · "),
      helpful: Math.floor(rand() * (stars >= 4 ? 140 : 40)),
    }
  })
}

// ── Q&A copy ────────────────────────────────────────────────────────────────
const QA_BY_CATEGORY = {
  electronics: [
    ["Does it support fast charging?", "Yes, it supports USB-C fast charging. A 15-minute charge gives a few hours of use."],
    ["Is there a warranty in India?", "Yes, it comes with a manufacturer warranty valid across India. Keep your order invoice."],
  ],
  computers: [
    ["Does it work with Mac and Windows?", "Yes, it works with macOS, Windows and Linux without any extra drivers."],
    ["Is it suitable for long work hours?", "Definitely. I use it 8–9 hours a day and it's been comfortable."],
  ],
  fashion: [
    ["Does it shrink after washing?", "It's pre-shrunk. Wash cold and line dry to keep the fit for longer."],
    ["Is the fit true to size?", "Fits true to size. If you're between sizes, go one size up for a relaxed fit."],
  ],
  bags: [
    ["Will a 16-inch laptop fit?", "Yes, the padded sleeve fits most 16-inch laptops comfortably."],
    ["Is it water resistant?", "It handles light rain well. For heavy rain, use a rain cover."],
  ],
  home: [
    ["Is it safe for homes with kids and pets?", "Yes, materials are non-toxic. Keep candles and small parts out of reach as usual."],
    ["How should I clean it?", "Wipe with a soft dry cloth. Avoid harsh chemicals."],
  ],
  kitchen: [
    ["Is it dishwasher safe?", "Yes, it's dishwasher safe. Hand washing will keep the finish looking new for longer."],
    ["Can I use it in the microwave?", "Ceramic items are microwave safe; steel items are not."],
  ],
  stationery: [
    ["Does ink bleed through the pages?", "No bleed-through with gel or ballpoint pens. Very wet fountain pen inks may ghost slightly."],
    ["Is the paper acid-free?", "Yes, the paper is acid-free and archival quality."],
  ],
  fitness: [
    ["Is it slippery when sweaty?", "Grip actually improves with a little moisture. Wipe it down after each session."],
    ["Does it come with a carry bag?", "Yes, a carry strap/pouch is included in the box."],
  ],
  beauty: [
    ["Is it suitable for sensitive skin?", "It's fragrance-free and dermatologist tested, but we always recommend a patch test first."],
    ["What is the shelf life?", "24 months unopened, 12 months after opening."],
  ],
  kids: [
    ["What age is this suitable for?", "Recommended for the age printed on the box. Small parts are not suitable for under-3s."],
    ["Are the paints non-toxic?", "Yes, all paints and materials are child-safe and non-toxic."],
  ],
  pets: [
    ["Is it machine washable?", "The cover is removable and machine washable on a gentle cycle."],
    ["Will it suit a large dog?", "Check the size chart in the specifications; size L fits most large breeds."],
  ],
  gifts: [
    ["Can I add a gift message?", "Yes, you can add a personal note and we'll print it on a card in the box."],
    ["Is the price shown on the package?", "No, gift orders never include the price or invoice in the box."],
  ],
}
const QA_GENERIC = [
  ["Is cash on delivery available?", "Yes, cash on delivery is available on this item across most PIN codes."],
  ["What is the return policy?", "You can return it within 30 days of delivery if it's unused and in its original packaging."],
  ["How long does delivery take?", "Standard delivery takes 3–5 business days. It's free on orders over ₹999."],
  ["Is this an original product?", "Yes, it's sold directly by the maker and fulfilled by Northwind."],
]

function buildQuestions(product, rand) {
  const pool = [...(QA_BY_CATEGORY[product.category] ?? []), ...QA_GENERIC]
  const count = 4 + Math.floor(rand() * 3) // 4–6
  return pool.slice(0, count).map(([question, answer], i) => {
    const bySeller = i % 2 === 0 || rand() < 0.3
    const asked = BASE - Math.floor(30 + rand() * 150) * DAY
    return {
      id: `${product.id}-q${i}`,
      question,
      answer,
      answeredBy: bySeller ? product.brand : pick(rand, NAMES),
      role: bySeller ? "Seller" : "Customer",
      askedAt: new Date(asked).toISOString(),
      answeredAt: new Date(asked + Math.floor(1 + rand() * 5) * DAY).toISOString(),
      helpful: Math.floor(rand() * 60),
    }
  })
}

function findProduct(slug) {
  const product = PRODUCTS.find((p) => p.slug === slug)
  if (!product) throw new ApiError("Product not found", 404)
  return product
}

/** { average, total, reviewCount, distribution: {5..1}, reviews[] } */
export function getProductReviews(slug) {
  return request(() => {
    const product = findProduct(slug)
    const rand = rng(seedFrom(`${product.id}:reviews`))
    const counts = distribution(product.rating, product.reviewCount)
    return {
      average: product.rating,
      total: product.reviewCount,
      reviewCount: Math.round(product.reviewCount * 0.32),
      distribution: counts,
      reviews: buildReviews(product, counts, rand),
    }
  })
}

/** [{ id, question, answer, answeredBy, role, askedAt, answeredAt, helpful }] */
export function getProductQuestions(slug) {
  return request(() => {
    const product = findProduct(slug)
    return buildQuestions(product, rng(seedFrom(`${product.id}:qa`)))
  })
}
