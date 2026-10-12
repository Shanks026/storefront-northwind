import { Headset, RotateCcw, ShieldCheck, Truck } from "lucide-react"

const ITEMS = [
  { icon: Truck, title: "Free shipping", body: "On orders over ₹999" },
  { icon: RotateCcw, title: "30-day returns", body: "Free and easy" },
  { icon: ShieldCheck, title: "Secure checkout", body: "Encrypted payments" },
  { icon: Headset, title: "Support 7 days", body: "Real humans, fast replies" },
]

/** Service promises row — sits at the bottom of the home page, just above the footer. */
export function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 border-t pt-10 lg:grid-cols-4">
      {ITEMS.map((item) => (
        <li key={item.title} className="flex items-center gap-3">
          <item.icon className="size-6 shrink-0 text-primary" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="font-semibold">{item.title}</p>
            <p className="text-[13px] text-muted-foreground">{item.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
