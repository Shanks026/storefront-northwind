import { Link } from "react-router"
import { Heart, Package } from "lucide-react"

import { CartSheet } from "@/components/cart/cart-sheet"
import { useWishlist } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"
import { CategoryBar } from "./category-bar"
import { HeaderSearch } from "./header-search"
import { Logo } from "./logo"
import { MobileMenu } from "./mobile-menu"
import { UserMenu } from "./user-menu"

/** Header action: icon + label (label hidden on small screens), optional count badge. The cart button lives in <CartSheet>. */
function HeaderAction({ to, icon: Icon, label, count, className }) {
  return (
    <Link
      to={to}
      aria-label={count ? `${label}, ${count} items` : label}
      className={cn(
        "flex h-10 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-accent",
        className,
      )}
    >
      <span className="relative">
        <Icon className="size-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-primary-foreground ring-2 ring-background">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  )
}

export function SiteHeader() {
  const { data: wishlist } = useWishlist()

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6">
          <MobileMenu />
          <Logo />
          <HeaderSearch className="mx-auto hidden max-w-2xl md:flex" />
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <UserMenu />
            <HeaderAction to="/orders" icon={Package} label="Orders" className="hidden sm:flex" />
            <HeaderAction to="/wishlist" icon={Heart} label="Wishlist" count={wishlist?.length} className="hidden sm:flex" />
            <CartSheet />
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <HeaderSearch showScope={false} />
        </div>
      </div>
      <CategoryBar />
    </header>
  )
}
