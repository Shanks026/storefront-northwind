import { MapPin, Plus } from "lucide-react"

import { AddressCard } from "@/components/address/address-card"
import { useAddressEditor } from "@/components/address/use-address-editor"
import { Page } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddresses } from "@/hooks/use-addresses"

/** /account/addresses — protected by <RequireAuth>. */
export function AddressesPage() {
  const { data: addresses, isPending } = useAddresses()
  const { openEditor, editor } = useAddressEditor()

  return (
    <Page
      title="Saved addresses"
      description="Manage where your orders are delivered."
      actions={
        <Button onClick={() => openEditor(null)}>
          <Plus /> Add address
        </Button>
      }
      className="max-w-3xl"
    >
      {isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-grid flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-accent text-primary">
            <MapPin className="size-5" />
          </span>
          <h2 className="mt-4 text-base font-semibold">No saved addresses yet</h2>
          <p className="mt-1 max-w-sm text-muted-foreground">Add an address to check out faster next time.</p>
          <Button className="mt-5" onClick={() => openEditor(null)}>
            <Plus /> Add your first address
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {addresses.map((a) => (
            <li key={a.id}>
              <AddressCard address={a} onEdit={openEditor} />
            </li>
          ))}
        </ul>
      )}
      {editor}
    </Page>
  )
}
