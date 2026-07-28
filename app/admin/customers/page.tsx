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
import { CustomerStatus } from "./components/CustomerStatus"
import { CustomerAvatar } from "./components/CustomerAvatar"
import { getErrorMessage } from "@/lib/get-error-message"

const PAGE_SIZE = 15

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<(User & { total_orders?: number; total_spent?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const usersRes = await adminApi.getUsersWithStats()
        if (cancelled) return
        setUsers(usersRes)
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load customers"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

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
      <AdminPageHeader title="CUSTOMERS" sub="/ ALL CUSTOMERS" />

      {/* Search & actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9898]" />
          <input
            placeholder="Search customers by ID, name, or email..."
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
            title="No customers found"
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
                    {["Customer", "Status", "Orders", "Value (NGN)", "Joined"].map((h, i) => (
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
                    const count = u.total_orders || 0
                    const spent = u.total_spent || 0
                    const hasOrders = count > 0
                    return (
                      <tr
                        key={u.id}
                        className="border-l-4 border-transparent hover:border-l-[#ff6b00] hover:bg-[#1a1a1a]/40 transition-all cursor-pointer group"
                      >
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <CustomerAvatar name={u.full_name || u.email} hasOrders={hasOrders} />
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
                          <CustomerStatus verified={u.is_verified} orderCount={count} />
                        </td>

                        {/* Orders count */}
                        <td className="px-6 py-4 text-right font-mono text-[#c6c6c6] text-sm">
                          {count.toLocaleString()}
                        </td>

                        {/* Value */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-display font-bold text-base text-white">
                            {spent > 0 ? formatNGN(spent) : "—"}
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
                Showing {paginated.length} of {filtered.length} Customers
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
