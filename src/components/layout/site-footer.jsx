import { Link } from "react-router"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CATEGORIES, categoryHref } from "@/lib/categories"
import { STORE_NAME } from "@/lib/constants"
import { useTheme } from "@/providers/theme-provider"
import { Logo } from "./logo"

const COLUMNS = [
  {
    title: "Shop",
    links: CATEGORIES.slice(0, 6).map((c) => ({ label: c.name, to: categoryHref(c.slug) })),
  },
  {
    title: "Customer service",
    links: ["Help center", "Track your order", "Returns & refunds", "Shipping info", "Contact us"].map((label) => ({ label, to: "#" })),
  },
  {
    title: "Company",
    links: [`About ${STORE_NAME}`, "Sell on " + STORE_NAME, "Careers", "Press", "Affiliates"].map((label) => ({ label, to: "#" })),
  },
]

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
]

function Newsletter() {
  function subscribe(e) {
    e.preventDefault()
    e.currentTarget.reset()
    // demo only: nothing is stored or sent
    toast.success("You're on the list", { description: "Watch your inbox for 10% off your first order." })
  }

  return (
    <div className="border-b">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold">Get 10% off your first order</h2>
          <p className="text-muted-foreground">New arrivals, members-only deals and restock alerts. No spam.</p>
        </div>
        <form onSubmit={subscribe} className="flex w-full gap-2 md:max-w-sm">
          <Input type="email" required placeholder="you@example.com" aria-label="Email address" className="h-10 bg-background" />
          <Button type="submit" className="h-10">
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={theme}
      // radix emits "" when the active item is clicked again; keep the current theme
      onValueChange={(next) => next && setTheme(next)}
      aria-label="Color theme"
      className="bg-background"
    >
      {THEMES.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={`${label} theme`} title={label}>
          <Icon />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-subtle">
      <Newsletter />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-muted-foreground">
            A marketplace of considered goods from independent makers. Reference storefront with placeholder data.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-[13px] font-semibold">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {STORE_NAME}. No real payments are processed.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
