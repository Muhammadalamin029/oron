"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Search, Eye, X } from "lucide-react"
import { adminApi } from "@/services/admin"
import { shipmentsApi } from "@/services/shipments"
import type { Order, User } from "@/types/api"
import { formatNGN, formatDate, formatDateTime, buildUserMap } from "@/lib/admin-utils"
import {
  AdminPageHeader,
  GlassCard,
  StatusBadge,
  SkeletonRows,
  DarkInput,
  OrangeButton,
  CustomerCell,
  EmptyState,
} from "@/components/admin-ui"
import { cn } from "@/lib/utils"

const STATUSES = ["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
const SHIPMENT_STATUSES = ["label_created", "in_transit", "delivered"]
const ORDER_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]

/* ── Order Detail Modal ── */
function OrderModal({
  order,
  user,
  onClose,
  onUpdated,
}: {
  order: Order
  user?: User
  onClose: () => void
  onUpdated: () => Promise<void>
}) {
  const [carrier, setCarrier] = useState("")
  const [tracking, setTracking] = useState("")
  const [shipStatus, setShipStatus] = useState("label_created")
  const [orderStatus, setOrderStatus] = useState((order.status || "pending").toLowerCase())
  const [submitting, setSubmitting] = useState(false)

  const handleShipment = async () => {
    try {
      setSubmitting(true)
      await shipmentsApi.createShipment({
        order_id: order.id,
        carrier,
        tracking_number: tracking,
        status: shipStatus,
      })
      toast.success("Shipment created")
      setCarrier(""); setTracking(""); setShipStatus("label_created")
      await onUpdated()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create shipment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (value: string) => {
    try {
      setOrderStatus(value)
      await adminApi.updateOrderStatus(order.id, value)
      toast.success("Order status updated")
      await onUpdated()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/5 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50">
          <h3 className="font-display font-bold text-xl text-white tracking-tight">
            ORDER{" "}
            <span className="text-[#9a9898] font-mono text-base">/ #{order.id.slice(0, 12).toUpperCase()}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[#9a9898] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Left info */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Customer</p>
              <p className="font-bold text-white">{user?.full_name || "Customer"}</p>
              <p className="text-sm text-[#9a9898]">{user?.email || order.user_id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Date &amp; Time</p>
              <p className="text-[#e5e2e1] text-sm">{formatDateTime(order.created_at)}</p>
            </div>
          </div>

          {/* Right info */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Total Amount</p>
              <p className="font-display font-bold text-2xl text-[#ff6b00]">{formatNGN(order.total_amount)}</p>
            </div>
            {order.shipping_info && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">Shipping Address</p>
                <p className="text-sm text-[#e5e2e1] leading-relaxed">
                  {order.shipping_info.first_name} {order.shipping_info.last_name} • {order.shipping_info.phone}<br />
                  {order.shipping_info.address}, {order.shipping_info.city} {order.shipping_info.state}
                </p>
              </div>
            )}
          </div>

          {/* Itemized list */}
          <div className="col-span-1 md:col-span-2 border border-white/5 rounded-lg overflow-hidden bg-[#0a0a0a]/30">
            <div className="px-4 py-2 bg-[#0a0a0a] border-b border-white/5 text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">
              Items ({order.items?.length ?? 0})
            </div>
            <ul className="divide-y divide-white/5 p-4 space-y-1">
              {order.items?.map((item) => (
                <li key={item.id} className="flex justify-between items-center py-1.5">
                  <span className="text-[#e5e2e1] text-sm">
                    {item.product?.name || "Product"} × {item.quantity}
                  </span>
                  <span className="font-mono text-[#9a9898] text-sm">{formatNGN(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Create Shipment */}
          <div className="col-span-1 md:col-span-2 pt-4 border-t border-white/5">
            <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b00] uppercase mb-4">
              Create Shipment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#9a9898] uppercase mb-1.5">Carrier</label>
                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="DHL, FedEx..."
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#9a9898] uppercase mb-1.5">Tracking ID</label>
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="TRK-123..."
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#9a9898] uppercase mb-1.5">Shipment Status</label>
                <select
                  value={shipStatus}
                  onChange={(e) => setShipStatus(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none"
                >
                  {SHIPMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ").toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Update order status */}
          <div className="col-span-1 md:col-span-2 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b00] uppercase mb-3">
              Update Order Status
            </h4>
            <select
              value={orderStatus}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] px-4 py-2.5 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#0a0a0a]/80 flex justify-end">
          <OrangeButton onClick={handleShipment} disabled={submitting || !carrier}>
            {submitting ? "SUBMITTING..." : "SUBMIT UPDATE"}
          </OrangeButton>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ── */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeStatus, setActiveStatus] = useState("ALL")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const userById = useMemo(() => buildUserMap(users), [users])

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
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load orders")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const u = userById.get(o.user_id)
      const hay = `${o.id} ${u?.full_name || ""} ${u?.email || ""}`.toLowerCase()
      const matchesSearch = hay.includes(search.toLowerCase())
      const matchesStatus =
        activeStatus === "ALL" ||
        (o.status || "").toLowerCase() === activeStatus.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [orders, userById, search, activeStatus])

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader title="ORDER MANIFEST" sub="/ ALL TRANSACTIONS" />

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <DarkInput
            placeholder="Search orders, customers, IDs..."
            value={search}
            onChange={setSearch}
            icon={<Search className="h-4 w-4" />}
            className="w-full md:w-96"
          />

          {/* Status Pills */}
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all",
                  activeStatus === s
                    ? "bg-[#ff6b00] text-white"
                    : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#9a9898] hover:border-[#ff6b00] hover:text-[#ff6b00]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table Panel */}
        <GlassCard className="overflow-hidden">
          {loading ? (
            <SkeletonRows count={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No orders found"
              message="Try adjusting your search or status filter."
              action={
                <OrangeButton onClick={() => { setSearch(""); setActiveStatus("ALL") }}>
                  CLEAR FILTERS
                </OrangeButton>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0a0a0a]/50">
                    {["TXN ID", "Date", "Customer", "Items", "NGN Total", "Status", "Action"].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "p-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal",
                          i === 6 && "text-center"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((order) => {
                    const u = userById.get(order.user_id)
                    const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="border-l-2 border-transparent hover:border-[#ff6b00] hover:bg-white/[0.02] transition-all cursor-pointer group"
                      >
                        <td className="p-4 font-mono text-[#9a9898] text-xs truncate max-w-[110px]">
                          #{order.id.slice(0, 10).toUpperCase()}
                        </td>
                        <td className="p-4 text-[#c6c6c6] text-sm whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="p-4">
                          <CustomerCell
                            name={u?.full_name || "Customer"}
                            email={u?.email || order.user_id}
                          />
                        </td>
                        <td className="p-4 text-[#c6c6c6] text-sm">{itemCount}</td>
                        <td className="p-4 font-display font-bold text-lg text-white">
                          {formatNGN(order.total_amount)}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order) }}
                            className="text-[#9a9898] group-hover:text-[#ff6b00] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          user={userById.get(selectedOrder.user_id)}
          onClose={() => setSelectedOrder(null)}
          onUpdated={async () => { await load(); setSelectedOrder(null) }}
        />
      )}
    </>
  )
}
