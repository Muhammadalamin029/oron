"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Scale } from "lucide-react"
import { adminApi } from "@/services/admin"
import type { Dispute, User, Order } from "@/types/api"
import { DisputeModal } from "./components/DisputeModal"
import {
  AdminPageHeader,
  GlassCard,
  StatusBadge,
  SkeletonRows,
  DarkInput,
  CustomerCell,
  AdminTable,
  AdminTr,
  AdminTd,
  EmptyState,
} from "@/components/admin-ui"

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<(Dispute & { user?: User; order?: Order })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = async () => {
    const d = await adminApi.getDisputesWithDetails()
    setDisputes(d)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load disputes")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const user = d.user
      const hay = `${d.id} ${d.order_id} ${d.reason} ${user?.email || ""} ${user?.full_name || ""}`.toLowerCase()
      return hay.includes(search.toLowerCase())
    })
  }, [disputes, search])

  return (
    <div className="space-y-6">
      <AdminPageHeader title="DISPUTES" sub="/ REVIEW & RESOLVE" />

      <DarkInput
        placeholder="Search disputes, customers, orders..."
        value={search}
        onChange={setSearch}
        icon={<Search className="h-4 w-4" />}
        className="w-full md:w-96"
      />

      <GlassCard className="overflow-hidden">
        {loading ? (
          <SkeletonRows count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Scale className="h-8 w-8" />}
            title="No disputes found"
            message="Disputes filed by customers on their orders will show up here."
          />
        ) : (
          <AdminTable headers={["Dispute", "Order", "Customer", "Status", "Action"]}>
            {filtered.map((d) => {
              const user = d.user
              return (
                <AdminTr key={d.id}>
                  <AdminTd className="font-medium text-white">{d.reason}</AdminTd>
                  <AdminTd mono>#{d.order_id.slice(0, 10).toUpperCase()}</AdminTd>
                  <AdminTd>
                    <CustomerCell name={user?.full_name || "Customer"} email={user?.email || d.user_id} />
                  </AdminTd>
                  <AdminTd>
                    <StatusBadge status={d.status} />
                  </AdminTd>
                  <AdminTd className="text-right">
                    <DisputeModal dispute={d} onUpdated={load} />
                  </AdminTd>
                </AdminTr>
              )
            })}
          </AdminTable>
        )}
      </GlassCard>
    </div>
  )
}
