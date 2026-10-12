import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { addItem, getCart, removeItem, summarize, updateItem } from "@/api/cart"
import { useCartSheet } from "@/providers/cart-sheet-provider"

export const cartKey = ["cart"]

export function useCart() {
  return useQuery({ queryKey: cartKey, queryFn: getCart, staleTime: Infinity })
}

/** Adds a line and shows a toast with a "View cart" shortcut to the cart sheet. */
export function useAddToCart() {
  const queryClient = useQueryClient()
  const { openCart } = useCartSheet()

  return useMutation({
    mutationKey: cartKey,
    mutationFn: addItem,
    onSuccess: ({ cart, added }, vars) => {
      queryClient.setQueryData(cartKey, cart)
      const line = cart.lines.find((l) => l.productId === vars.productId)
      const clamped = added < (vars.quantity ?? 1)
      toast.success(clamped ? `Added ${added} — that's the maximum for this item` : "Added to cart", {
        description: line ? `${added} × ${line.name}` : undefined,
        action: { label: "View cart", onClick: openCart },
      })
    },
    onError: (err) => toast.error(err.message),
  })
}

/**
 * Optimistic cart edit: apply `change(lines)` to the cached cart immediately,
 * roll back if the request fails, then resync with the "server".
 */
function useOptimisticCartMutation(mutationFn, change) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cartKey,
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: cartKey })
      const previous = queryClient.getQueryData(cartKey)
      if (previous) queryClient.setQueryData(cartKey, summarize(change(previous.lines, vars)))
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(cartKey, ctx.previous)
      toast.error(err.message)
    },
    // only the last in-flight edit writes the server result, so quick taps don't flicker back
    onSuccess: (cart) => {
      if (queryClient.isMutating({ mutationKey: cartKey }) <= 1) queryClient.setQueryData(cartKey, cart)
    },
  })
}

export const useUpdateCartItem = () =>
  useOptimisticCartMutation(
    ({ id, quantity }) => updateItem(id, quantity),
    (lines, { id, quantity }) =>
      lines.map((l) => (l.id === id ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxQuantity)) } : l)),
  )

export const useRemoveCartItem = () =>
  useOptimisticCartMutation(
    (id) => removeItem(id),
    (lines, id) => lines.filter((l) => l.id !== id),
  )
