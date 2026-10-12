import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getSession, signIn, signOut, signUp } from "@/api/auth"
import { STORAGE_KEYS } from "@/lib/constants"

export const sessionKey = ["session"]

// Query roots whose data belongs to the signed-in user; refetched whenever identity changes.
const USER_SCOPED = new Set(["cart", "orders", "order", "addresses", "wishlist", "my-questions"])

/** { user, isAuthenticated, isLoading } — the session only changes through the mutations below. */
export function useSession() {
  const query = useQuery({ queryKey: sessionKey, queryFn: getSession, staleTime: Infinity })
  return {
    user: query.data?.user ?? null,
    isAuthenticated: Boolean(query.data?.user),
    isLoading: query.isPending,
  }
}

function useSessionMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey, session)
      queryClient.invalidateQueries({ predicate: (q) => USER_SCOPED.has(q.queryKey[0]) })
    },
  })
}

export const useSignIn = () => useSessionMutation(signIn)
export const useSignUp = () => useSessionMutation(signUp)
export const useSignOut = () => useSessionMutation(signOut)

/** Keeps every open tab in sync when another tab signs in/out or edits the cart / wishlist. Mount once. */
export function useSessionSync() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEYS.session || e.key === null) queryClient.invalidateQueries({ queryKey: sessionKey })
      if (e.key === STORAGE_KEYS.cart || e.key === null) queryClient.invalidateQueries({ queryKey: ["cart"] })
      if (e.key === STORAGE_KEYS.wishlist || e.key === null) queryClient.invalidateQueries({ queryKey: ["wishlist"] })
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [queryClient])
}
