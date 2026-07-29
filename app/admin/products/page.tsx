"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Search, Plus, Pencil, Trash2, PackageX } from "lucide-react"
import { productsApi } from "@/services/products"
import type { Product } from "@/types/api"
import { formatNGN } from "@/lib/admin-utils"
import {
  AdminPageHeader,
  GlassCard,
  SkeletonRows,
  DarkInput,
  OrangeButton,
  EmptyState,
  AdminTable,
  AdminTr,
  AdminTd,
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"
import { StockCell } from "./components/StockCell"
import { getErrorMessage } from "@/lib/get-error-message"

/* ── Main Page ── */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")

  const categoryPills = useMemo(() => {
    const names = new Set(products.map((p) => p.category?.name).filter(Boolean))
    return ["ALL", ...Array.from(names).sort()]
  }, [products])

  const filtered = useMemo(() =>
    products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === "ALL" || p.category?.name === activeCategory
      return matchSearch && matchCat
    }),
  [products, search, activeCategory])

  const load = async () => {
    const prods = await productsApi.getProducts()
    setProducts(prods)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load products"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await productsApi.deleteProduct(id)
      toast.success("Product deleted")
      await load()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete product"))
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="PRODUCT CATALOG"
        sub="/ INVENTORY"
        action={
          <Link href="/admin/products/add">
            <OrangeButton pill>
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> ADD PRODUCT
              </span>
            </OrangeButton>
          </Link>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <DarkInput
          placeholder="Filter inventory..."
          value={search}
          onChange={setSearch}
          icon={<Search className="h-4 w-4" />}
          className="w-full md:w-80 flex-shrink-0"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 w-full">
          {categoryPills.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap flex-shrink-0 border transition-all",
                activeCategory === cat
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table panel */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <SkeletonRows count={6} height="h-16" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageX className="h-8 w-8" />}
            title="No products found"
            message="Try adjusting your search or category filter."
            action={
              <OrangeButton onClick={() => { setSearch(""); setActiveCategory("ALL") }}>
                CLEAR FILTERS
              </OrangeButton>
            }
          />
        ) : (
          <AdminTable
            headers={["Product Unit", "Category", "Price (NGN)", { label: "Stock", align: "center" }, "Actions"]}
          >
            {filtered.map((product) => (
              <AdminTr key={product.id}>
                {/* Product info */}
                <AdminTd>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-border rounded border border-border overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-white truncate">{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        ID: {product.id.slice(0, 10).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </AdminTd>

                {/* Category */}
                <AdminTd>
                  <span className="bg-[#1a1a1a] border border-border text-secondary-text px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {product.category?.name || "—"}
                  </span>
                </AdminTd>

                {/* Price */}
                <AdminTd className="font-bold text-sm text-white">
                  {formatNGN(product.price)}
                </AdminTd>

                {/* Stock */}
                <AdminTd className="text-center">
                  <StockCell stock={product.stock ?? 0} />
                </AdminTd>

                {/* Actions */}
                <AdminTd className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      disabled
                      title="Edit (coming soon)"
                      className="text-muted-foreground hover:text-secondary-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTable>
        )}
      </GlassCard>
    </div>
  )
}
