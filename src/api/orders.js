/**
 * Mock orders (`sf_orders`), scoped to the signed-in user. Orders keep snapshots of the
 * items, address and payment summary at purchase time, so later catalog/address edits
 * never change history. Full card numbers / CVCs are validated and discarded — only brand + last 4 are kept.
 */
import { MAX_QTY_PER_ITEM, STORAGE_KEYS } from "@/lib/constants"
import { DELIVERY, quote } from "@/lib/pricing"
import { cardBrand, validate, validators } from "@/lib/validation"
import { requireUserId } from "./auth"
import { withCart } from "./cart"
import { ApiError, request, storage, uuid } from "./client"
import { PRODUCTS } from "./seed"

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", description: "Google Pay, PhonePe, Paytm or any UPI app" },
  { id: "card", label: "Credit / Debit card", description: "Visa, Mastercard, RuPay, Amex" },
  { id: "cod", label: "Cash on delivery", description: "Pay when your order arrives" },
]

export const PAYMENT_SCHEMAS = {
  upi: { upiId: validators.upi },
  card: {
    cardNumber: validators.cardNumber,
    cardName: validators.required("Name on card"),
    expiry: validators.expiry,
    cvc: validators.cvc,
  },
  cod: {},
}

/**
 * Simulated fulfilment: status is derived from minutes since the order was placed, so it
 * advances with no background job. Real systems would store events; the UI only reads
 * `status` and `timeline`, so swapping this out doesn't touch components.
 */
export const STATUS_FLOW = [
  { key: "confirmed", label: "Order confirmed", afterMinutes: 0 },
  { key: "packed", label: "Packed", afterMinutes: 2 },
  { key: "shipped", label: "Shipped", afterMinutes: 5 },
  { key: "out_for_delivery", label: "Out for delivery", afterMinutes: 10 },
  { key: "delivered", label: "Delivered", afterMinutes: 15 },
]
const CANCELLABLE = new Set(["confirmed", "packed"])
const MINUTE = 60 * 1000

/** Adds computed `status`, `timeline`, `cancellable` and `deliveredAt` to a stored order. */
function withStatus(order, now = Date.now()) {
  const placed = Date.parse(order.createdAt)
  const cancelledAt = order.cancelledAt ? Date.parse(order.cancelledAt) : null
  const cutoff = cancelledAt ?? now

  const reached = STATUS_FLOW.filter((s) => placed + s.afterMinutes * MINUTE <= cutoff)
  const current = reached[reached.length - 1]
  const timeline = STATUS_FLOW.map((s) => ({
    key: s.key,
    label: s.label,
    at: reached.includes(s) ? new Date(placed + s.afterMinutes * MINUTE).toISOString() : null,
    done: reached.includes(s),
  }))
  if (cancelledAt) {
    // after cancellation the remaining steps no longer apply
    const kept = timeline.filter((t) => t.done)
    kept.push({ key: "cancelled", label: "Cancelled", at: order.cancelledAt, done: true })
    return { ...order, status: "cancelled", timeline: kept, cancellable: false, deliveredAt: null }
  }
  return {
    ...order,
    status: current.key,
    timeline,
    cancellable: CANCELLABLE.has(current.key),
    deliveredAt: current.key === "delivered" ? timeline[timeline.length - 1].at : null,
  }
}

const readAll = () => storage.get(STORAGE_KEYS.orders, [])
const writeAll = (orders) => storage.set(STORAGE_KEYS.orders, orders)
const fail = (message, status = 422, extra = {}) => Object.assign(new ApiError(message, status), extra)

function paymentSummary(payment) {
  const schema = PAYMENT_SCHEMAS[payment?.method]
  if (!schema) throw fail("Choose a payment method.")
  const fields = validate(payment, schema)
  if (Object.keys(fields).length) throw fail("Please check your payment details.", 422, { fields })

  if (payment.method === "card") {
    const digits = payment.cardNumber.replace(/\D/g, "")
    return { method: "card", label: `${cardBrand(digits)} •••• ${digits.slice(-4)}`, brand: cardBrand(digits), last4: digits.slice(-4) }
  }
  if (payment.method === "upi") return { method: "upi", label: `UPI · ${payment.upiId.trim()}` }
  return { method: "cod", label: "Cash on delivery" }
}

function addressSnapshot(addressId, userId) {
  const address = storage.get(STORAGE_KEYS.addresses, []).find((a) => a.id === addressId && a.userId === userId)
  if (!address) throw fail("Choose a delivery address.", 422, { fields: { address: "Choose a delivery address." } })
  const { userId: _u, isDefault: _d, createdAt: _c, ...snapshot } = address
  return snapshot
}

function buyNowLine({ productId, color, size, quantity }) {
  const p = PRODUCTS.find((x) => x.id === productId)
  if (!p) throw fail("This product is no longer available.", 404)
  if (p.stock === 0) throw fail("This product is out of stock.", 409)
  if (p.sizes.length > 0 && !p.sizes.includes(size)) throw fail("Please select a size.")
  const max = Math.min(p.stock, MAX_QTY_PER_ITEM)
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    image: p.image,
    art: p.art,
    colors: p.colors,
    color: p.colors.find((c) => c.name === color) ?? p.colors[0] ?? null,
    size: size ?? null,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    quantity: Math.max(1, Math.min(Number(quantity) || 1, max)),
  }
}

/** Item snapshot stored on the order. */
const toOrderItem = (l) => ({
  productId: l.productId,
  slug: l.slug,
  name: l.name,
  brand: l.brand,
  image: l.image,
  art: l.art,
  colors: l.colors,
  color: l.color,
  size: l.size,
  price: l.price,
  compareAtPrice: l.compareAtPrice,
  quantity: l.quantity,
})

/**
 * input: { mode: "cart" | "buynow", item?, addressId, payment, email }
 * Cart mode empties the cart on success; buy-now never touches it.
 */
export function placeOrder(input) {
  const build = (lines) => {
    const userId = requireUserId()
    if (lines.length === 0) throw fail("Your cart is empty.", 409)
    const unavailable = lines.find((l) => l.inStock === false)
    if (unavailable) throw fail(`${unavailable.name} is out of stock. Remove it to continue.`, 409)

    const address = addressSnapshot(input.addressId, userId)
    const payment = paymentSummary(input.payment)
    const totals = quote(lines)
    const now = new Date()

    const order = {
      id: uuid(),
      number: `NW${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(100000 + Math.random() * 900000)}`,
      userId,
      createdAt: now.toISOString(),
      cancelledAt: null,
      email: input.email,
      items: lines.map(toOrderItem),
      address,
      shipping: { label: DELIVERY.label, fee: totals.shipping },
      estimatedDelivery: new Date(now.getTime() + DELIVERY.days * 24 * 60 * 60 * 1000).toISOString(),
      payment,
      totals,
      source: input.mode === "buynow" ? "buynow" : "cart",
    }
    writeAll([order, ...readAll()])
    return withStatus(order)
  }

  if (input.mode === "buynow") return request(() => build([buyNowLine(input.item ?? {})]))
  return withCart(({ cart, clear }) => {
    const order = build(cart.lines)
    clear()
    return order
  })
}

export function listOrders() {
  return request(() => {
    const userId = requireUserId()
    return readAll()
      .filter((o) => o.userId === userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map((o) => withStatus(o))
  })
}

export function getOrder(id) {
  return request(() => {
    const userId = requireUserId()
    const order = readAll().find((o) => o.id === id && o.userId === userId)
    if (!order) throw new ApiError("Order not found.", 404)
    return withStatus(order)
  })
}

/** Allowed until the order ships (confirmed or packed). */
export function cancelOrder(id) {
  return request(() => {
    const userId = requireUserId()
    const all = readAll()
    const order = all.find((o) => o.id === id && o.userId === userId)
    if (!order) throw new ApiError("Order not found.", 404)
    const current = withStatus(order)
    if (!current.cancellable) throw new ApiError(`This order is already ${current.status.replace(/_/g, " ")} and can't be cancelled.`, 409)
    const cancelled = { ...order, cancelledAt: new Date().toISOString() }
    writeAll(all.map((o) => (o.id === id ? cancelled : o)))
    return withStatus(cancelled)
  })
}
