import { useState } from "react"

import { AddressFormDialog } from "./address-form-dialog"

/**
 * Owns the add/edit dialog. `openEditor(null)` = new address, `openEditor(address)` = edit.
 * Render `editor` once in the page.
 */
export function useAddressEditor({ onSaved } = {}) {
  const [state, setState] = useState({ open: false, address: null, session: 0 })

  const openEditor = (address = null) => setState((s) => ({ open: true, address, session: s.session + 1 }))
  const setOpen = (open) => setState((s) => ({ ...s, open }))

  const editor = (
    <AddressFormDialog
      // new key per opening so the form starts fresh each time
      key={state.session}
      open={state.open}
      onOpenChange={setOpen}
      address={state.address}
      onSaved={onSaved}
    />
  )

  return { openEditor, editor }
}
