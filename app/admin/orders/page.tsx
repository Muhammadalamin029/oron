"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { shipmentsApi } from "@/services/shipments"
import { toast } from "sonner"
import { adminApi } from "@/services/admin"
import type { Order, User } from "@/types/api"

const statuses = ["All", "pending", "paid", "processing", "shipped", "delivered", "cancelled"]

function ShipmentForm({
  orderId,
  onCreated,
}: {
  orderId: string
  onCreated: () => Promise<void>
}) {
  const [carrier, setCarrier] = useState("")
  const [tracking, setTracking] = useState("")
  const [status, setStatus] = useState("label_created")
  const [creating, setCreating] = useState(false)

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Create Shipment</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Carrier</Label>
          <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="DHL" />
        </div>
        <div className="space-y-2">
          <Label>Tracking</Label>
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="TRK123..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="label_created">label_created</SelectItem>
            <SelectItem value="in_transit">in_transit</SelectItem>
            <SelectItem value="delivered">delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        size="sm"
        className="bg-primary text-primary-foreground"
        disabled={creating}
        onClick={async () => {
          try {
            setCreating(true)
            await shipmentsApi.createShipment({
              order_id: orderId,
              carrier,
              tracking_number: tracking,
              status,
            })
            toast.success("Shipment created")
            setCarrier("")
            setTracking("")
            setStatus("label_created")
            await onCreated()
          } catch (error: any) {
            toast.error(error?.message || "Failed to create shipment")
          } finally {
            setCreating(false)
          }
        }}
      >
        {creating ? "Creating..." : "Create Shipment"}
      </Button>
    </div>
  )
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const userById = useMemo(() => {
    const map = new Map<string, User>()
    for (const u of users) map.set(u.id, u)
    return map
  }, [users])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const user = userById.get(order.user_id)
      const customer = user?.full_name || user?.email || order.user_id
      const matchesSearch =
        customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        selectedStatus === "All" ||
        (order.status || "").toLowerCase() === selectedStatus.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [orders, userById, searchQuery, selectedStatus])

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
      case "completed":
      case "success":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
      case "canceled":
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const load = async () => {
    const [ordersRes, usersRes] = await Promise.all([
      adminApi.getAllOrders(),
      adminApi.getUsers(),
    ])
    setOrders(ordersRes)
    setUsers(usersRes)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load orders")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
        <p className="text-muted-foreground">
          Manage and track customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "All" ? "All" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-md bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const user = userById.get(order.user_id)
                    const itemCount = order.items?.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                "en-NG"
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {user?.full_name || "Customer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user?.email || order.user_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{itemCount ?? 0}</TableCell>
                        <TableCell>{formatPrice(order.total_amount)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Order Details - {order.id}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Customer
                                    </p>
                                    <p className="font-medium">
                                      {user?.full_name || "Customer"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Email
                                    </p>
                                    <p className="font-medium">
                                      {user?.email || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Date
                                    </p>
                                    <p className="font-medium">
                                      {order.created_at
                                        ? new Date(
                                            order.created_at
                                          ).toLocaleString("en-NG")
                                        : "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Total
                                    </p>
                                    <p className="font-medium">
                                      {formatPrice(order.total_amount)}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Items
                                  </p>
                                  <div className="space-y-2 text-sm">
                                    {order.items?.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between"
                                      >
                                        <span>
                                          {item.product?.name || "Product"} ×{" "}
                                          {item.quantity}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {formatPrice(item.price)} each
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {order.shipping_info && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Shipping
                                    </p>
                                    <p className="text-sm">
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

                                <ShipmentForm orderId={order.id} onCreated={load} />

                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Update Status
                                  </p>
                                  <Select
                                    value={(order.status || "").toLowerCase()}
                                    onValueChange={async (value) => {
                                      try {
                                        await adminApi.updateOrderStatus(
                                          order.id,
                                          value
                                        )
                                        toast.success("Order status updated")
                                        await load()
                                      } catch (error: any) {
                                        toast.error(
                                          error?.message ||
                                            "Failed to update status"
                                        )
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {statuses
                                        .filter((s) => s !== "All")
                                        .map((status) => (
                                          <SelectItem key={status} value={status}>
                                            {status}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
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
