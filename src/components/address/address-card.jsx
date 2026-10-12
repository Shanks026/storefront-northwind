import { Pencil, Phone, Trash2 } from "lucide-react"

import { formatAddress } from "@/api/addresses"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDeleteAddress, useSetDefaultAddress } from "@/hooks/use-addresses"
import { cn } from "@/lib/utils"

/** Address details + actions. `selectable` renders it as a radio option (checkout). */
export function AddressCard({ address, onEdit, selectable = false, selected = false, onSelect, className }) {
  const remove = useDeleteAddress()
  const makeDefault = useSetDefaultAddress()

  const body = (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold">{address.fullName}</span>
        <Badge variant="secondary" className="rounded px-1.5 py-0 text-[10px] tracking-wide uppercase">
          {address.label}
        </Badge>
        {address.isDefault && (
          <Badge variant="outline" className="rounded border-primary/30 px-1.5 py-0 text-[10px] tracking-wide text-primary uppercase">
            Default
          </Badge>
        )}
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{formatAddress(address)}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Phone className="size-3.5" /> {address.phone}
      </p>
    </div>
  )

  const actions = (
    <div className="flex flex-wrap items-center gap-1 pt-3 sm:pt-0">
      <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onEdit(address)}>
        <Pencil className="size-3.5" /> Edit
      </Button>
      {!address.isDefault && (
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" disabled={makeDefault.isPending} onClick={() => makeDefault.mutate(address.id)}>
          Set as default
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive">
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              {address.label} · {formatAddress(address)}. Past orders keep their own copy of the address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => remove.mutate(address.id)}>
              Delete address
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  if (!selectable) {
    return (
      <div className={cn("flex flex-col justify-between gap-2 rounded-xl border bg-card p-4 sm:flex-row sm:items-start", className)}>
        {body}
        {actions}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 transition-colors has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50",
        selected ? "border-primary bg-primary/[0.03]" : "hover:border-foreground/20",
        className,
      )}
    >
      <label className="flex cursor-pointer gap-3">
        <input
          type="radio"
          name="delivery-address"
          value={address.id}
          checked={selected}
          onChange={() => onSelect(address.id)}
          className="mt-1 size-4 shrink-0 accent-primary"
        />
        {body}
      </label>
      <div className="pl-7">{actions}</div>
    </div>
  )
}
