/**
 * Mock address book (`sf_addresses`), scoped to the signed-in user.
 * Address: { id, userId, label, fullName, phone, line1, line2, landmark, city, state, pincode, isDefault, createdAt }
 * Invariant: a user with addresses always has exactly one default.
 */
import { STORAGE_KEYS } from "@/lib/constants"
import { INDIAN_STATES, validate, validators } from "@/lib/validation"
import { requireUserId } from "./auth"
import { ApiError, request, storage, uuid } from "./client"

export const ADDRESS_LABELS = ["Home", "Work", "Other"]

export const ADDRESS_SCHEMA = {
  fullName: validators.required("Full name"),
  phone: validators.phone,
  line1: validators.required("Address line 1"),
  city: validators.required("City"),
  state: (v) => (INDIAN_STATES.includes(v) ? null : "Choose a state."),
  pincode: validators.pincode,
}

const readAll = () => storage.get(STORAGE_KEYS.addresses, [])
const writeAll = (all) => storage.set(STORAGE_KEYS.addresses, all)

const FIELDS = ["label", "fullName", "phone", "line1", "line2", "landmark", "city", "state", "pincode"]
const clean = (input) =>
  Object.fromEntries(FIELDS.map((f) => [f, typeof input[f] === "string" ? input[f].trim() : (input[f] ?? "")]))

function assertValid(input) {
  const fields = validate(input, ADDRESS_SCHEMA)
  if (Object.keys(fields).length) throw Object.assign(new ApiError("Please fix the highlighted fields.", 422), { fields })
}

// default first, then newest
const sortForUser = (list) =>
  [...list].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || Date.parse(b.createdAt) - Date.parse(a.createdAt))

function mine(all, userId) {
  return sortForUser(all.filter((a) => a.userId === userId))
}

export function listAddresses() {
  return request(() => mine(readAll(), requireUserId()))
}

export function createAddress(input) {
  return request(() => {
    const userId = requireUserId()
    const data = clean(input)
    assertValid(data)
    let all = readAll()
    const first = !all.some((a) => a.userId === userId)
    const makeDefault = first || Boolean(input.isDefault)
    if (makeDefault) all = all.map((a) => (a.userId === userId ? { ...a, isDefault: false } : a))
    const address = {
      id: uuid(),
      userId,
      ...data,
      label: ADDRESS_LABELS.includes(data.label) ? data.label : "Home",
      isDefault: makeDefault,
      createdAt: new Date().toISOString(),
    }
    writeAll([...all, address])
    return address
  })
}

export function updateAddress(id, input) {
  return request(() => {
    const userId = requireUserId()
    const all = readAll()
    const existing = all.find((a) => a.id === id && a.userId === userId)
    if (!existing) throw new ApiError("Address not found.", 404)
    const data = clean({ ...existing, ...input })
    assertValid(data)
    const makeDefault = Boolean(input.isDefault) || existing.isDefault
    const next = all.map((a) => {
      if (a.id === id) return { ...a, ...data, label: ADDRESS_LABELS.includes(data.label) ? data.label : a.label, isDefault: makeDefault }
      return a.userId === userId && makeDefault ? { ...a, isDefault: false } : a
    })
    writeAll(next)
    return next.find((a) => a.id === id)
  })
}

export function setDefaultAddress(id) {
  return updateAddress(id, { isDefault: true })
}

/** Deleting the default promotes the newest remaining address. */
export function deleteAddress(id) {
  return request(() => {
    const userId = requireUserId()
    const all = readAll()
    const target = all.find((a) => a.id === id && a.userId === userId)
    if (!target) throw new ApiError("Address not found.", 404)
    let rest = all.filter((a) => a.id !== id)
    if (target.isDefault) {
      const [promote] = mine(rest, userId)
      if (promote) rest = rest.map((a) => (a.id === promote.id ? { ...a, isDefault: true } : a))
    }
    writeAll(rest)
    return { id }
  })
}

/** One-line summary for cards and order records. */
export function formatAddress(a) {
  return [a.line1, a.line2, a.landmark && `Near ${a.landmark}`, a.city, `${a.state} ${a.pincode}`].filter(Boolean).join(", ")
}
