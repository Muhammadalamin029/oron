"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { adminApi } from "@/services/admin"
import type { Dispute, User, Order } from "@/types/api"
import { DisputeModal } from "./components/DisputeModal"

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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Disputes</h1>
        <p className="text-muted-foreground">Review and resolve disputes</p>
      </div>

      <Card>
        <CardHeader>
          <div className="max-w-md">
            <Input
              placeholder="Search disputes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispute</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => {
                    const user = d.user
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.reason}</TableCell>
                        <TableCell>{d.order_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user?.full_name || "—"}</p>
                            <p className="text-sm text-muted-foreground">{user?.email || d.user_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>{d.status}</TableCell>
                        <TableCell className="text-right">
                          <DisputeModal dispute={d} onUpdated={load} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

