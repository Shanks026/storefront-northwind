/**
 * Customer-submitted product questions (`sf_questions`). This store only records them; answers come
 * from the vendor portal (a separate app), which would read the pending rows and fill in `answer`.
 *
 * Row shape (what the vendor portal would consume):
 * { id, productId, productSlug, productName, vendor, userId, userName, question,
 *   status: "pending" | "answered", answer: null | string, askedAt, answeredAt: null | ISO }
 */
import { STORAGE_KEYS } from "@/lib/constants"
import { requireUserId } from "./auth"
import { ApiError, request, storage, uuid } from "./client"
import { PRODUCTS } from "./seed"

const readAll = () => storage.get(STORAGE_KEYS.questions, [])
const writeAll = (rows) => storage.set(STORAGE_KEYS.questions, rows)

const newestFirst = (a, b) => Date.parse(b.askedAt) - Date.parse(a.askedAt)

/** The signed-in user's questions for one product, newest first. */
export function listMyQuestions(slug) {
  return request(() => {
    const userId = requireUserId()
    return readAll()
      .filter((q) => q.userId === userId && q.productSlug === slug)
      .sort(newestFirst)
  })
}

export function askQuestion({ slug, question }) {
  return request(() => {
    const userId = requireUserId()
    const product = PRODUCTS.find((p) => p.slug === slug)
    if (!product) throw new ApiError("Product not found", 404)
    const text = question.trim()
    if (!text) throw new ApiError("Please type your question.")

    const user = storage.get(STORAGE_KEYS.users, []).find((u) => u.id === userId)
    const row = {
      id: uuid(),
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      vendor: product.brand,
      userId,
      userName: user?.name ?? "Customer",
      question: text,
      status: "pending",
      answer: null,
      askedAt: new Date().toISOString(),
      answeredAt: null,
    }
    writeAll([...readAll(), row])
    return row
  })
}
