import { Loader2 } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { useCancelOrder } from "@/hooks/use-orders"
import { formatPrice } from "@/lib/format"

/** Renders nothing unless the order can still be cancelled (before it ships). */
export function CancelOrderButton({ order, size = "sm", variant = "outline", className }) {
  const cancel = useCancelOrder()
  if (!order.cancellable) return null

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={cancel.isPending}>
          {cancel.isPending && <Loader2 className="animate-spin" />}
          Cancel order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order #{order.number}?</AlertDialogTitle>
          <AlertDialogDescription>
            {order.payment.method === "cod"
              ? "Nothing has been charged, so there's nothing to refund."
              : `${formatPrice(order.totals.total)} will be refunded to ${order.payment.label} within 3–5 business days.`}{" "}
            This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => cancel.mutate(order.id)}>
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
