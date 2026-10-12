import { Link, useSearchParams } from "react-router"
import { ChevronDown, Flame, LayoutGrid } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CATEGORIES, categoryHref, DEALS_HREF } from "@/lib/categories"
import { cn } from "@/lib/utils"

function AllCategoriesMenu() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5 font-semibold">
          <LayoutGrid />
          All categories
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-[min(92vw,800px)] p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div key={c.slug} className="min-w-0">
              <DropdownMenuItem asChild className="gap-2 font-semibold">
                <Link to={categoryHref(c.slug)}>
                  <span className={cn("grid size-6 place-items-center rounded-md", c.tone)}>
                    <c.icon className="size-3.5" />
                  </span>
                  {c.name}
                </Link>
              </DropdownMenuItem>
              {c.subcategories.map((s) => (
                <DropdownMenuItem key={s.slug} asChild className="py-1 pl-10 text-[13px] text-muted-foreground">
                  <Link to={categoryHref(c.slug, s.slug)}>{s.name}</Link>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Second header row: mega menu + quick category links + deals. */
export function CategoryBar() {
  const [params] = useSearchParams()
  const active = params.get("category")
  const dealsActive = params.get("deals") === "true"

  return (
    <div className="border-b bg-background">
      <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4 sm:px-6">
        <div className="hidden md:block">
          <AllCategoriesMenu />
        </div>
        <div className="mx-2 hidden h-5 w-px bg-border md:block" aria-hidden />
        <nav aria-label="Categories" className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to={categoryHref(c.slug)}
              aria-current={active === c.slug ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                active === c.slug && "bg-accent text-accent-foreground",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <Link
          to={DEALS_HREF}
          aria-label="Today's deals"
          aria-current={dealsActive ? "page" : undefined}
          className={cn(
            "ml-2 flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-deal transition-colors hover:bg-deal/10",
            dealsActive && "bg-deal/10",
          )}
        >
          <Flame className="size-4" />
          <span className="hidden sm:inline">Today&apos;s deals</span>
          <span className="sm:hidden">Deals</span>
        </Link>
      </div>
    </div>
  )
}
