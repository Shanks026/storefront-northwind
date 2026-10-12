import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createAddress, deleteAddress, listAddresses, setDefaultAddress, updateAddress } from "@/api/addresses"
import { useSession } from "@/hooks/use-auth"

export const addressesKey = ["addresses"]

export function useAddresses() {
  const { isAuthenticated } = useSession()
  return useQuery({ queryKey: addressesKey, queryFn: listAddresses, enabled: isAuthenticated })
}

/** Puts a saved address into the cached list right away (default first), before the refetch. */
function upsert(list = [], saved) {
  const rest = list.filter((a) => a.id !== saved.id).map((a) => (saved.isDefault ? { ...a, isDefault: false } : a))
  return [saved, ...rest].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
}

function useAddressMutation(mutationFn, successMessage, applyToCache) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      // update the cache synchronously so callers (e.g. checkout selecting the new address) see it immediately
      if (applyToCache) queryClient.setQueryData(addressesKey, (list) => applyToCache(list, result))
      queryClient.invalidateQueries({ queryKey: addressesKey })
      if (successMessage) toast.success(successMessage)
    },
  })
}

export const useCreateAddress = () => useAddressMutation(createAddress, "Address saved", upsert)
export const useUpdateAddress = () => useAddressMutation(({ id, ...input }) => updateAddress(id, input), "Address updated", upsert)
export const useDeleteAddress = () =>
  useAddressMutation(deleteAddress, "Address deleted", (list = [], { id }) => list.filter((a) => a.id !== id))
export const useSetDefaultAddress = () => useAddressMutation(setDefaultAddress, "Default address updated", upsert)
