/**
 * Single source of truth for order maths, shared by the cart, the checkout summary
 * and the mock order API. Money is in paise; prices are GST-inclusive.
 */
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "./constants"

export const GST_RATE = 0.18

/** One delivery option for now: free from ₹999, otherwise a flat fee. */
export const DELIVERY = {
  label: "Standard delivery",
  description: "3–5 business days",
  days: 5,
  fee: (subtotal) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE),
}

/** Totals for lines shaped { price, compareAtPrice, quantity }. */
export function quote(lines) {
  const count = lines.reduce((n, l) => n + l.quantity, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const mrp = lines.reduce((sum, l) => sum + (l.compareAtPrice ?? l.price) * l.quantity, 0)
  const shipping = count === 0 ? 0 : DELIVERY.fee(subtotal)
  const total = subtotal + shipping
  return {
    count,
    subtotal,
    mrp,
    savings: mrp - subtotal,
    shipping,
    total,
    // the GST portion already inside a tax-inclusive total
    gstIncluded: Math.round(total - total / (1 + GST_RATE)),
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  }
}
