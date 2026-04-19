"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { supportApi } from "@/services/support"
import type { SupportTicket } from "@/types/api"

const STATUSES = ["open", "answered", "closed"]

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null)

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
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load tickets")
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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Support</h1>
        <p className="text-muted-foreground">Handle customer support tickets</p>
      </div>

      <Card>
        <CardHeader>
          <div className="max-w-md">
            <Input
              placeholder="Search tickets..."
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
                    <TableHead>Ticket</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.subject}</TableCell>
                      <TableCell>{t.email || "—"}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>
                        {t.created_at ? new Date(t.created_at).toLocaleDateString("en-NG") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          onOpenChange={(open) => {
                            if (!open) {
                              setReply("")
                              setActiveTicket(null)
                            } else {
                              supportApi
                                .getTicket(t.id)
                                .then(setActiveTicket)
                                .catch(() => setActiveTicket(null))
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Ticket - {t.id}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Email</p>
                                  <p className="font-medium">{t.email || "—"}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Status</Label>
                                  <Select
                                    value={t.status}
                                    onValueChange={async (value) => {
                                      try {
                                        await supportApi.updateTicket(t.id, { status: value })
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
                              </div>

                              <div className="space-y-3">
                                {!(activeTicket?.messages || []).length ? (
                                  <p className="text-sm text-muted-foreground">
                                    Loading messages...
                                  </p>
                                ) : (
                                  (activeTicket?.messages || []).map((m) => (
                                    <div
                                      key={m.id}
                                      className={`rounded-md border border-border p-4 ${
                                        m.sender === "admin" ? "bg-muted/20" : ""
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm font-medium">
                                          {m.sender === "admin" ? "Admin" : "Customer"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {m.created_at ? new Date(m.created_at).toLocaleString("en-NG") : ""}
                                        </p>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                                        {m.message}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>

                              <form
                                className="space-y-2"
                                onSubmit={async (e) => {
                                  e.preventDefault()
                                  if (!reply.trim()) return
                                  try {
                                    setSending(true)
                                    await supportApi.addMessage(t.id, reply.trim())
                                    setReply("")
                                    toast.success("Reply sent")
                                    const fresh = await supportApi.getTicket(t.id)
                                    setActiveTicket(fresh)
                                    await load()
                                  } catch (error: any) {
                                    toast.error(error?.message || "Failed to send")
                                  } finally {
                                    setSending(false)
                                  }
                                }}
                              >
                                <Label htmlFor="reply">Reply</Label>
                                <Textarea
                                  id="reply"
                                  value={reply}
                                  onChange={(e) => setReply(e.target.value)}
                                  placeholder="Write a reply..."
                                  disabled={sending}
                                />
                                <Button
                                  type="submit"
                                  className="bg-primary text-primary-foreground"
                                  disabled={sending || !reply.trim()}
                                >
                                  {sending ? "Sending..." : "Send Reply"}
                                </Button>
                              </form>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
