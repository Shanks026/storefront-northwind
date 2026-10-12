/**
 * Mock wishlist (`sf_wishlist`), scoped to the signed-in user.
 * Stored rows are { userId, productId, addedAt }; product details are joined from the catalog on read.
 */
import { STORAGE_KEYS } from "@/lib/constants"
import { requireUserId } from "./auth"
import { ApiError, request, storage } from "./client"
import { PRODUCTS } from "./seed"

const readAll = () => storage.get(STORAGE_KEYS.wishlist, [])
const writeAll = (rows) => storage.set(STORAGE_KEYS.wishlist, rows)

/** Newest first: [{ product, addedAt }] */
function mine(userId) {
  return readAll()
    .filter((r) => r.userId === userId)
    .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt))
    .map((r) => {
      const product = PRODUCTS.find((p) => p.id === r.productId)
      if (!product) return null
      const { description, specs, highlights, ...summary } = product
      return { product: summary, addedAt: r.addedAt }
    })
    .filter(Boolean)
}

export function listWishlist() {
  return request(() => mine(requireUserId()))
}

export function addToWishlist(productId) {
  return request(() => {
    const userId = requireUserId()
    if (!PRODUCTS.some((p) => p.id === productId)) throw new ApiError("This product is no longer available.", 404)
    const rows = readAll()
    if (!rows.some((r) => r.userId === userId && r.productId === productId)) {
      writeAll([...rows, { userId, productId, addedAt: new Date().toISOString() }])
    }
    return mine(userId)
  })
}

export function removeFromWishlist(productId) {
  return request(() => {
    const userId = requireUserId()
    writeAll(readAll().filter((r) => !(r.userId === userId && r.productId === productId)))
    return mine(userId)
  })
}
