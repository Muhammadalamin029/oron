"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ordersApi } from "@/services/orders"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order } from "@/types/api"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteMain, PageHeading, SiteCard, SkeletonLine, EmptyState, StatusBadge, PrimaryButton } from "@/components/site-ui"

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent("/orders")}`)
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    let cancelled = false
    if (!isAuthenticated) return

    ;(async () => {
      try {
        setFetching(true)
        const data = await ordersApi.getMyOrders()
        if (!cancelled) setOrders(data)
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load orders"))
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SiteMain>
        <PageHeading
          sub="Track your purchases and payment status."
          action={
            <div className="flex items-center gap-2">
              <Link href="/disputes">
                <Button variant="outline">Disputes</Button>
              </Link>
              <Link href="/support">
                <Button variant="outline">Support</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Shop</Button>
              </Link>
            </div>
          }
        >
          My Orders
        </PageHeading>

        <SiteCard className="p-6">
          {fetching ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLine key={i} className="h-12" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              title="You don't have any orders yet."
              action={<PrimaryButton href="/products">Browse Collection</PrimaryButton>}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    const expanded = expandedOrderId === order.id
                    const itemCount = order.items?.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )
                    return (
                      <Fragment key={order.id}>
                        <TableRow>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString(
                                  "en-NG"
                                )
                              : "—"}
                          </TableCell>
                          <TableCell>{itemCount ?? 0}</TableCell>
                          <TableCell>
                            {formatPrice(order.total_amount)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setExpandedOrderId(
                                  expanded ? null : order.id
                                )
                              }
                            >
                              {expanded ? "Hide" : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expanded && (
                          <TableRow>
                            <TableCell colSpan={6}>
                              <div className="p-4 rounded-lg bg-muted/20">
                                <p className="font-medium text-foreground mb-3">
                                  Items
                                </p>
                                <div className="space-y-2">
                                  {order.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="text-foreground">
                                        {item.product?.name || "Product"} ×{" "}
                                        {item.quantity}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {formatPrice(item.price)} each
                                      </span>
                                    </div>
                                  ))}
                                </div>

                                {order.shipping_info && (
                                  <div className="mt-6">
                                    <p className="font-medium text-foreground mb-2">
                                      Shipping
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.shipping_info.first_name}{" "}
                                      {order.shipping_info.last_name} •{" "}
                                      {order.shipping_info.phone}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.shipping_info.address},{" "}
                                      {order.shipping_info.city}{" "}
                                      {order.shipping_info.state}
                                    </p>
                                  </div>
                                )}

                                {(order.shipments || []).length > 0 && (
                                  <div className="mt-6">
                                    <p className="font-medium text-foreground mb-2">
                                      Shipment
                                    </p>
                                    <div className="space-y-2 text-sm">
                                      {(order.shipments || []).map((s) => (
                                        <div
                                          key={s.id}
                                          className="flex items-center justify-between"
                                        >
                                          <span className="text-foreground">
                                            {s.carrier || "Carrier"} •{" "}
                                            {s.tracking_number || "Tracking"}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {s.status}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </SiteCard>
      </SiteMain>
      <Footer />
    </div>
  )
}
