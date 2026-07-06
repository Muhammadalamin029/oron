"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { Search, Plus, Pencil, Trash2, X } from "lucide-react"
import { productsApi } from "@/services/products"
import { categoriesApi } from "@/services/categories"
import type { Category, Product } from "@/types/api"
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

/* ── Create Product Modal ── */
function CreateModal({
  categories,
  onClose,
  onCreated,
}: {
  categories: Category[]
  onClose: () => void
  onCreated: () => Promise<void>
}) {
  const [form, setForm] = useState({
    name: "", price: "", stock: "0",
    category_id: categories[0]?.id || "",
    image_url: "", description: "",
  })
  const [creating, setCreating] = useState(false)

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      await productsApi.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image_url: form.image_url,
        category_id: form.category_id,
        stock: Number(form.stock || 0),
      })
      toast.success("Product added successfully")
      await onCreated()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || "Failed to add product")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-[#1a1a1a] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-display font-bold text-lg text-white tracking-widest uppercase">
            ADD NEW PRODUCT
          </h3>
          <button
            onClick={onClose}
            className="text-[#9a9898] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 flex flex-col gap-4 overflow-y-auto">
            {[
              { label: "Product Name", key: "name", type: "text", placeholder: "e.g. ORON Chronos X1" },
              { label: "Image URL",    key: "image_url", type: "text", placeholder: "https://..." },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => set(key as keyof typeof form)(e.target.value)}
                  required={key === "name"}
                  className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] placeholder:text-[#353534] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] focus:shadow-[0_0_10px_rgba(255,107,0,0.2)] transition-all"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Price (NGN)", key: "price", type: "number" },
                { label: "Stock",       key: "stock", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    min="0"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => set(key as keyof typeof form)(e.target.value)}
                    required={key === "price"}
                    className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) => set("category_id")(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] placeholder:text-[#353534] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#353534] text-[#9a9898] font-bold text-[10px] tracking-[0.2em] uppercase px-6 py-3 rounded hover:bg-white/5 hover:text-[#e5e2e1] transition-all"
            >
              CANCEL
            </button>
            <OrangeButton type="submit" disabled={creating} className="flex-1 justify-center">
              {creating ? "ADDING..." : "ADD PRODUCT"}
            </OrangeButton>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Stock indicator ── */
function StockCell({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="font-bold text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded tracking-wider">
        OUT
      </span>
    )
  if (stock <= 5)
    return <span className="font-bold text-[#ff6b00] animate-pulse">{stock}</span>
  if (stock <= 20)
    return <span className="font-bold text-amber-400">{stock}</span>
  return <span className="font-bold text-[#c6c6c6]">{stock}</span>
}

/* ── Main Page ── */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [showModal, setShowModal] = useState(false)

  const categoryPills = useMemo(() => ["ALL", ...categories.map((c) => c.name)], [categories])

  const filtered = useMemo(() =>
    products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategory === "ALL" || p.category?.name === activeCategory
      return matchSearch && matchCat
    }),
  [products, search, activeCategory])

  const load = async () => {
    const [prods, cats] = await Promise.all([
      productsApi.getProducts(),
      categoriesApi.getCategories(),
    ])
    setProducts(prods)
    setCategories(cats)
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
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#ff6b00] text-white font-bold text-[10px] tracking-[0.2em] uppercase px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:shadow-[0_0_25px_rgba(255,107,0,0.6)] transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" /> ADD PRODUCT
            </button>
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

      {showModal && (
        <CreateModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onCreated={load}
        />
      )}
    </>
  )
}
