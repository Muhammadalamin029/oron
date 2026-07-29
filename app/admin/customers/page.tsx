"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Download, SlidersHorizontal, UserX } from "lucide-react"
import { adminApi } from "@/services/admin"
import type { Order, User } from "@/types/api"
import { formatNGN, formatDate, buildUserMap, isPaidStatus } from "@/lib/admin-utils"
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
  AdminPagination,
} from "@/components/admin-ui"
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
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  /* Reset page on search */
  const handleSearch = (v: string) => { setSearch(v); setPage(0) }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="CUSTOMERS" sub="/ ALL CUSTOMERS" />

      {/* Search & actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <DarkInput
            placeholder="Search customers by ID, name, or email..."
            value={search}
            onChange={handleSearch}
            icon={<Search className="h-4 w-4" />}
            className="pr-14"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono border border-[#1a1a1a] px-1 rounded bg-card">
            ⌘K
          </span>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-secondary-text rounded hover:border-primary transition-colors text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-secondary-text rounded hover:border-primary transition-colors text-sm font-semibold">
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
            icon={<UserX className="h-8 w-8" />}
            title="No customers found"
            message="Try adjusting your search query."
            action={
              <OrangeButton onClick={() => handleSearch("")}>
                CLEAR SEARCH
              </OrangeButton>
            }
          />
        ) : (
          <>
            <AdminTable
              headers={["Customer", "Status", { label: "Orders", align: "right" }, { label: "Value (NGN)", align: "right" }, { label: "Joined", align: "right" }]}
            >
              {paginated.map((u) => {
                const count = u.total_orders || 0
                const spent = u.total_spent || 0
                const hasOrders = count > 0
                return (
                  <AdminTr key={u.id} className="border-l-4 border-l-transparent hover:border-l-primary cursor-pointer">
                    {/* Customer */}
                    <AdminTd>
                      <div className="flex items-center gap-4">
                        <CustomerAvatar name={u.full_name || u.email} hasOrders={hasOrders} />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm group-hover:text-primary transition-colors truncate">
                            {u.full_name || "—"}
                          </p>
                          <p className="text-muted-foreground text-xs font-mono mt-0.5 truncate">{u.email}</p>
                        </div>
                      </div>
                    </AdminTd>

                    {/* Status */}
                    <AdminTd>
                      <CustomerStatus verified={u.is_verified} orderCount={count} />
                    </AdminTd>

                    {/* Orders count */}
                    <AdminTd className="text-right font-mono text-secondary-text">
                      {count.toLocaleString()}
                    </AdminTd>

                    {/* Value */}
                    <AdminTd className="text-right">
                      <span className="font-display font-bold text-base text-white">
                        {spent > 0 ? formatNGN(spent) : "—"}
                      </span>
                    </AdminTd>

                    {/* Join date */}
                    <AdminTd className="text-right text-muted-foreground font-mono text-xs">
                      {u.created_at
                        ? new Date(u.created_at).toISOString().slice(0, 10).replace(/-/g, ".")
                        : "—"}
                    </AdminTd>
                  </AdminTr>
                )
              })}
            </AdminTable>

            <AdminPagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={filtered.length}
              onPageChange={setPage}
              itemLabel="Customers"
            />
          </>
        )}
      </GlassCard>
    </div>
  )
}
