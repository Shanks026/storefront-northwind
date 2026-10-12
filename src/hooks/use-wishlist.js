import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router"
import { toast } from "sonner"

import { addToWishlist, listWishlist, removeFromWishlist } from "@/api/wishlist"
import { useSession } from "@/hooks/use-auth"

export const wishlistKey = ["wishlist"]

export function useWishlist() {
  const { isAuthenticated } = useSession()
  return useQuery({ queryKey: wishlistKey, queryFn: listWishlist, enabled: isAuthenticated, staleTime: Infinity })
}

/** Whether a product is saved, from the cached wishlist (false for guests). */
export function useIsWishlisted(productId) {
  const { data } = useWishlist()
  return Boolean(data?.some((row) => row.product.id === productId))
}

/**
 * Optimistic save / unsave. Guests are sent to sign in and brought back to the current page.
 * Returns `toggle(product, { silent })`.
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useMutation({
    mutationKey: wishlistKey,
    mutationFn: ({ product, save }) => (save ? addToWishlist(product.id) : removeFromWishlist(product.id)),
    onMutate: async ({ product, save }) => {
      await queryClient.cancelQueries({ queryKey: wishlistKey })
      const previous = queryClient.getQueryData(wishlistKey)
      queryClient.setQueryData(wishlistKey, (rows = []) =>
        save
          ? [{ product, addedAt: new Date().toISOString() }, ...rows.filter((r) => r.product.id !== product.id)]
          : rows.filter((r) => r.product.id !== product.id),
      )
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      queryClient.setQueryData(wishlistKey, ctx?.previous)
      toast.error(err.message)
    },
    onSuccess: (rows, { product, save, silent }) => {
      if (queryClient.isMutating({ mutationKey: wishlistKey }) <= 1) queryClient.setQueryData(wishlistKey, rows)
      if (silent) return
      toast.success(save ? "Saved to wishlist" : "Removed from wishlist", {
        description: product.name,
        action: save ? { label: "View", onClick: () => navigate("/wishlist") } : undefined,
      })
    },
  })

  return (product, { silent = false } = {}) => {
    if (!isAuthenticated) {
      toast.info("Sign in to save items to your wishlist")
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    const rows = queryClient.getQueryData(wishlistKey) ?? []
    const save = !rows.some((r) => r.product.id === product.id)
    mutation.mutate({ product, save, silent })
  }
}
