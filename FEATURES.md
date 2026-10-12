# Storefront UI — Feature & Implementation Plan

A modern marketplace-style reference storefront (Shopify / marketplace patterns with Attio-like SaaS polish): product listing, product details, add to cart, buy now, checkout and orders. There is no backend or database — all data is dummy placeholder data served through a mock API layer, so the UI can later be wired to a real API without rewriting pages.

## Tech stack

| Concern | Choice |
| --- | --- |
| Build / dev server | Vite |
| UI library | React (JSX) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Components | shadcn/ui (latest CLI, JS mode, `src/components/ui`) |
| Server state | TanStack Query (React Query) + devtools |
| Routing | React Router |
| Theme | small in-house `ThemeProvider` (class strategy, stored in `sf_theme`) |
| Font | Inter from Google Fonts (400–700), applied globally via `--font-sans` |
| Icons | lucide-react |
| Toasts | sonner |
| Package manager | pnpm |

## Architecture

```
src/
  api/            mock "backend": async functions with simulated latency
    client.js       request(), delay(), storage helpers, ApiError, uuid()
    seed.js         products, categories (placeholder data)
    products.js     listProducts({ q, category, sort }), getProduct(slug)
    auth.js         signIn, signUp, signOut, getSession
    cart.js         getCart, addItem, updateItem, removeItem, clearCart
    orders.js       placeOrder, listOrders, getOrder
  hooks/          React Query hooks — the only thing pages talk to
  providers/      QueryClient, theme, tooltip, toaster
  components/
    ui/             shadcn primitives (generated)
    layout/         header, footer, page container, cart sheet, user menu
    product/        product card, gallery, product art
    checkout/       form sections, order summary
  pages/          route components
  lib/            cn(), formatters, constants, query client
  routes.jsx      route table
```

**Rule:** pages and components never touch `localStorage` or seed data directly. They call hooks (`useProducts`, `useCart`, `usePlaceOrder`…), hooks call `src/api/*`. Swapping to a real backend = replace the bodies of `src/api/*` with `fetch` calls.

### Query keys

| Key | Data |
| --- | --- |
| `['products', filters]` | product list |
| `['product', slug]` | single product |
| `['session']` | current auth session |
| `['cart']` | cart lines + totals |
| `['orders']` / `['order', id]` | order history / detail |

Mutations (`addToCart`, `placeOrder`, `signIn`…) invalidate the relevant keys and use optimistic updates where it improves feel (cart quantity).

## Data model (placeholder)

- **Product** — `id, slug, name, tagline, description, price, compareAtPrice, category, badges[], rating, reviewCount, stock, variants: { colors[], sizes[] }, art: { from, to, icon }`
- **CartLine** — `id, productId, slug, name, price, color, size, quantity, art`
- **Address** — `id, userId, label (Home/Work/Other), fullName, phone, line1, line2, landmark, city, state, pincode, isDefault, createdAt` (`sf_addresses`)
- **Order** — `id (uuid), number (NWyymm-######), userId, createdAt, status, email, items[] (snapshots), address (snapshot), shipping{label, fee}, estimatedDelivery, payment{method, label, brand?, last4?}, totals{count, subtotal, mrp, savings, shipping, total, gstIncluded}, source (cart | buynow)` (`sf_orders`)
- **User** — `id (uuid), name, email, createdAt`
- **Session** — `token (uuid), userId, createdAt`

Prices are in Indian rupees (INR), stored as integer paise and formatted with `en-IN` (e.g. ₹15,699). Product images are local Unsplash photos in `public/images/products` (credits in `CREDITS.md`); generated gradient "art" tiles are the fallback.

## Auth (localStorage + random UUID)

- Sign up: creates `{ id: crypto.randomUUID(), name, email, passwordHash, createdAt }` in `sf_users` (email stored lower-cased, must be unique) and starts a session.
- Sign in: finds the user by email and compares a SHA-256 hash of the password (**demo only — unsalted, client-side, not real security**), then writes `{ token: crypto.randomUUID(), userId, createdAt }` to `sf_session`.
- Sign out: removes `sf_session`.
- `useSession()` exposes `{ user, isAuthenticated, isLoading }` (the password hash is never returned to the UI); `<RequireAuth>` redirects to `/login?redirect=<path>`; `<GuestOnly>` sends signed-in users away from /login and /register. Redirect targets must be same-site paths.
- Other open tabs pick up sign-in / sign-out through the `storage` event.
- Guests can browse and use the cart; **checkout and orders require sign-in**.

## Routes

| Path | Page | Auth |
| --- | --- | --- |
| `/` | Home: banners, product rails (bestsellers, deals, new), shop by category | — |
| `/products` | Search / browse results with filter sidebar (all filters in URL params) | — |
| `/products/:slug` | Product detail | — |
| `/cart` | Cart page | — |
| `/checkout` | Checkout (cart mode) | required |
| `/checkout?mode=buynow&…` | Checkout with a single item (cart untouched) | required |
| `/orders` | Order history | required |
| `/orders/:id` | Order detail (`?placed=1` shows confirmation) | required |
| `/account/addresses` | Saved addresses (add / edit / delete / set default) | required |
| `/wishlist` | Saved products (move to cart / remove) | required |
| `/login`, `/register` | Auth | guests |
| `*` | Not found | — |

## Features

- **Listing:** responsive grid, category pills, search, sort (featured, price ↑/↓, rating), loading skeletons, empty state.
- **Product detail:** gallery, price with compare-at, rating, color & size selectors, quantity stepper, stock indicator, Add to cart, Buy now, details accordion, related products.
- **Cart:** slide-over sheet from header + full page; change quantity, remove, subtotal, free-shipping progress.
- **Buy now:** skips the cart and goes straight to checkout with one line item.
- **Checkout:** contact, shipping address, shipping method (radio cards), dummy payment form (no charge), order summary, validation, place order.
- **Orders:** confirmation, history list with status badges, detail with status timeline and totals.
- **Wishlist, ratings & Q&A:** per-user wishlist with header count and `/wishlist` page; static customer ratings (distribution + reviews) and Q&A on product pages.
- **Shell:** search-first header, category bar, mobile menu, user menu, cart badge count, rich footer, light/dark theme, toasts, 404.

## Testing approach

Testing is **manual only** — no automated test suites or scripts. Each phase lists manual test steps to run in the browser (`pnpm dev`, http://localhost:5173). A phase's `Testing` box is ticked once every step passes.

Handy while testing:
- DevTools → Application → Local Storage shows `sf_users`, `sf_session`, `sf_cart`, `sf_orders`, `sf_theme`; clearing them resets the demo.
- React Query devtools (flower icon, bottom-left) shows each query's cache and status.
- `setApiLatency(ms)` in `src/api/client.js` slows the fake network to inspect loading states.

## Phase 1: Foundation

**Scope**
- Vite + React + Tailwind v4 + shadcn (JS) setup, `@` path alias, Inter font, light/dark.
- Elevation: Tailwind's shadow scale is overridden in `src/index.css` with very subtle values (applies to shadcn components, cards, dialogs, menus, toasts).
- Visual direction: an e-commerce marketplace (Shopify storefronts, Etsy/Amazon-style category navigation) with SaaS polish borrowed from Attio (hairline borders, calm neutrals, tight type). **Orange brand colour** for primary actions, red for deals, amber for ratings, warm neutrals.
- Category taxonomy (`src/lib/categories.js`): 12 categories, each with 4 subcategories, icon and tile tone.
- Marketplace shell:
  - Main header: logo, search bar with category scope selector, and simple icon + label actions (Account, Orders, Cart) — the cart icon carries a floating item-count badge.
  - Second header (category bar): "All categories" mega menu (every category + subcategories), scrollable quick links to each category, highlighted "Today's deals" link.
  - Mobile menu (sheet) with search, deals/orders/account links and categories as an accordion with subcategories.
  - Footer: newsletter band, link columns, payment-method badges, copyright.
- Home page: sliding hero banner carousel (4 campaign banners, autoplay, pause on hover, arrows, dot navigation, loop) + two stacked secondary photo banners (Deal of the day → bags deals, Members save 10% → register), trust strip (free shipping, returns, secure checkout, support), "Shop by category" tiles.
- 404 page, page container.
- React Query provider + devtools, sonner toaster, tooltip provider, theme provider.
- Mock API client (`request`, `delay`, storage helpers, `uuid`), formatters, navigation category config.

**Manual test steps**
1. `pnpm dev` starts without errors; `pnpm build` completes.
2. `/` shows the main header (logo, search, Account / Orders / Cart with a count badge on the cart), category bar, banner carousel with side promos, trust strip, category tiles and footer.
3. Banners slide automatically every ~5s, loop back to the first, pause while hovered; arrows and dots switch slides; each banner button navigates.
4. Header and category bar stay pinned to the top while scrolling.
5. "All categories" opens a mega menu of all 12 categories with subcategories; clicking one navigates to `/products?category=<slug>` (and `&sub=<slug>` for subcategories) and highlights it in the category bar.
6. Header search: pick a category scope, type a term, press Enter → `/products?q=<term>&category=<slug>`; the box keeps the term after navigation.
7. "Today's deals" navigates to `/products?deals=true`; the newsletter form shows a success toast.
8. An unknown URL (e.g. `/abc`) shows the 404 page; "Back to shop" returns to `/`.
9. Switch the OS to dark mode and reload — the app renders with the dark palette.
10. Resize to ~375px — no horizontal scroll; action labels collapse to icons (cart badge stays); search sits under the logo row; the menu button opens a sheet with search, links and a category accordion; the category bar scrolls sideways.
11. React Query devtools button appears bottom-left; browser console has no errors.

- [x] Code implementation
- [x] Testing
- [x] Green signal

## Phase 2: Product catalog

**Scope**
- Seed data: 36 products (3 per category; six have long marketplace-style titles to exercise the 2-line clamp) using the Phase 1 category/subcategory slugs; prices in INR (paise), colours, sizes, stock, badges, highlights, specs. One product is out of stock, two are low stock.
- Mock API (`src/api/products.js`): `listProducts(filters)` with text search, category/subcategory, deals, price ranges, minimum rating, in-stock, 7 sort orders, category counts and an optional `limit`; `getProduct(slug)` (404 when missing); `getRelatedProducts(slug)`.
- Hooks: `useProducts` (keeps previous results while new filters load), `useProduct`, `useRelatedProducts`, `useCatalogFilters` (filters live in the URL).
- Home `/`: banners + trust strip, then three product rails of 5 cards each — "Bestsellers this week", "Deals of the day", "Just landed" — each with an "Explore all" button into `/products` with the matching sort/filter; "Shop by category" tiles, then the service promises strip (shipping, returns, secure checkout, support) just above the footer.
- Results page `/products` (search, category, deals and "Explore all" all land here): breadcrumb + title ("Recommended for you" when unfiltered).
  - Desktop filter sidebar: categories with counts and nested subcategories, price ranges (₹), customer rating, in stock, on sale.
  - Mobile: "Filters" button opens the same panel in a sheet.
  - Toolbar: result count, sort select, removable filter chips, "Clear all".
  - Skeletons while loading, empty state with reset, error state with retry.
- Product card: borderless, rounded image tile with hover zoom, Bestseller/New ribbon, save-for-later heart (visual only), hover quick action ("Add to cart", or "Choose options" when the product has sizes); brand, name, name clamped to 2 lines (2 lines always reserved so rating/price align across a row; full name in a tooltip), Flipkart-style rating badge ("4.6 ★ | 4,120", secondary style) directly above the price, price with MRP strike-through and green "% off", delivery line with date ("Free delivery by Tue, 13 Oct", or "Delivery by …" under ₹999) or red "Only N left". No colour swatches on cards. Card uses a stretched-link so buttons inside it stay valid and keyboard-accessible.
- Product detail `/products/:slug`: breadcrumb, 4-view gallery (thumbnails), brand store link, rating + bought count, price with savings and "Inclusive of all taxes", colour swatches (recolour the gallery), size picker with validation, quantity stepper (1 to min(stock, 10)), stock status, Add to cart / Buy now buttons (placeholder toasts until Phases 4–5), delivery/returns/seller info, accordion (description, highlights, specifications, shipping & returns), "You may also like".

**Manual test steps**
1. `/` shows three rails of 5 cards (skeletons first) in order Bestsellers this week → Deals of the day → Just landed, then "Shop by category", then the service promises strip last.
2. Each "Explore all" opens `/products` with the matching title (Bestsellers this week / Deals of the day / Just landed), sort and filter.
3. A category in the category bar opens `/products?category=…` with breadcrumb Home › All products › Category, sidebar highlights it and lists its subcategories; reload keeps the filter.
4. Header search "bottle" + Enter → "Results for “bottle”"; a nonsense query shows the empty state and "Reset filters" returns to all 36 products and clears the search box.
5. Each sort option reorders the grid correctly (check price low→high and high→low).
6. Sidebar price range, 4.5★ & up, In stock only and On sale each narrow the grid, add a chip and update the URL; removing a chip or "Clear all" undoes it.
7. At ~375px the sidebar is replaced by a "Filters" button opening a sheet with the same controls; no horizontal scroll.
8. Product card: hover zooms the image and slides up "Add to cart"/"Choose options"; the heart toggles; long names wrap to 2 lines and are cut off with "…" (hover shows the full name); the rating badge "4.6 ★ | 4,120" sits directly above the price; ratings and prices line up across a row; no colour dots; low-stock items show red "Only N left".
9. Click a product → detail page with gallery, price in ₹, rating, colours, sizes, quantity; thumbnails switch the main image; changing colour recolours the images.
10. Quantity can't go below 1 or above min(stock, 10); for a product with sizes, Add to cart without a size shows "Please select a size."
11. Carry-On Spinner 38L shows "Currently out of stock" with disabled buttons; Keystone 75 shows "only 4 left".
12. "You may also like" links to other products; `/products/does-not-exist` shows "Product not found".
13. Browser console has no errors; `pnpm build` completes.

- [x] Code implementation
- [x] Testing
- [x] Green signal

## Phase 3: Auth (localStorage + UUID)

**Scope**
- Mock API `src/api/auth.js`: `signUp`, `signIn`, `signOut`, `getSession`, shared `validateCredentials` (field errors), uuid user ids and session tokens, SHA-256 password hash.
- Hooks `src/hooks/use-auth.js`: `useSession`, `useSignIn`, `useSignUp`, `useSignOut` (update the session cache and refetch user-scoped queries), `useSessionSync` (cross-tab).
- `/login` and `/register`: full-page screens without the store header/footer — full-height neutral membership panel on the left (desktop: subtle grey background, logo, perks with small primary-coloured icons), logo + "Back to store" bar and the form on the right, inline field errors, show/hide password, loading buttons, welcome toast, links between the two pages keep `?redirect`.
- Guards: `<RequireAuth>` (protects `/orders`; placeholder orders page until Phase 6) and `<GuestOnly>` (login/register) with open-redirect protection.
- Header: "Sign in" when signed out; avatar with initials + "Hi, <first name>" menu (name, email, Your orders, Sign out) when signed in. Mobile menu shows Sign out with the email. Signing out returns to `/` with a toast.

**Manual test steps**
1. Register with name, email, password → toast "Welcome, <name>!", lands on `/` signed in; in DevTools `sf_users` has a uuid `id` and a `passwordHash` (no plain password), `sf_session` has a uuid `token`.
2. Header shows the avatar + "Hi, <first name>"; its menu shows name, email, Your orders and Sign out.
3. Sign out → back on `/`, toast shown, `sf_session` removed, header shows "Sign in".
4. Sign in with the same email/password works; unknown email, wrong password, invalid email and short password each show the right inline error; registering the same email again shows "already registered".
5. Signed out, visit `/orders` → redirected to `/login?redirect=%2Forders`; after signing in you land on `/orders`. The "Create an account" link keeps the redirect.
6. Signed in, visiting `/login` or `/register` sends you to `/`. `/login?redirect=//example.com` never leaves the site.
7. Session survives a reload; signing out in one tab updates the header in another open tab.
8. Login/register fill the whole screen (no store header/footer) and "Back to store" returns to `/`; at ~375px the form is single-column and usable; the mobile menu shows Sign out with your email when signed in. Console has no errors; `pnpm build` completes.

- [x] Code implementation
- [x] Testing
- [x] Green signal

## Phase 4: Cart

**Scope**
- Mock API `src/api/cart.js` (`sf_cart`): one device cart shared by guests and signed-in users. Stores minimal lines `{ id, productId, color, size, quantity }` and joins live product data, price and stock on every read. `addItem` merges the same product + colour + size into one line and caps quantity at min(stock, 10); `updateItem`, `removeItem`, `clearCart`. Writes are processed in call order so rapid edits can't land out of order.
- Totals (`summarize`): item count, price at MRP, discount, delivery (free from ₹999, otherwise ₹49), total, amount left for free delivery.
- Hooks `src/hooks/use-cart.js`: `useCart`, `useAddToCart` (toast with "View cart" action that opens the sheet), `useUpdateCartItem` / `useRemoveCartItem` with optimistic updates and rollback on error. Other tabs refresh the cart through the `storage` event.
- Header cart button with live count badge opens a slide-over cart: free-delivery progress, line items (image, brand, name, colour · size, line price with MRP, quantity stepper, remove), subtotal + savings, "View cart" and "Checkout" (placeholder until Phase 5).
- `/cart` page: free-delivery progress, line items, sticky "Price details" card (price, discount, delivery, total, savings note), checkout button, empty state.
- Add to cart wired on the product detail page (with selected colour/size/quantity) and the product card quick-add (single-size products, default colour).
- Seed: five products now cost under ₹999 (mug, socks, rope toy, desk bundle, ₹500 gift card) so paid delivery and the progress bar can be seen.

**Manual test steps**
1. On a product page pick colour/size/qty and Add to cart → button shows a spinner, toast "Added to cart" with "View cart", header badge increases by the quantity.
2. "View cart" in the toast (or the header cart button) opens the cart sheet showing the line with colour · size.
3. Adding the same product + colour + size again merges into one line; a different colour or size makes a new line.
4. Quick-add from a product card hover (e.g. Speckled Stoneware Mug) adds 1 with its default colour.
5. Quantity +/− in the sheet and on `/cart` update line totals, subtotal and badge instantly; rapid clicks settle on the right number; + stops at min(stock, 10) ("Max" hint), − stops at 1.
6. Adding beyond the limit shows "that's the maximum" (partial add) or an error toast (already at max).
7. Remove deletes the line; removing the last line shows "Your cart is empty".
8. With only the mug (₹499): delivery ₹49 and "Add ₹500 more for free delivery"; adding more to reach ₹999 shows "You've unlocked free delivery" and Delivery "Free".
9. Discounted items show the MRP strike-through, "Discount" line and "You're saving ₹…" note.
10. Cart persists across reload, works signed out and signed in, and a second tab's badge updates after a change.
11. `/cart` is usable at ~375px (summary stacks below items); console has no errors; `pnpm build` completes.

- [x] Code implementation
- [x] Testing
- [x] Green signal

## Phase 4.1: Product & banner photos

**Scope**
- 40 Unsplash photos (free Unsplash License, no Unsplash+), picked by eye: no recognisable brand logos, no AI-generated images. Downloaded once into the project: `public/images/products/<slug>.webp` (800×800) and `public/images/banners/{sale,audio,workspace,gifts}.webp` (1600×700), 3.2 MB total.
- `CREDITS.md` lists photographer and source page for every file.
- Seed: every product's `image` defaults to `/images/products/<slug>.webp`; `art` stays as the drawn fallback.
- `<ProductImage>` renders the photo (lazy, async decode, muted placeholder) and falls back to the drawn art if the file fails to load. One photo per product, so changing colour on the detail page no longer changes the image; the detail gallery shows the single photo without the thumbnail strip.
- Product-card badges on photos: neutral frosted-glass chip (dark translucent, backdrop blur, white text) with filled icons — crown for Bestseller, lightning for New. Cart thumbnails are fixed squares.
- Secondary banners beside the hero reuse the backpack and gift-box photos with a bottom-up dark fade, white copy and a CTA; they match the hero height on desktop, sit side by side on tablet and stack on mobile.
- Hero banners use the photos with a left-to-right dark overlay for legible text and an orange CTA; the old gradient remains as the loading/failed background.

**Manual test steps**
1. Home rails, `/products`, product pages, cart sheet and `/cart` show real photos (no drawn icons) for all 36 products.
2. Each of the 4 sliding banners shows its photo; headline and button stay readable.
3. Product page shows one large photo and no thumbnail strip; colour/size pickers still work.
4. Temporarily rename one image file → that product falls back to the drawn image, no broken-image icon; rename back.
5. Network tab: images load from `/images/...` on localhost (no requests to unsplash.com); console has no errors; `pnpm build` completes.
6. `CREDITS.md` has 40 rows matching the files in `public/images`.

- [x] Code implementation
- [x] Testing
- [x] Green signal

## Phase 5: Checkout, Buy now & addresses

**Scope**
- Shared pricing (`src/lib/pricing.js`): `quote(lines)` used by cart, checkout summary and order API. One delivery option: standard, free from ₹999 else ₹49 (3–5 days) — no delivery-method step. Prices are GST-inclusive; summaries show "Includes ₹X GST".
- **Address book** (`src/api/addresses.js`, `sf_addresses`, per user): list / create / update / delete / set default; first address becomes default; deleting the default promotes the next. Validation: name, Indian mobile, line 1, city, state (all states/UTs), 6-digit PIN. UI: add/edit dialog (Home/Work/Other chips, state select, "make default"), address cards with Edit / Set as default / Delete (confirm dialog). `/account/addresses` page, linked from the account menu and mobile menu.
- **Checkout** `/checkout` (sign-in required):
  1. Delivery address — saved addresses as selectable cards (default pre-selected), edit/delete inline, "Add new" dialog (new address auto-selected); empty state prompts to add one.
  2. Payment — UPI (UPI ID), Card (number with live brand + grouping, name, MM/YY, CVV; Luhn + expiry checks), Cash on delivery.
  - Sticky summary: items with qty badges, MRP, discount, delivery (with "arrives by" date), total, GST included, "Pay ₹X" / "Place order" with loading state. Field errors inline; scrolls to the first error.
- **Buy now** on the product page → `/checkout?mode=buynow&product=<slug>&color=&size=&qty=` with only that item ("Your cart stays as it is"); signed-out users go through login and come back to the same URL.
- **Order API** (`src/api/orders.js`, `sf_orders`): `placeOrder` (cart mode runs in the cart's write queue and empties the cart; buy-now never touches it), `getOrder`, `listOrders`, all user-scoped. Orders store snapshots of items and address; card numbers / CVV are validated and discarded — only brand + last 4 kept.
- **Confirmation**: `/orders/:id?placed=1` — success header with order number and email, estimated delivery, delivery address, items, payment summary and method. (Full order history + status timeline in Phase 6.)

**Manual test steps**
1. Signed out, "Checkout" from the cart → login → back on `/checkout`.
2. With no saved addresses, step 1 prompts to add one; the dialog validates (empty fields, bad phone, 5-digit PIN, no state) and the saved address is auto-selected.
3. Add a second address, mark it default; edit it; delete one (confirm dialog) — the remaining one stays selected/default. `/account/addresses` shows the same list and supports the same actions.
4. The summary shows delivery Free (₹999+) or ₹49 below that, with an "arrives by" date; there is no delivery-method step.
5. Payment validation: invalid UPI ID; card with bad Luhn number, past expiry, short CVV each show inline errors; 4242 4242 4242 4242 shows "Visa".
6. Place order (card) → button shows "Placing your order…", then the confirmation page with order number, address, items and "Visa •••• 4242"; cart badge is 0.
7. "Buy now" on a product (with size) → checkout shows only that item and the note; after ordering, the existing cart is unchanged.
8. `/checkout` with an empty cart shows "Your cart is empty"; `/orders/<random-id>` shows "Order not found".
9. Cash on delivery: button reads "Place order", confirmation shows "Amount to pay".
10. ~375px: checkout sections and summary stack; dialogs fit the screen. Console clean; `pnpm build` completes.

- [x] Code implementation
- [x] Testing
- [x] Green signal

## Phase 6: Orders

**Scope**
- Simulated fulfilment (`src/api/orders.js`): status is derived from minutes since placing — confirmed (0) → packed (2 min) → shipped (5) → out for delivery (10) → delivered (15). Every endpoint returns computed `status`, `timeline` (with timestamps), `cancellable`, `deliveredAt`. Order queries refetch every 30 s while open, so status moves on screen.
- `cancelOrder(id)`: allowed while confirmed or packed (before shipping); stores `cancelledAt`; the timeline stops and ends with "Cancelled".
- Order history `/orders`: tabs All / In progress / Delivered / Cancelled with counts. Order card hierarchy: status badge (shadcn Badge, Tailwind 100 bg / 700 text: amber confirmed, violet packed, sky shipped, indigo out for delivery, emerald delivered, rose cancelled) + bold "Arriving by / Delivered on / Cancelled on" headline + muted "Order # · Placed date"; prominent total + item count on the right; first item name + "N more items" with a row of up to 4 thumbnails (+N, ×qty); footer with muted ship-to and actions ("Track order" primary while in progress, otherwise outline "View details"; ghost "Cancel order" when allowed); empty state.
- Order detail `/orders/:id`: slim green confirmation strip after checkout (`?placed=1`) with View all orders / Continue shopping; header with back link, Order # + status badge, "Placed · N items · total" and Cancel order (confirm dialog with refund note); full-width tracking card with a bold delivery headline and a horizontal step tracker (vertical on mobile; done steps green, current ringed, cancelled step rose) plus the cancellation note; items list (thumbnail, brand, name, variant · qty, line total and per-unit price); one sticky summary card with Delivery address, Payment method and Price details sections.
- Status badges: confirmed/packed neutral, shipped/out for delivery blue, delivered green, cancelled grey.

**Manual test steps**
1. `/orders` lists orders newest first with status badges, dates, totals and thumbnails; tab counts add up.
2. Order detail shows the tracking timeline, items, delivery address, payment (brand + last 4) and totals.
3. An order placed > 15 min ago shows Delivered with all steps done; a new order starts at Confirmed and advances (Packed after ~2 min) without a reload.
4. Cancelling a new order (confirm dialog) → status Cancelled, toast, timeline ends with Cancelled, it moves to the Cancelled tab; shipped/delivered orders have no Cancel button.
5. Sign in as a different user — their `/orders` does not show the first user's orders.

- [x] Code implementation
- [x] Testing
- [x] Green signal

## Phase 7: Wishlist, ratings & Q&A

**Scope**
- **Wishlist** (per signed-in user, `sf_wishlist`): mock API `listWishlist` / `addToWishlist` / `removeFromWishlist`; hooks with optimistic toggle.
  - Heart on product cards and the product page fills when saved; guests tapping it are sent to sign in and come back.
  - Header "Wishlist" action with a count badge (and in the mobile menu / account menu).
  - `/wishlist` page: product grid of saved items with "Move to cart" and "Remove"; out-of-stock items flagged; empty state.
- **Customer ratings** on the product page (static placeholder data per product, display only — no review writing):
  - Summary: average rating, total ratings/reviews, 5★→1★ distribution bars consistent with the product's rating.
  - 3–5 review cards: reviewer name + avatar initials, stars, title, date, "Verified purchase", colour/size bought, review text, "N people found this helpful".
  - Sort: Most helpful / Newest; filter by star level by clicking a bar.
- **Customer questions & answers (FAQ)** on the product page (static per product, display only): 3–5 questions in an accordion, each answer labelled Seller or Customer with date and helpful count; "See all N questions" expands the list.
- **Ask a question** (`sf_questions`): collapsible "Can't find your answer?" row (title + subtitle) at the bottom of the Q&A card that opens to a textarea and Ask button, for signed-in users (guests see "Sign in to ask a question"). Questions are only recorded with status `pending` (row: id, productId/slug/name, vendor, userId/userName, question, status, answer, askedAt, answeredAt) for the vendor portal to answer; the asker sees them at the top of the list with an amber "Awaiting answer" badge.
- Product page gains a sticky in-page link bar (Ratings & reviews · Questions & answers · You may also like) under the header; the top rating links to the reviews.
- Also fixed: product-page delivery copy (no Express option any more; items under ₹999 show "Delivery by …" with the ₹49 fee).

**Manual test steps**
1. Signed out, tapping a heart sends you to sign in and returns you to the page; signed in, the heart toggles instantly with a toast and the header Wishlist count updates.
2. `/wishlist` lists saved products; "Move to cart" adds it to the cart and removes it from the wishlist; "Remove" deletes it; empty state when nothing is saved.
3. Wishlist persists across reload and is per user (a second account sees its own list).
4. Product page shows the ratings summary; the distribution bars add up to the total and match the average; review cards show verified badge, variant and helpful count.
5. Sorting reviews changes their order; clicking a star bar filters reviews to that rating, with a way to clear it.
6. Q&A shows questions in an accordion with Seller/Customer answers; "See all" reveals the rest.
6a. Signed in, open "Can't find your answer?", type a question and press Ask question: toast confirms, it appears at the top with "Awaiting answer", and `sf_questions` holds a pending row; signed out, the row opens to "Sign in to ask a question".
7. In-page links jump to Ratings and Q&A; layout works at ~375px; console clean; `pnpm build` completes.

- [x] Code implementation
- [x] Testing
- [ ] Green signal

## Phase 8: Polish

**Scope**
- Responsive pass (sticky summaries, touch targets), loading/error states everywhere, focus and aria review.
- Theme toggle in the header, small motion details, README with how to swap in a real API.
- Route-level code splitting (`React.lazy`) to bring the main bundle under Vite's 500 kB warning.

**Manual test steps**
1. Full happy path on desktop: browse → add to cart → sign in → checkout → order → view in history.
2. Same path at ~375px width — every page usable, no horizontal scroll, mobile nav works.
3. Theme toggle switches light/dark/system and persists across reload.
4. Keyboard only: tab through header, product page selectors, checkout form — focus is always visible.
5. With latency set high, every page shows a sensible loading state.

- [ ] Code implementation
- [ ] Testing
- [ ] Green signal

## Swapping in a real API

Replace function bodies in `src/api/*.js` with `fetch` calls returning the same shapes. Hooks, query keys and pages stay unchanged. Keep `src/api/seed.js` as fixture data if useful.
