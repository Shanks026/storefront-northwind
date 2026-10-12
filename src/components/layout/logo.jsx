import { Link } from "react-router"

import { STORE_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Logo({ className }) {
  return (
    <Link to="/" aria-label={`${STORE_NAME} home`} className={cn("flex shrink-0 items-center gap-2 text-[17px] font-bold tracking-tight", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
          <path d="M3 5h10l-1.2 8H4.2z" />
          <path d="M5.5 5a2.5 2.5 0 0 1 5 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      <span>
        {STORE_NAME}
        <span className="text-primary">.</span>
      </span>
    </Link>
  )
}
