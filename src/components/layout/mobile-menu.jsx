import { useState } from "react"
import { Link } from "react-router"
import { Flame, Heart, HelpCircle, LogOut, MapPin, Menu, Package, User } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "@/hooks/use-auth"
import { CATEGORIES, categoryHref, DEALS_HREF } from "@/lib/categories"
import { STORE_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { HeaderSearch } from "./header-search"
import { useSignOutAndLeave } from "./user-menu"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { user } = useSession()
  const signOutAndLeave = useSignOutAndLeave()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>{STORE_NAME}</SheetTitle>
          <SheetDescription className="sr-only">Browse categories and account links</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <HeaderSearch showScope={false} onSubmitted={close} />
          </div>
          <div className="space-y-0.5 px-2 pb-2">
            <MenuLink to={DEALS_HREF} icon={Flame} onClick={close} className="text-deal">
              Today&apos;s deals
            </MenuLink>
            <MenuLink to="/orders" icon={Package} onClick={close}>
              Returns &amp; orders
            </MenuLink>
            <MenuLink to="/wishlist" icon={Heart} onClick={close}>
              Wishlist
            </MenuLink>
            {user && (
              <MenuLink to="/account/addresses" icon={MapPin} onClick={close}>
                Saved addresses
              </MenuLink>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  close()
                  signOutAndLeave()
                }}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left font-medium hover:bg-accent"
              >
                <LogOut className="size-4" />
                Sign out
                <span className="ml-auto truncate text-xs font-normal text-muted-foreground">{user.email}</span>
              </button>
            ) : (
              <MenuLink to="/login" icon={User} onClick={close}>
                Sign in / Register
              </MenuLink>
            )}
          </div>
          <p className="border-t px-4 pt-4 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Shop by category
          </p>
          <Accordion type="single" collapsible className="px-4">
            {CATEGORIES.map((c) => (
              <AccordionItem key={c.slug} value={c.slug}>
                <AccordionTrigger className="py-3 hover:no-underline">
                  <span className="flex items-center gap-2.5">
                    <span className={cn("grid size-7 place-items-center rounded-md", c.tone)}>
                      <c.icon className="size-4" />
                    </span>
                    {c.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-0.5 pb-3 pl-9.5">
                  <Link to={categoryHref(c.slug)} onClick={close} className="py-1.5 font-medium">
                    All {c.name}
                  </Link>
                  {c.subcategories.map((s) => (
                    <Link
                      key={s.slug}
                      to={categoryHref(c.slug, s.slug)}
                      onClick={close}
                      className="py-1.5 text-muted-foreground"
                    >
                      {s.name}
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-2 border-t p-2">
            <MenuLink to="#" icon={HelpCircle} onClick={close}>
              Help center
            </MenuLink>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MenuLink({ to, icon: Icon, children, className, ...props }) {
  return (
    <Link
      to={to}
      className={cn("flex items-center gap-3 rounded-md px-2 py-2.5 font-medium hover:bg-accent", className)}
      {...props}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  )
}
