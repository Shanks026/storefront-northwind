import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES } from "@/lib/categories"
import { cn } from "@/lib/utils"

/** Marketplace search: optional category scope + query, submits to the listing URL. */
export function HeaderSearch({ className, showScope = true, onSubmitted }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get("q") ?? "")
  const [scope, setScope] = useState(params.get("category") ?? "all")

  // keep the box in sync when the URL changes (back/forward, category links)
  useEffect(() => {
    setQ(params.get("q") ?? "")
    setScope(params.get("category") ?? "all")
  }, [params])

  function submit(e) {
    e.preventDefault()
    const next = new URLSearchParams()
    if (q.trim()) next.set("q", q.trim())
    if (scope !== "all") next.set("category", scope)
    navigate(`/products?${next}`)
    onSubmitted?.()
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30",
        className,
      )}
    >
      {showScope && (
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger
            aria-label="Search in category"
            className="hidden h-full! w-auto max-w-44 shrink-0 rounded-none border-0 border-r bg-muted/60 px-3 text-xs font-medium shadow-none focus-visible:ring-0 md:flex dark:bg-muted/60"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands and categories"
        aria-label="Search products"
        className="h-full flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <Button type="submit" aria-label="Search" className="h-full rounded-none px-4">
        <Search />
      </Button>
    </form>
  )
}
