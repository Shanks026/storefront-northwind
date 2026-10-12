import { GuestOnly, RequireAuth } from "@/components/auth/route-guards"
import { AppRoot } from "@/components/layout/app-root"
import { RootLayout } from "@/components/layout/root-layout"
import { AddressesPage } from "@/pages/addresses-page"
import { CartPage } from "@/pages/cart-page"
import { CheckoutPage } from "@/pages/checkout-page"
import { HomePage } from "@/pages/home-page"
import { LoginPage } from "@/pages/login-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { OrderPage } from "@/pages/order-page"
import { OrdersPage } from "@/pages/orders-page"
import { ProductPage } from "@/pages/product-page"
import { ProductsPage } from "@/pages/products-page"
import { RegisterPage } from "@/pages/register-page"
import { WishlistPage } from "@/pages/wishlist-page"

/** Route objects shared by the browser router. */
export const routes = [
  {
    element: <AppRoot />,
    children: [
      // store pages: header + footer
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "products", element: <ProductsPage /> },
          { path: "products/:slug", element: <ProductPage /> },
          { path: "cart", element: <CartPage /> },
          {
            element: <RequireAuth />,
            children: [
              { path: "checkout", element: <CheckoutPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "orders/:id", element: <OrderPage /> },
              { path: "account/addresses", element: <AddressesPage /> },
              { path: "wishlist", element: <WishlistPage /> },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      // full-page auth screens: no store chrome
      {
        element: <GuestOnly />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },
]
