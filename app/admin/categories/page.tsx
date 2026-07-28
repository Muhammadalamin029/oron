"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Plus, Pencil, Trash2, X, CheckSquare } from "lucide-react"
import { categoriesApi } from "@/services/categories"
import type { Category } from "@/types/api"
import {
  AdminPageHeader,
  GlassCard,
  SkeletonRows,
  OrangeButton,
  EmptyState,
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/get-error-message"

/* ── Create / Edit Modal ── */
function CategoryModal({
  initial,
  onClose,
  onCommit,
}: {
  initial?: Category | null
  onClose: () => void
  onCommit: () => Promise<void>
}) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [visible, setVisible] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error("Name is required")
    try {
      setSaving(true)
      if (isEdit && initial) {
        await categoriesApi.update(initial.id, { name: name.trim(), description })
        toast.success("Category updated")
      } else {
        await categoriesApi.create({ name: name.trim(), description })
        toast.success("Category added")
      }
      await onCommit()
      onClose()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save category"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111111]/70 backdrop-blur-xl border border-t border-[#ff6b00]/30 border-[#1a1a1a] rounded-xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#1a1a1a]">
          <h2 className="font-display font-bold text-xl text-white uppercase tracking-wider flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-[#ff6b00]" />
            {isEdit ? "EDIT CATEGORY" : "ADD CATEGORY"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9a9898] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name..."
                required
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-[#e5e2e1] font-mono text-sm placeholder:text-[#353534] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the category description..."
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-[#e5e2e1] text-sm placeholder:text-[#353534] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all resize-none"
              />
            </div>

            {/* Visibility toggle */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">
                Status
              </label>
              <div className="flex items-center gap-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3">
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                    visible ? "bg-[#ff6b00]" : "bg-[#1a1a1a] border border-[#353534]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                      visible && "translate-x-5"
                    )}
                  />
                </button>
                <span className={cn("font-mono text-sm font-bold", visible ? "text-[#e5e2e1]" : "text-[#353534]")}>
                  {visible ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-4 bg-[#0a0a0a]/50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full border border-[#1a1a1a] text-[#9a9898] text-[10px] font-bold tracking-widest uppercase hover:bg-[#1a1a1a] transition-colors"
            >
              CANCEL
            </button>
            <OrangeButton type="submit" disabled={saving} className="rounded-full px-8">
              {saving ? "SAVING..." : "SAVE"}
            </OrangeButton>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(Category & { product_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const filtered = useMemo(() =>
    categories.filter((c) =>
      `${c.name} ${c.description || ""}`.toLowerCase().includes(search.toLowerCase())
    ),
  [categories, search])

  const load = async () => {
    const cats = await categoriesApi.getCategoriesWithStats()
    setCategories(cats)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load categories"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await categoriesApi.delete(id)
      toast.success("Category removed")
      await load()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete category"))
    }
  }

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title="CATEGORY MANAGEMENT"
          sub="/ CATEGORIES"
          action={
            <button
              onClick={() => { setEditing(null); setModalOpen(true) }}
              className="bg-[#ff6b00] text-white font-bold text-[10px] tracking-[0.2em] uppercase px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:shadow-[0_0_25px_rgba(255,107,0,0.6)] transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" /> NEW CATEGORY
            </button>
          }
        />

        {/* Main panel */}
        <GlassCard className="overflow-hidden flex flex-col">
          {/* Search bar */}
          <div className="p-4 border-b border-[#1a1a1a] flex flex-col sm:flex-row gap-4 bg-[#111111]/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9898]" />
              <input
                placeholder="SEARCH CATEGORIES..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg pl-10 pr-4 py-2 text-[#e5e2e1] font-mono text-sm placeholder:text-[#353534]/50 focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all"
              />
            </div>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a1a1a] bg-[#151515] text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase">
            <div className="col-span-3">Category Name</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-right">Active Products</div>
            <div className="col-span-2 text-center">Visibility</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Body */}
          {loading ? (
            <SkeletonRows count={5} height="h-14" />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No categories found"
              message="Try a different query or create a new one."
              action={
                <OrangeButton onClick={() => { setEditing(null); setModalOpen(true) }}>
                  NEW CATEGORY
                </OrangeButton>
              }
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              {filtered.map((cat) => {
                const count = cat.product_count || 0
                const isLive = count > 0
                return (
                  <div
                    key={cat.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#1a1a1a] items-center hover:border-l-[#ff6b00] border-l-2 border-l-transparent hover:bg-[#1a1a1a]/50 transition-all group cursor-pointer"
                  >
                    {/* Name */}
                    <div className={cn("col-span-12 sm:col-span-3 font-bold text-lg truncate", isLive ? "text-[#e5e2e1]" : "text-[#9a9898]")}>
                      {cat.name}
                    </div>

                    {/* Description */}
                    <div className="hidden sm:block col-span-4 text-[#9a9898] text-sm truncate">
                      {cat.description || <span className="opacity-40 italic">No description</span>}
                    </div>

                    {/* Product count */}
                    <div className={cn("hidden sm:block col-span-2 text-right font-mono text-base font-bold", isLive ? "text-[#e5e2e1]" : "text-[#9a9898]")}>
                      {count.toLocaleString()}
                    </div>

                    {/* Visibility */}
                    <div className="hidden sm:flex col-span-2 justify-center items-center gap-2 font-mono text-sm">
                      {isLive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          <span className="text-emerald-500 font-bold text-[10px] tracking-widest">ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#353534]" />
                          <span className="text-[#353534] font-bold text-[10px] tracking-widest">INACTIVE</span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 sm:col-span-1 flex justify-end gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditing(cat); setModalOpen(true) }}
                        className="text-[#9a9898] hover:text-[#ff6b00] transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(cat.id, cat.name) }}
                        className="text-[#9a9898] hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {modalOpen && (
        <CategoryModal
          initial={editing}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onCommit={load}
        />
      )}
    </>
  )
}
