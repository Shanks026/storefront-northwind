import { Link } from "react-router"
import { ArrowLeft, BadgePercent, Package, Zap } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { STORE_NAME } from "@/lib/constants"

const PERKS = [
  { icon: BadgePercent, title: "Members save 10%", body: "Member pricing on thousands of products." },
  { icon: Zap, title: "Faster checkout", body: "Saved details mean fewer steps next time." },
  { icon: Package, title: "Track every order", body: "Live status, returns and invoices in one place." },
]

/**
 * Full-page auth screen (no store header/footer): brand panel on the left (desktop),
 * logo + "Back to store" bar and the form on the right.
 */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="hidden border-r bg-subtle p-12 lg:flex lg:flex-col xl:p-16">
        <Logo />

        <div className="my-auto max-w-md py-12">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{STORE_NAME} membership</p>
          <h2 className="mt-3 text-4xl leading-tight font-bold tracking-tight text-balance">One account for the whole marketplace.</h2>
          <ul className="mt-10 space-y-6">
            {PERKS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-background text-primary">
                  <p.icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-muted-foreground">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">Demo store — accounts are stored only in this browser.</p>
      </aside>

      <section className="flex flex-col">
        <div className="flex h-16 items-center justify-between px-6 sm:px-10">
          <Logo className="lg:invisible" />
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to store
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-[13px] text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </section>
    </div>
  )
}
