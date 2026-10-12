import { Link } from "react-router"
import { Lock } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Goes to /checkout (sign-in is enforced there by <RequireAuth>). */
export function CheckoutButton({ className, size, onNavigate }) {
  return (
    <Button asChild size={size} className={className}>
      <Link to="/checkout" onClick={onNavigate}>
        <Lock /> Checkout
      </Link>
    </Button>
  )
}
