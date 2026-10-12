import { Link } from "react-router"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CartEmpty({ onNavigate, className }) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-full bg-accent text-primary">
        <ShoppingCart className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold">Your cart is empty</h3>
      <p className="mt-1 max-w-xs text-muted-foreground">Bestsellers, daily deals and new arrivals are waiting for you.</p>
      <Button asChild className="mt-5">
        <Link to="/products" onClick={onNavigate}>
          Start shopping
        </Link>
      </Button>
    </div>
  )
}
