import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

const KEYS = ["q", "category", "sub", "deals", "price", "rating", "inStock", "sort"]

/** Catalog filters live in the URL so results are shareable and survive reloads. */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(() => {
    const f = {}
    for (const key of KEYS) {
      const value = params.get(key)
      if (value) f[key] = value
    }
    return f
  }, [params])

  /** Merge changes into the URL; null/"" removes a key. Changing category clears sub. */
  const setFilters = useCallback(
    (changes) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if ("category" in changes && changes.category !== prev.get("category")) next.delete("sub")
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === undefined || value === "" || value === false) next.delete(key)
          else next.set(key, String(value))
        }
        return next
      })
    },
    [setParams],
  )

  const clearFilters = useCallback(() => setParams(new URLSearchParams()), [setParams])

  return { filters, setFilters, clearFilters }
}
