"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Download, SlidersHorizontal } from "lucide-react"
import { adminApi } from "@/services/admin"
import type { Order, User } from "@/types/api"
import { formatNGN, formatDate, buildUserMap, isPaidStatus } from "@/lib/admin-utils"
import {
  AdminPageHeader,
  GlassCard,
  SkeletonRows,
  DarkInput,
  EmptyState,
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"

/* ── Operative status badge ── */
function OperativeStatus({ verified, orderCount }: { verified?: boolean; orderCount: number }) {
  if (!verified)
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#3a3939]/50 border border-[#3a3939] text-[#9a9898] text-[10px] font-bold tracking-[0.15em] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9a9898]" />
        Unverified
      </span>
    )
  if (orderCount > 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#3a3939]/50 border border-[#3a3939] text-[#e5e2e1] text-[10px] font-bold tracking-[0.15em] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
        Active
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#3a3939]/50 border border-[#3a3939] text-[#9a9898] text-[10px] font-bold tracking-[0.15em] uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] shadow-[0_0_5px_rgba(255,107,0,0.8)]" />
      Idle
    </span>
  )
}

/* ── Avatar circle ── */
function OperativeAvatar({ name, hasOrders }: { name: string; hasOrders: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 border",
        hasOrders
          ? "border-[#ff6b00] shadow-[0_0_10px_rgba(255,107,0,0.2)]"
          : "border-[#3a3939]"
      )}
    >
      <span
        className={cn(
          "text-sm font-bold",
          hasOrders ? "text-[#ff6b00]" : "text-[#9a9898]"
        )}
      >
        {initials}
      </span>
    </div>
  )
}

const PAGE_SIZE = 15

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const [usersRes, ordersRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getAllOrders(),
        ])
        if (cancelled) return
        setUsers(usersRes)
        setOrders(ordersRes)
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load customers")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  /* Build per-user stats */
  const stats = useMemo(() => {
    const map = new Map<string, { count: number; spent: number }>()
    for (const o of orders) {
      const cur = map.get(o.user_id) || { count: 0, spent: 0 }
      cur.count += 1
      if (isPaidStatus(o.status || "")) cur.spent += o.total_amount
      map.set(o.user_id, cur)
    }
    return map
  }, [orders])

  /* Filter to non-admin users, search */
  const filtered = useMemo(() =>
    users
      .filter((u) => !u.is_admin)
      .filter((u) => {
        const hay = `${u.full_name} ${u.email} ${u.id}`.toLowerCase()
        return hay.includes(search.toLowerCase())
      }),
  [users, search])

  /* Paginate */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  /* Reset page on search */
  const handleSearch = (v: string) => { setSearch(v); setPage(0) }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="USER REGISTRY" sub="/ ALL OPERATORS" />

      {/* Search & actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9898]" />
          <input
            placeholder="Search operatives by ID, name, or node..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-14 py-3 bg-[#0a0a0a] border border-[#1a1a1a] text-white placeholder:text-[#9a9898] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ff6b00] focus:border-[#ff6b00] transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9a9898] font-mono border border-[#1a1a1a] px-1 rounded bg-[#111111]">
            ⌘K
          </span>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-[#c6c6c6] rounded hover:border-[#ff6b00] transition-colors text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-[#c6c6c6] rounded hover:border-[#ff6b00] transition-colors text-sm font-semibold">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Table panel */}
      <GlassCard className="overflow-hidden flex flex-col">
        {loading ? (
          <SkeletonRows count={8} height="h-16" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No operatives found"
            message="Try adjusting your search query."
            action={
              <button
                onClick={() => handleSearch("")}
                className="bg-[#ff6b00] text-white font-bold text-[10px] tracking-[0.2em] uppercase px-6 py-3 rounded-lg transition-all hover:bg-[#ff8533]"
              >
                CLEAR SEARCH
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]/50">
                    {["Operative", "Status", "Orders", "Value (NGN)", "Join Node"].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "px-6 py-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal",
                          i >= 2 && "text-right"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {paginated.map((u) => {
                    const s = stats.get(u.id) || { count: 0, spent: 0 }
                    const hasOrders = s.count > 0
                    return (
                      <tr
                        key={u.id}
                        className="border-l-4 border-transparent hover:border-l-[#ff6b00] hover:bg-[#1a1a1a]/40 transition-all cursor-pointer group"
                      >
                        {/* Operative */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <OperativeAvatar name={u.full_name || u.email} hasOrders={hasOrders} />
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm group-hover:text-[#ff6b00] transition-colors truncate">
                                {u.full_name || "—"}
                              </p>
                              <p className="text-[#9a9898] text-xs font-mono mt-0.5 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <OperativeStatus verified={u.is_verified} orderCount={s.count} />
                        </td>

                        {/* Orders count */}
                        <td className="px-6 py-4 text-right font-mono text-[#c6c6c6] text-sm">
                          {s.count.toLocaleString()}
                        </td>

                        {/* Value */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-display font-bold text-base text-white">
                            {s.spent > 0 ? formatNGN(s.spent) : "—"}
                          </span>
                        </td>

                        {/* Join date */}
                        <td className="px-6 py-4 text-right text-[#9a9898] font-mono text-xs">
                          {u.created_at
                            ? new Date(u.created_at).toISOString().slice(0, 10).replace(/-/g, ".")
                            : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]/30">
              <span className="text-[#9a9898] font-mono text-xs">
                Showing {paginated.length} of {filtered.length} Operatives
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border border-[#1a1a1a] rounded bg-[#111111] text-[#9a9898] hover:border-[#ff6b00] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border border-[#1a1a1a] rounded bg-[#111111] text-[#9a9898] hover:border-[#ff6b00] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}
