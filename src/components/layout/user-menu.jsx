import { Link, useNavigate } from "react-router"
import { ChevronDown, Heart, LogOut, MapPin, Package, User } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, useSignOut } from "@/hooks/use-auth"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

const ACTION = "flex h-10 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-accent"

/** Leaves protected pages first so the guard doesn't bounce the user to /login. */
export function useSignOutAndLeave() {
  const signOut = useSignOut()
  const navigate = useNavigate()
  return () => {
    navigate("/")
    signOut.mutate(undefined, { onSuccess: () => toast.success("You've been signed out") })
  }
}

export function UserMenu() {
  const { user, isAuthenticated } = useSession()
  const signOutAndLeave = useSignOutAndLeave()

  if (!isAuthenticated) {
    return (
      <Link to="/login" aria-label="Sign in" className={ACTION}>
        <User className="size-5" />
        <span className="hidden lg:inline">Sign in</span>
      </Link>
    )
  }

  const firstName = user.name.split(" ")[0]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className={cn(ACTION, "data-[state=open]:bg-accent")} aria-label={`Account menu for ${user.name}`}>
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary text-[11px] font-bold text-primary-foreground">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate lg:inline">Hi, {firstName}</span>
        <ChevronDown className="hidden size-3.5 opacity-60 lg:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/orders">
            <Package /> Your orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist">
            <Heart /> Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/addresses">
            <MapPin /> Saved addresses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOutAndLeave}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
