"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Search, Plus, Pencil, Trash2, X } from "lucide-react"
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
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"
import { StockCell } from "./components/StockCell"

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
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load products")
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
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product")
    }
  }

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title="PRODUCT CATALOG"
          sub="/ INVENTORY"
          action={
            <Link
              href="/admin/products/add"
              className="bg-[#ff6b00] text-white font-bold text-[10px] tracking-[0.2em] uppercase px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:shadow-[0_0_25px_rgba(255,107,0,0.6)] transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" /> ADD PRODUCT
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
                    ? "border-[#ff6b00] text-[#ff6b00] bg-[#ff6b00]/10"
                    : "border-[#353534] text-[#9a9898] hover:border-[#9a9898]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table panel */}
        <GlassCard className="overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0a0a0a]/50 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase">
            <div className="col-span-5">Product Unit</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Price (NGN)</div>
            <div className="col-span-1 text-center">Stock</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {loading ? (
            <SkeletonRows count={6} height="h-16" />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your search or category filter."
              action={
                <OrangeButton onClick={() => { setSearch(""); setActiveCategory("ALL") }}>
                  CLEAR FILTERS
                </OrangeButton>
              }
            />
          ) : (
            <div className="flex flex-col">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border-b border-white/[0.04] items-center hover:bg-[#1a1a1a]/50 transition-colors group relative border-l-2 border-transparent hover:border-l-[#ff6b00]"
                >
                  {/* Product info */}
                  <div className="col-span-1 sm:col-span-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#353534] rounded border border-[#353534] overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9a9898] text-xs">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-white truncate">{product.name}</h3>
                      <p className="text-[10px] text-[#9a9898] mt-0.5 font-mono">
                        ID: {product.id.slice(0, 10).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="col-span-1 sm:col-span-3 flex items-center">
                    <span className="bg-[#1a1a1a] border border-[#353534] text-[#c6c6c6] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {product.category?.name || "—"}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-between sm:justify-start">
                    <span className="sm:hidden text-[10px] text-[#9a9898]">Price:</span>
                    <span className="font-bold text-sm text-white">
                      {formatNGN(product.price)}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="col-span-1 sm:col-span-1 flex items-center justify-between sm:justify-center">
                    <span className="sm:hidden text-[10px] text-[#9a9898]">Stock:</span>
                    <StockCell stock={product.stock ?? 0} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 sm:col-span-1 flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      disabled
                      title="Edit (coming soon)"
                      className="text-[#9a9898] hover:text-[#c6c6c6] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="text-[#9a9898] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </>
  )
}
