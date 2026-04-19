"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { disputesApi } from "@/services/disputes"
import { adminApi } from "@/services/admin"
import type { Dispute, User } from "@/types/api"

const STATUSES = ["open", "under_review", "resolved", "rejected"]

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const userById = useMemo(() => {
    const map = new Map<string, User>()
    for (const u of users) map.set(u.id, u)
    return map
  }, [users])

  const load = async () => {
    const [d, u] = await Promise.all([
      disputesApi.getAllDisputes(),
      adminApi.getUsers(),
    ])
    setDisputes(d)
    setUsers(u)
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
      const user = userById.get(d.user_id)
      const hay = `${d.id} ${d.order_id} ${d.reason} ${user?.email || ""} ${user?.full_name || ""}`.toLowerCase()
      return hay.includes(search.toLowerCase())
    })
  }, [disputes, userById, search])

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
                    const user = userById.get(d.user_id)
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Dispute - {d.id}</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Reason</p>
                                  <p className="font-medium">{d.reason}</p>
                                </div>
                                {d.description && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="text-sm">{d.description}</p>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select
                                    value={d.status}
                                    onValueChange={async (value) => {
                                      try {
                                        await disputesApi.updateDispute(d.id, { status: value })
                                        toast.success("Updated")
                                        await load()
                                      } catch (error: any) {
                                        toast.error(error?.message || "Failed to update")
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUSES.map((s) => (
                                        <SelectItem key={s} value={s}>
                                          {s}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Resolution note</Label>
                                  <Textarea
                                    defaultValue={d.resolution_note || ""}
                                    placeholder="Optional note shown to user"
                                    onBlur={async (e) => {
                                      const value = e.target.value
                                      try {
                                        await disputesApi.updateDispute(d.id, { resolution_note: value })
                                        await load()
                                      } catch (error: any) {
                                        toast.error(error?.message || "Failed to update")
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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

