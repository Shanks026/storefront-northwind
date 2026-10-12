import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { cancelOrder, getOrder, listOrders, placeOrder } from "@/api/orders"
import { cartKey } from "./use-cart"

export const ordersKey = ["orders"]
export const orderKey = (id) => ["order", id]

// status is time-based in the mock API, so re-read periodically while a page is open
const LIVE = { refetchInterval: 30_000, refetchIntervalInBackground: false }

export function useOrders() {
  return useQuery({ queryKey: ordersKey, queryFn: listOrders, ...LIVE })
}

export function useOrder(id) {
  return useQuery({ queryKey: orderKey(id), queryFn: () => getOrder(id), enabled: Boolean(id), ...LIVE })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(orderKey(order.id), order)
      queryClient.invalidateQueries({ queryKey: ordersKey })
      if (order.source === "cart") queryClient.invalidateQueries({ queryKey: cartKey })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(orderKey(order.id), order)
      queryClient.setQueryData(ordersKey, (list) => list?.map((o) => (o.id === order.id ? order : o)))
      toast.success(`Order #${order.number} cancelled`, {
        description: order.payment.method === "cod" ? undefined : "Your refund will be processed in 3–5 business days.",
      })
    },
    onError: (err) => {
      toast.error(err.message)
      queryClient.invalidateQueries({ queryKey: ordersKey })
    },
  })
}
