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
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"

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
              ? "fill-[#ff6b00] text-[#ff6b00]"
              : "fill-transparent text-[#9a9898]"
          )}
        />
      ))}
    </div>
  )
}

/* ── Status badge ── */
function ReviewStatus({ approved }: { approved: boolean | null }) {
  if (approved === true)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        LIVE
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
      PENDING
    </span>
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
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load reviews")
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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleApproval = async (id: string, approve: boolean) => {
    try {
      await reviewsApi.setApproval(id, approve)
      toast.success(approve ? "Review approved" : "Review revoked")
      await load()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update review")
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
        <div className="relative w-full sm:w-72 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9898]" />
          <input
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] pl-10 pr-4 py-2.5 rounded text-sm placeholder:text-[#353534] focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Table panel */}
      <GlassCard className="overflow-hidden flex flex-col relative">
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {loading ? (
          <SkeletonRows count={6} height="h-20" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No reviews found"
            message="Try adjusting your search query."
            action={
              <OrangeButton onClick={() => setSearch("")}>CLEAR FILTER</OrangeButton>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0a0a0a]/50">
                    {[
                      "Customer",
                      "Product ID",
                      "Rating",
                      "Review",
                      "Status",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "py-4 px-6 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal",
                          i === 5 && "text-right"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {paginated.map((r) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "hover:bg-white/[0.02] transition-colors group",
                        r.is_approved === false && "opacity-90"
                      )}
                    >
                      {/* Customer */}
                      <td className="py-4 px-6 align-top">
                        <p className="font-semibold text-sm text-[#e5e2e1]">
                          {r.user?.full_name || "Unknown"}
                        </p>
                        <p className="text-[#9a9898] text-xs mt-0.5">
                          {r.user?.email || r.user_id}
                        </p>
                      </td>

                      {/* Product ID */}
                      <td className="py-4 px-6 align-top">
                        <span className="font-mono text-xs text-[#e2bfb0] bg-[#0a0a0a] px-2 py-1 rounded border border-[#1a1a1a]">
                          {r.product_id.slice(0, 10).toUpperCase()}
                        </span>
                      </td>

                      {/* Star rating */}
                      <td className="py-4 px-6 align-top">
                        <StarRating rating={r.rating} />
                      </td>

                      {/* Review Data */}
                      <td className="py-4 px-6 align-top w-1/3">
                        {r.title && (
                          <p className="font-bold text-sm text-white mb-1">{r.title}</p>
                        )}
                        {r.comment && (
                          <p className="text-[#9a9898] text-sm line-clamp-2">{r.comment}</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 align-top">
                        <ReviewStatus approved={r.is_approved} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 align-top text-right">
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
                            className="bg-[#ff6b00] text-black hover:bg-[#ffb693] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all shadow-[0_0_10px_rgba(255,107,0,0.2)] hover:shadow-[0_0_15px_rgba(255,107,0,0.5)]"
                          >
                            APPROVE
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="mt-auto border-t border-white/5 bg-[#0a0a0a]/80 px-6 py-4 flex justify-between items-center">
              <span className="font-mono text-xs text-[#9a9898]">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} Reviews
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded bg-[#111111] border border-[#1a1a1a] text-[#9a9898] hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded bg-[#111111] border border-[#1a1a1a] text-[#9a9898] hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}
