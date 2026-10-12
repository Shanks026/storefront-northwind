/**
 * Mock cart backed by localStorage (`sf_cart`), shared by guests and signed-in users on this device.
 * Stored lines are minimal { id, productId, color, size, quantity }; product details, prices and
 * stock are joined from the catalog on every read, like a server would.
 */
import { MAX_QTY_PER_ITEM, STORAGE_KEYS } from "@/lib/constants"
import { quote } from "@/lib/pricing"
import { ApiError, request, storage } from "./client"
import { PRODUCTS } from "./seed"

const lineId = (productId, color, size) => [productId, color ?? "", size ?? ""].join("|")
const maxFor = (product) => Math.min(product.stock, MAX_QTY_PER_ITEM)
const readLines = () => storage.get(STORAGE_KEYS.cart, [])
const writeLines = (lines) => storage.set(STORAGE_KEYS.cart, lines)

// Writes run one at a time in call order (like a server), so rapid +/− clicks can't
// finish out of order and persist a stale quantity.
let queue = Promise.resolve()
function serial(fn) {
  const run = queue.then(() => request(fn))
  queue = run.catch(() => {})
  return run
}

/** Cart totals. Shared with optimistic updates in the hooks. */
export function summarize(lines) {
  return { lines, ...quote(lines) }
}

function hydrate(stored) {
  const lines = []
  for (const line of stored) {
    const p = PRODUCTS.find((x) => x.id === line.productId)
    if (!p) continue // product removed from the catalog
    lines.push({
      id: line.id,
      productId: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      art: p.art,
      image: p.image,
      colors: p.colors,
      color: p.colors.find((c) => c.name === line.color) ?? null,
      size: line.size,
      quantity: Math.min(line.quantity, Math.max(1, maxFor(p))),
      maxQuantity: maxFor(p),
      inStock: p.stock > 0,
    })
  }
  return summarize(lines)
}

export function getCart() {
  return request(() => hydrate(readLines()))
}

/** Adds (or merges into an existing product+colour+size line). Returns { cart, added }. */
export function addItem({ productId, color, size, quantity = 1 }) {
  return serial(() => {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) throw new ApiError("This product is no longer available.", 404)
    if (product.stock === 0) throw new ApiError("This product is out of stock.", 409)
    if (product.sizes.length > 0 && !product.sizes.includes(size)) throw new ApiError("Please select a size.", 422)

    const lines = readLines()
    const id = lineId(productId, color, size)
    const existing = lines.find((l) => l.id === id)
    const current = existing?.quantity ?? 0
    const room = maxFor(product) - current
    if (room <= 0) throw new ApiError(`You already have the maximum (${maxFor(product)}) of this item in your cart.`, 409)

    const added = Math.min(quantity, room)
    if (existing) existing.quantity += added
    else lines.push({ id, productId, color: color ?? null, size: size ?? null, quantity: added })
    writeLines(lines)
    return { cart: hydrate(lines), added }
  })
}

export function updateItem(id, quantity) {
  return serial(() => {
    const lines = readLines()
    const line = lines.find((l) => l.id === id)
    if (!line) throw new ApiError("This item is no longer in your cart.", 404)
    const product = PRODUCTS.find((p) => p.id === line.productId)
    line.quantity = Math.max(1, Math.min(quantity, product ? maxFor(product) : quantity))
    writeLines(lines)
    return hydrate(lines)
  })
}

export function removeItem(id) {
  return serial(() => {
    const lines = readLines().filter((l) => l.id !== id)
    writeLines(lines)
    return hydrate(lines)
  })
}

export function clearCart() {
  return serial(() => {
    writeLines([])
    return hydrate([])
  })
}

/**
 * For the order API: runs `fn({ cart, clear })` in the cart's write queue so an order is
 * placed against the cart exactly as it is after any in-flight quantity edits.
 */
export function withCart(fn) {
  return serial(() => fn({ cart: hydrate(readLines()), clear: () => writeLines([]) }))
}
