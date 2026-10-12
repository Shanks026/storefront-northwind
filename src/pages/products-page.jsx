import { CatalogSection } from "@/components/catalog/catalog-section"

/** Search / browse results: `/products?q=&category=&sub=&deals=&price=&rating=&inStock=&sort=` */
export function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <CatalogSection />
    </div>
  )
}
