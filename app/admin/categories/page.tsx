"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Plus, Pencil, Trash2, CheckSquare, FolderX } from "lucide-react"
import { categoriesApi } from "@/services/categories"
import type { Category } from "@/types/api"
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
  StatusBadge,
  AdminModal,
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/get-error-message"

/* ── Create / Edit Modal ── */
function CategoryModal({
  open,
  initial,
  onClose,
  onCommit,
}: {
  open: boolean
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
    <AdminModal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3 uppercase tracking-wider">
          <CheckSquare className="h-5 w-5 text-primary" />
          {isEdit ? "EDIT CATEGORY" : "ADD CATEGORY"}
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto">
        <div className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name..."
              required
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-foreground font-mono text-sm placeholder:text-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the category description..."
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-foreground text-sm placeholder:text-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Visibility toggle */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Status
            </label>
            <div className="flex items-center gap-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3">
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                  visible ? "bg-primary" : "bg-[#1a1a1a] border border-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                    visible && "translate-x-5"
                  )}
                />
              </button>
              <span className={cn("font-mono text-sm font-bold", visible ? "text-foreground" : "text-border")}>
                {visible ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1a1a1a] flex justify-end gap-4 bg-[#0a0a0a]/50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-[#1a1a1a] text-muted-foreground text-[10px] font-bold tracking-widest uppercase hover:bg-[#1a1a1a] transition-colors"
          >
            CANCEL
          </button>
          <OrangeButton type="submit" disabled={saving} pill className="px-8">
            {saving ? "SAVING..." : "SAVE"}
          </OrangeButton>
        </div>
      </form>
    </AdminModal>
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
    <div className="space-y-6">
      <AdminPageHeader
        title="CATEGORY MANAGEMENT"
        sub="/ CATEGORIES"
        action={
          <OrangeButton pill onClick={() => { setEditing(null); setModalOpen(true) }}>
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> NEW CATEGORY
            </span>
          </OrangeButton>
        }
      />

      {/* Main panel */}
      <GlassCard className="overflow-hidden flex flex-col">
        {/* Search bar */}
        <div className="p-4 border-b border-[#1a1a1a] bg-card/50">
          <DarkInput
            placeholder="SEARCH CATEGORIES..."
            value={search}
            onChange={setSearch}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Body */}
        {loading ? (
          <SkeletonRows count={5} height="h-14" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderX className="h-8 w-8" />}
            title="No categories found"
            message="Try a different query or create a new one."
            action={
              <OrangeButton onClick={() => { setEditing(null); setModalOpen(true) }}>
                NEW CATEGORY
              </OrangeButton>
            }
          />
        ) : (
          <AdminTable
            headers={["Category Name", "Description", { label: "Active Products", align: "right" }, { label: "Visibility", align: "center" }, "Actions"]}
          >
            {filtered.map((cat) => {
              const count = cat.product_count || 0
              const isLive = count > 0
              return (
                <AdminTr key={cat.id} className="border-l-2 border-l-transparent hover:border-l-primary cursor-pointer">
                  {/* Name */}
                  <AdminTd className={cn("font-bold text-base", isLive ? "text-foreground" : "text-muted-foreground")}>
                    {cat.name}
                  </AdminTd>

                  {/* Description */}
                  <AdminTd className="truncate max-w-xs">
                    {cat.description || <span className="opacity-40 italic">No description</span>}
                  </AdminTd>

                  {/* Product count */}
                  <AdminTd className={cn("text-right font-mono text-base font-bold", isLive ? "text-foreground" : "text-muted-foreground")}>
                    {count.toLocaleString()}
                  </AdminTd>

                  {/* Visibility */}
                  <AdminTd className="text-center">
                    <StatusBadge status={isLive ? "active" : "inactive"} />
                  </AdminTd>

                  {/* Actions */}
                  <AdminTd className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => { setEditing(cat); setModalOpen(true) }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </AdminTd>
                </AdminTr>
              )
            })}
          </AdminTable>
        )}
      </GlassCard>

      <CategoryModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onCommit={load}
      />
    </div>
  )
}
