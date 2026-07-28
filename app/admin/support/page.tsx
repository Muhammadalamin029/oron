"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Headphones } from "lucide-react"
import { supportApi } from "@/services/support"
import type { SupportTicket } from "@/types/api"
import { TicketModal } from "./components/TicketModal"
import {
  AdminPageHeader,
  GlassCard,
  StatusBadge,
  SkeletonRows,
  DarkInput,
  AdminTable,
  AdminTr,
  AdminTd,
  EmptyState,
} from "@/components/admin-ui"
import { getErrorMessage } from "@/lib/get-error-message"

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = async () => {
    const data = await supportApi.allTickets()
    setTickets(data)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load tickets"))
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
    return tickets.filter((t) => {
      const hay = `${t.id} ${t.subject} ${t.email || ""} ${t.status}`.toLowerCase()
      return hay.includes(search.toLowerCase())
    })
  }, [tickets, search])

  return (
    <div className="space-y-6">
      <AdminPageHeader title="SUPPORT" sub="/ CUSTOMER TICKETS" />

      <DarkInput
        placeholder="Search tickets, emails..."
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
            icon={<Headphones className="h-8 w-8" />}
            title="No support tickets"
            message="Tickets opened by customers will show up here."
          />
        ) : (
          <AdminTable headers={["Ticket", "Email", "Status", "Created", "Action"]}>
            {filtered.map((t) => (
              <AdminTr key={t.id}>
                <AdminTd className="font-medium text-white">{t.subject}</AdminTd>
                <AdminTd>{t.email || "—"}</AdminTd>
                <AdminTd>
                  <StatusBadge status={t.status} />
                </AdminTd>
                <AdminTd>
                  {t.created_at ? new Date(t.created_at).toLocaleDateString("en-NG") : "—"}
                </AdminTd>
                <AdminTd className="text-right">
                  <TicketModal ticketId={t.id} subject={t.subject} onUpdated={load} />
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTable>
        )}
      </GlassCard>
    </div>
  )
}
