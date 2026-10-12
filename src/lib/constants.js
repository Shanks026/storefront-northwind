export const STORE_NAME = "Northwind"

export const STORAGE_KEYS = {
  users: "sf_users",
  session: "sf_session",
  cart: "sf_cart",
  orders: "sf_orders",
  addresses: "sf_addresses",
  wishlist: "sf_wishlist",
  questions: "sf_questions",
  theme: "sf_theme",
}

// Money values are in paise (INR × 100)
export const FREE_SHIPPING_THRESHOLD = 99900 // free standard delivery from ₹999
export const STANDARD_SHIPPING_FEE = 4900 // ₹49 below the threshold
export const MAX_QTY_PER_ITEM = 10
