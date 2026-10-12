import { cn } from "@/lib/utils"

/** Standard page container + optional header row, keeps spacing consistent across pages. */
export function Page({ title, description, actions, className, headerClassName, children }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10", className)}>
      {(title || actions) && (
        <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", headerClassName)}>
          <div className="space-y-1">
            {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
