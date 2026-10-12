import { useState } from "react"
import { Briefcase, Home, Loader2, MapPin } from "lucide-react"

import { ADDRESS_LABELS, ADDRESS_SCHEMA } from "@/api/addresses"
import { FormField } from "@/components/auth/form-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateAddress, useUpdateAddress } from "@/hooks/use-addresses"
import { useSession } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { INDIAN_STATES, validate } from "@/lib/validation"

const LABEL_ICONS = { Home, Work: Briefcase, Other: MapPin }
const EMPTY = { label: "Home", fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pincode: "", isDefault: false }

/**
 * Add / edit address dialog. `address` = null to create. Mount with a `key` per address
 * (or "new") so the form state resets between uses.
 */
export function AddressFormDialog({ open, onOpenChange, address, onSaved }) {
  const { user } = useSession()
  const create = useCreateAddress()
  const update = useUpdateAddress()
  const saving = create.isPending || update.isPending
  const [values, setValues] = useState(() => (address ? { ...EMPTY, ...address } : { ...EMPTY, fullName: user?.name ?? "" }))
  const [errors, setErrors] = useState({})

  const set = (field) => (eOrValue) => {
    const value = eOrValue?.target ? eOrValue.target.value : eOrValue
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function submit(e) {
    e.preventDefault()
    const clientErrors = validate(values, ADDRESS_SCHEMA)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return
    const options = {
      onSuccess: (saved) => {
        onSaved?.(saved)
        onOpenChange(false)
      },
      onError: (err) => setErrors(err.fields ?? {}),
    }
    if (address) update.mutate({ id: address.id, ...values }, options)
    else create.mutate(values, options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-5">
          <DialogTitle>{address ? "Edit address" : "Add a new address"}</DialogTitle>
          <DialogDescription>We&apos;ll deliver here and call this number if needed.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4 p-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Save as</legend>
            <div className="flex gap-2">
              {ADDRESS_LABELS.map((l) => {
                const Icon = LABEL_ICONS[l]
                return (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={values.label === l}
                    onClick={() => set("label")(l)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
                      values.label === l ? "border-primary bg-accent text-accent-foreground" : "hover:border-foreground/30",
                    )}
                  >
                    <Icon className="size-3.5" /> {l}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" autoComplete="name" value={values.fullName} onChange={set("fullName")} error={errors.fullName} />
            <FormField label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={values.phone} onChange={set("phone")} error={errors.phone} />
          </div>
          <FormField label="Address line 1" autoComplete="address-line1" placeholder="Flat / house no., building, street" value={values.line1} onChange={set("line1")} error={errors.line1} />
          <FormField label="Address line 2 (optional)" autoComplete="address-line2" placeholder="Area, sector, locality" value={values.line2} onChange={set("line2")} />
          <FormField label="Landmark (optional)" placeholder="e.g. Near City Mall" value={values.landmark} onChange={set("landmark")} />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="City" autoComplete="address-level2" value={values.city} onChange={set("city")} error={errors.city} />
            <div className="space-y-1.5">
              <Label htmlFor="address-state">State</Label>
              <Select value={values.state} onValueChange={set("state")}>
                <SelectTrigger id="address-state" className="h-10! w-full" aria-invalid={Boolean(errors.state)}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && <p className="text-xs font-medium text-destructive">{errors.state}</p>}
            </div>
            <FormField label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={values.pincode} onChange={set("pincode")} error={errors.pincode} />
          </div>
          {!address?.isDefault && (
            <div className="flex items-center gap-2.5">
              <Checkbox id="address-default" checked={values.isDefault} onCheckedChange={(v) => set("isDefault")(Boolean(v))} />
              <Label htmlFor="address-default" className="font-normal">
                Make this my default address
              </Label>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {address ? "Save changes" : "Save address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
