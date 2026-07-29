"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Star } from "lucide-react"
import { reviewsApi } from "@/services/reviews"
import type { Review } from "@/types/api"
import {
  AdminPageHeader,
  GlassCard,
  SkeletonRows,
  EmptyState,
  OrangeButton,
  DarkInput,
  AdminTable,
  AdminTr,
  AdminTd,
  StatusBadge,
  AdminPagination,
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/get-error-message"

/* ── Star rating renderer ── */
function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground"
          )}
        />
      ))}
    </div>
  )
}

const PAGE_SIZE = 12

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)

  const load = async () => {
    const data = await reviewsApi.getAllReviews()
    setReviews(data)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load reviews"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() =>
    reviews.filter((r) => {
      const hay = `${r.title || ""} ${r.comment || ""} ${r.user?.full_name || ""} ${r.user?.email || ""} ${r.product_id}`.toLowerCase()
      return hay.includes(search.toLowerCase())
    }),
  [reviews, search])

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleApproval = async (id: string, approve: boolean) => {
    try {
      await reviewsApi.setApproval(id, approve)
      toast.success(approve ? "Review approved" : "Review revoked")
      await load()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update review"))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + search row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <AdminPageHeader
          title="REVIEWS"
          sub="/ ALL REVIEWS"
        />
        <DarkInput
          placeholder="Search reviews..."
          value={search}
          onChange={(v) => { setSearch(v); setPage(0) }}
          icon={<Search className="h-4 w-4" />}
          className="w-full sm:w-72 flex-shrink-0"
        />
      </div>

      {/* Table panel */}
      <GlassCard className="overflow-hidden flex flex-col relative">
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {loading ? (
          <SkeletonRows count={6} height="h-20" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Star className="h-8 w-8" />}
            title="No reviews found"
            message="Try adjusting your search query."
            action={
              <OrangeButton onClick={() => setSearch("")}>CLEAR FILTER</OrangeButton>
            }
          />
        ) : (
          <>
            <AdminTable headers={["Customer", "Product ID", "Rating", "Review", "Status", "Actions"]}>
              {paginated.map((r) => (
                <AdminTr key={r.id} className={cn(r.is_approved === false && "opacity-90")}>
                  {/* Customer */}
                  <AdminTd className="align-top">
                    <p className="font-semibold text-sm text-foreground">
                      {r.user?.full_name || "Unknown"}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {r.user?.email || r.user_id}
                    </p>
                  </AdminTd>

                  {/* Product ID */}
                  <AdminTd className="align-top">
                    <span className="font-mono text-xs text-[#e2bfb0] bg-[#0a0a0a] px-2 py-1 rounded border border-[#1a1a1a]">
                      {r.product_id.slice(0, 10).toUpperCase()}
                    </span>
                  </AdminTd>

                  {/* Star rating */}
                  <AdminTd className="align-top">
                    <StarRating rating={r.rating} />
                  </AdminTd>

                  {/* Review Data */}
                  <AdminTd className="align-top w-1/3">
                    {r.title && (
                      <p className="font-bold text-sm text-white mb-1">{r.title}</p>
                    )}
                    {r.comment && (
                      <p className="text-muted-foreground text-sm line-clamp-2">{r.comment}</p>
                    )}
                  </AdminTd>

                  {/* Status */}
                  <AdminTd className="align-top">
                    <StatusBadge status={r.is_approved ? "live" : "pending"} />
                  </AdminTd>

                  {/* Actions */}
                  <AdminTd className="align-top text-right">
                    {r.is_approved ? (
                      <button
                        onClick={() => handleApproval(r.id, false)}
                        className="border border-[#5a4136] text-[#e2bfb0] hover:text-red-400 hover:border-red-500 hover:bg-red-500/10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all"
                      >
                        REVOKE
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproval(r.id, true)}
                        className="bg-primary text-black hover:bg-[#ffb693] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all shadow-[0_0_10px_rgba(255,107,0,0.2)] hover:shadow-[0_0_15px_rgba(255,107,0,0.5)]"
                      >
                        APPROVE
                      </button>
                    )}
                  </AdminTd>
                </AdminTr>
              ))}
            </AdminTable>

            <AdminPagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={filtered.length}
              onPageChange={setPage}
              itemLabel="Reviews"
            />
          </>
        )}
      </GlassCard>
    </div>
  )
}
