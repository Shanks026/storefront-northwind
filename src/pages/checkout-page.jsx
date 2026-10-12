import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Banknote, ChevronRight, CreditCard, Lock, MapPin, Plus, Smartphone } from "lucide-react"
import { toast } from "sonner"

import { PAYMENT_METHODS, PAYMENT_SCHEMAS } from "@/api/orders"
import { AddressCard } from "@/components/address/address-card"
import { useAddressEditor } from "@/components/address/use-address-editor"
import { FormField } from "@/components/auth/form-field"
import { CartEmpty } from "@/components/cart/cart-empty"
import { CheckoutSummary } from "@/components/checkout/checkout-summary"
import { ChoiceCard } from "@/components/checkout/choice-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddresses } from "@/hooks/use-addresses"
import { useSession } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { usePlaceOrder } from "@/hooks/use-orders"
import { useProduct } from "@/hooks/use-products"
import { MAX_QTY_PER_ITEM } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { quote } from "@/lib/pricing"
import { cardBrand, formatCardNumber, formatExpiry, validate } from "@/lib/validation"
import { NotFoundPage } from "./not-found-page"

const PAYMENT_ICONS = { upi: Smartphone, card: CreditCard, cod: Banknote }
const EMPTY_PAYMENT = { upiId: "", cardNumber: "", cardName: "", expiry: "", cvc: "" }

function Section({ step, title, icon: Icon, action, error, children }) {
  return (
    <section aria-labelledby={`step-${step}`} className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <h2 id={`step-${step}`} className="flex items-center gap-2.5 font-semibold">
          <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{step}</span>
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">
        {error && (
          <p role="alert" data-checkout-error className="mb-3 text-[13px] font-medium text-destructive">
            {error}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

/** Builds the line being bought from ?mode=buynow&product=<slug>&color=&size=&qty= */
function useBuyNowLine(params, enabled) {
  const { data: product, isPending, error } = useProduct(enabled ? params.get("product") : null)
  return useMemo(() => {
    if (!enabled) return { line: null }
    if (error) return { line: null, error }
    if (isPending || !product) return { line: null, isPending: true }
    const qty = Math.max(1, Math.min(Number(params.get("qty")) || 1, Math.min(product.stock, MAX_QTY_PER_ITEM)))
    return {
      product,
      line: {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: product.image,
        art: product.art,
        colors: product.colors,
        color: product.colors.find((c) => c.name === params.get("color")) ?? product.colors[0],
        size: params.get("size") || null,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: qty,
      },
    }
  }, [enabled, error, isPending, product, params])
}

export function CheckoutPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const buyNow = params.get("mode") === "buynow"
  const { user } = useSession()
  const cart = useCart()
  const buyNowItem = useBuyNowLine(params, buyNow)
  const { data: addresses, isPending: addressesLoading } = useAddresses()
  const placeOrder = usePlaceOrder()

  const [addressId, setAddressId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [payment, setPayment] = useState(EMPTY_PAYMENT)
  const [errors, setErrors] = useState({})
  const errorsRef = useRef(null)

  const { openEditor, editor } = useAddressEditor({
    onSaved: (saved) => {
      setAddressId(saved.id)
      setErrors((e) => ({ ...e, address: undefined }))
    },
  })

  // pre-select the default (first) address once loaded, or if the selected one was deleted
  useEffect(() => {
    if (!addresses) return
    if (!addresses.some((a) => a.id === addressId)) setAddressId(addresses[0]?.id ?? null)
  }, [addresses, addressId])

  const lines = buyNow ? (buyNowItem.line ? [buyNowItem.line] : []) : (cart.data?.lines ?? [])
  const totals = quote(lines)
  const loading = buyNow ? buyNowItem.isPending : cart.isPending

  const setPay = (field, format) => (e) => {
    const value = format ? format(e.target.value) : e.target.value
    setPayment((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  function scrollToFirstError() {
    requestAnimationFrame(() => {
      const el = errorsRef.current?.querySelector('[aria-invalid="true"], [data-checkout-error]')
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      if (el?.focus && el.tagName === "INPUT") el.focus({ preventScroll: true })
    })
  }

  function submit() {
    const nextErrors = { ...validate({ ...payment }, PAYMENT_SCHEMAS[paymentMethod]) }
    if (!addressId) nextErrors.address = "Add or choose a delivery address."
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      scrollToFirstError()
      return
    }

    placeOrder.mutate(
      {
        mode: buyNow ? "buynow" : "cart",
        item: buyNow ? { productId: buyNowItem.line.productId, color: buyNowItem.line.color?.name, size: buyNowItem.line.size, quantity: buyNowItem.line.quantity } : undefined,
        addressId,
        payment: { method: paymentMethod, ...payment },
        email: user.email,
      },
      {
        onSuccess: (order) => navigate(`/orders/${order.id}?placed=1`, { replace: true }),
        onError: (err) => {
          if (err.fields) {
            setErrors(err.fields)
            scrollToFirstError()
          }
          toast.error(err.message)
        },
      },
    )
  }

  if (buyNow && buyNowItem.error?.status === 404) {
    return <NotFoundPage title="Product not found" message="The item you tried to buy is no longer available." />
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
        <CartEmpty className="rounded-2xl border border-dashed" />
      </div>
    )
  }

  const outOfStock = lines.find((l) => l.inStock === false)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Checkout steps" className="mb-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        {buyNow ? <Link to={`/products/${buyNowItem.line.slug}`} className="hover:text-foreground">Product</Link> : <Link to="/cart" className="hover:text-foreground">Cart</Link>}
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">Checkout</span>
        <ChevronRight className="size-3.5" />
        <span>Confirmation</span>
      </nav>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Lock className="size-5 text-muted-foreground" /> Secure checkout
      </h1>

      {outOfStock && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {outOfStock.name} is out of stock. <Link to="/cart" className="font-semibold underline">Remove it from your cart</Link> to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div ref={errorsRef} className="min-w-0 space-y-5">
          <Section
            step={1}
            title="Delivery address"
            icon={MapPin}
            error={errors.address}
            action={
              addresses?.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => openEditor(null)}>
                  <Plus /> Add new
                </Button>
              )
            }
          >
            <p className="mb-4 text-[13px] text-muted-foreground">
              Ordering as <span className="font-medium text-foreground">{user.name}</span> · {user.email}
            </p>
            {addressesLoading ? (
              <Skeleton className="h-28 rounded-xl" />
            ) : addresses.length === 0 ? (
              <button
                type="button"
                onClick={() => openEditor(null)}
                className="flex w-full flex-col items-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors hover:border-primary hover:bg-primary/[0.03]"
              >
                <span className="grid size-10 place-items-center rounded-full bg-accent text-primary">
                  <Plus className="size-5" />
                </span>
                <span className="mt-3 font-semibold">Add a delivery address</span>
                <span className="text-[13px] text-muted-foreground">It&apos;s saved to your account for next time.</span>
              </button>
            ) : (
              <div className="space-y-3" role="radiogroup" aria-label="Delivery address">
                {addresses.map((a) => (
                  <AddressCard
                    key={a.id}
                    address={a}
                    selectable
                    selected={a.id === addressId}
                    onSelect={(id) => {
                      setAddressId(id)
                      setErrors((e) => ({ ...e, address: undefined }))
                    }}
                    onEdit={openEditor}
                  />
                ))}
              </div>
            )}
          </Section>

          <Section step={2} title="Payment" icon={CreditCard}>
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {PAYMENT_METHODS.map((m) => (
                <ChoiceCard
                  key={m.id}
                  name="payment"
                  value={m.id}
                  checked={paymentMethod === m.id}
                  onChange={(id) => {
                    setPaymentMethod(id)
                    setErrors({})
                  }}
                  title={m.label}
                  description={m.description}
                  icon={PAYMENT_ICONS[m.id]}
                >
                  {m.id === "upi" && (
                    <FormField label="UPI ID" placeholder="yourname@okbank" autoComplete="off" value={payment.upiId} onChange={setPay("upiId")} error={errors.upiId} className="max-w-sm" />
                  )}
                  {m.id === "card" && (
                    <div className="grid max-w-md gap-4 sm:grid-cols-2">
                      <FormField
                        label={`Card number${payment.cardNumber ? ` · ${cardBrand(payment.cardNumber)}` : ""}`}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        value={payment.cardNumber}
                        onChange={setPay("cardNumber", formatCardNumber)}
                        error={errors.cardNumber}
                        className="sm:col-span-2"
                      />
                      <FormField label="Name on card" autoComplete="cc-name" value={payment.cardName} onChange={setPay("cardName")} error={errors.cardName} className="sm:col-span-2" />
                      <FormField label="Expiry (MM/YY)" inputMode="numeric" autoComplete="cc-exp" placeholder="08/29" value={payment.expiry} onChange={setPay("expiry", formatExpiry)} error={errors.expiry} />
                      <FormField label="CVV" type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={payment.cvc} onChange={setPay("cvc")} error={errors.cvc} />
                    </div>
                  )}
                  {m.id === "cod" && <p className="text-[13px] text-muted-foreground">Pay {formatPrice(totals.total)} in cash or UPI to the delivery partner.</p>}
                </ChoiceCard>
              ))}
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <CheckoutSummary
            lines={lines}
            totals={totals}
            paymentMethod={paymentMethod}
            placing={placeOrder.isPending}
            buyNow={buyNow}
            onPlaceOrder={submit}
          />
        </aside>
      </div>
      {editor}
    </div>
  )
}
