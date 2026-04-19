"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { disputesApi } from "@/services/disputes"
import { ordersApi } from "@/services/orders"
import { useAuth } from "@/contexts/auth-context"
import type { Dispute, Order } from "@/types/api"

const REASONS = [
  "Item not received",
  "Wrong item delivered",
  "Damaged item",
  "Refund request",
  "Other",
]

export default function DisputesPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    order_id: "",
    reason: REASONS[0],
    description: "",
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent("/disputes")}`)
    }
  }, [loading, isAuthenticated, router])

  const load = async () => {
    const [d, o] = await Promise.all([
      disputesApi.getMyDisputes(),
      ordersApi.getMyOrders(),
    ])
    setDisputes(d)
    setOrders(o)
    if (!form.order_id && o[0]?.id) setForm((p) => ({ ...p, order_id: o[0].id }))
  }

  useEffect(() => {
    let cancelled = false
    if (!isAuthenticated) return
    ;(async () => {
      try {
        setFetching(true)
        await load()
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load disputes")
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const orderById = useMemo(() => {
    const map = new Map<string, Order>()
    for (const o of orders) map.set(o.id, o)
    return map
  }, [orders])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-foreground">Disputes</h1>
            <p className="text-muted-foreground mt-1">
              Open and track disputes for your orders.
            </p>
          </div>
          <Link href="/orders">
            <Button variant="outline">My Orders</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Open Dispute</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    setCreating(true)
                    await disputesApi.createDispute({
                      order_id: form.order_id,
                      reason: form.reason,
                      description: form.description,
                    })
                    toast.success("Dispute created")
                    setForm((p) => ({ ...p, description: "" }))
                    await load()
                  } catch (error: any) {
                    toast.error(error?.message || "Failed to create dispute")
                  } finally {
                    setCreating(false)
                  }
                }}
              >
                <div className="space-y-2">
                  <Label>Order</Label>
                  <Select
                    value={form.order_id}
                    onValueChange={(v) => setForm((p) => ({ ...p, order_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Select
                    value={form.reason}
                    onValueChange={(v) => setForm((p) => ({ ...p, reason: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Add details (optional)"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={creating || !form.order_id}
                >
                  {creating ? "Creating..." : "Create Dispute"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              {fetching ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 rounded-md bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : disputes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No disputes yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {disputes.map((d) => {
                    const order = orderById.get(d.order_id)
                    return (
                      <div
                        key={d.id}
                        className="rounded-md border border-border p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {d.reason}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Order: {d.order_id} • Status: {d.status}
                            </p>
                            {order?.created_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Order date:{" "}
                                {new Date(order.created_at).toLocaleDateString(
                                  "en-NG"
                                )}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {d.created_at
                              ? new Date(d.created_at).toLocaleDateString("en-NG")
                              : ""}
                          </p>
                        </div>
                        {d.description && (
                          <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">
                            {d.description}
                          </p>
                        )}
                        {d.resolution_note && (
                          <p className="text-sm text-muted-foreground mt-3">
                            Resolution: {d.resolution_note}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

