const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })

/** Prices are stored in paise (integer INR × 100) to avoid floating point drift. */
export function formatPrice(paise) {
  return currency.format((paise ?? 0) / 100)
}

export function formatDate(value, opts = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-IN", opts).format(new Date(value))
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")
}

/** Estimated delivery date label, e.g. "Tue, 13 Oct". Placeholder: today + `days`. */
export function deliveryDate(days = 3) {
  return formatDate(Date.now() + days * 24 * 60 * 60 * 1000, { weekday: "short", day: "numeric", month: "short" })
}
