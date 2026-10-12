/** Checkout field validators. Each returns an error message or null. */

const req = (v) => (typeof v === "string" ? v.trim() : v)

export const validators = {
  required: (label) => (v) => (req(v) ? null : `${label} is required.`),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req(v) ?? "") ? null : "Enter a valid email address."),
  // Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix
  phone: (v) => (/^(?:\+91[\s-]?|0)?[6-9]\d{9}$/.test((v ?? "").replace(/\s/g, "")) ? null : "Enter a valid 10-digit mobile number."),
  pincode: (v) => (/^[1-9]\d{5}$/.test(req(v) ?? "") ? null : "Enter a valid 6-digit PIN code."),
  upi: (v) => (/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(req(v) ?? "") ? null : "Enter a valid UPI ID, e.g. name@okbank."),
  cardNumber: (v) => {
    const digits = (v ?? "").replace(/\D/g, "")
    if (digits.length < 13 || digits.length > 19) return "Enter a valid card number."
    return luhn(digits) ? null : "This card number doesn't look right."
  },
  expiry: (v) => {
    const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v ?? "")
    if (!m || +m[1] < 1 || +m[1] > 12) return "Use MM/YY."
    const end = new Date(2000 + +m[2], +m[1], 1) // first day after the expiry month
    return end > new Date() ? null : "This card has expired."
  },
  cvc: (v) => (/^\d{3,4}$/.test(v ?? "") ? null : "Enter the 3 or 4 digit code."),
}

export function luhn(digits) {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let d = +digits[digits.length - 1 - i]
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

export function cardBrand(number) {
  const n = (number ?? "").replace(/\D/g, "")
  if (/^4/.test(n)) return "Visa"
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard"
  if (/^3[47]/.test(n)) return "Amex"
  if (/^(60|65|81|82|508)/.test(n)) return "RuPay"
  return "Card"
}

/** Groups card digits in fours while typing. */
export const formatCardNumber = (v) =>
  v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim()

/** Auto-inserts the slash in MM/YY while typing. */
export const formatExpiry = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

/** Runs a { field: validator } schema; returns { field: message } for failures. */
export function validate(values, schema) {
  const errors = {}
  for (const [field, check] of Object.entries(schema)) {
    const message = check(values[field])
    if (message) errors[field] = message
  }
  return errors
}

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
]
