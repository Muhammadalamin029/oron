import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Order, User } from "@/types/api";
import { adminApi } from "@/services/admin";
import { shipmentsApi } from "@/services/shipments";
import {
  formatDateTime,
  formatNGN,
  CANCELLABLE_FROM_STATUSES,
  TERMINAL_ORDER_STATUSES,
  PAYMENT_GATED_STATUSES,
  NEXT_STATUS_LABEL,
  getNextOrderStatus,
} from "@/lib/admin-utils";
import { OrangeButton } from "@/components/admin-ui";

const SHIPMENT_STATUSES = ["label_created", "in_transit", "delivered"];

export default function OrderModal({
  order,
  user,
  onClose,
  onUpdated,
}: {
  order: Order;
  user?: User;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}) {
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [shipStatus, setShipStatus] = useState("label_created");
  const [orderStatus, setOrderStatus] = useState(
    (order.status || "pending").toLowerCase(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleShipment = async () => {
    try {
      setSubmitting(true);
      await shipmentsApi.createShipment({
        order_id: order.id,
        carrier,
        tracking_number: tracking,
        status: shipStatus,
      });
      toast.success("Shipment created");
      setCarrier("");
      setTracking("");
      setShipStatus("label_created");
      await onUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create shipment");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (value: string) => {
    try {
      setUpdatingStatus(true);
      await adminApi.updateOrderStatus(order.id, value);
      setOrderStatus(value);
      toast.success("Order status updated");
      await onUpdated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAdvance = () => {
    const next = getNextOrderStatus(orderStatus);
    if (next) updateStatus(next);
  };

  const handleCancel = () => {
    if (window.confirm("Cancel this order? This cannot be undone.")) {
      updateStatus("cancelled");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/5 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50">
          <h3 className="font-display font-bold text-xl text-white tracking-tight">
            ORDER{" "}
            <span className="text-[#9a9898] font-mono text-base">
              / #{order.id.slice(0, 12).toUpperCase()}
            </span>
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
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                Customer
              </p>
              <p className="font-bold text-white">
                {user?.full_name || "Customer"}
              </p>
              <p className="text-sm text-[#9a9898]">
                {user?.email || order.user_id}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                Date &amp; Time
              </p>
              <p className="text-[#e5e2e1] text-sm">
                {formatDateTime(order.created_at)}
              </p>
            </div>
          </div>

          {/* Right info */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                Total Amount
              </p>
              <p className="font-display font-bold text-2xl text-[#ff6b00]">
                {formatNGN(order.total_amount)}
              </p>
            </div>
            {order.shipping_info && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1">
                  Shipping Address
                </p>
                <p className="text-sm text-[#e5e2e1] leading-relaxed">
                  {order.shipping_info.first_name}{" "}
                  {order.shipping_info.last_name} • {order.shipping_info.phone}
                  <br />
                  {order.shipping_info.address}, {order.shipping_info.city}{" "}
                  {order.shipping_info.state}
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
                <li
                  key={item.id}
                  className="flex justify-between items-center py-1.5"
                >
                  <span className="text-[#e5e2e1] text-sm">
                    {item.product?.name || "Product"} × {item.quantity}
                  </span>
                  <span className="font-mono text-[#9a9898] text-sm">
                    {formatNGN(item.price)}
                  </span>
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
                <label className="block text-[10px] font-bold tracking-widest text-[#9a9898] uppercase mb-1.5">
                  Carrier
                </label>
                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="DHL, FedEx..."
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#9a9898] uppercase mb-1.5">
                  Tracking ID
                </label>
                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="TRK-123..."
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-[#9a9898] uppercase mb-1.5">
                  Shipment Status
                </label>
                <select
                  value={shipStatus}
                  onChange={(e) => setShipStatus(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none"
                >
                  {SHIPMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Update order status */}
          <div className="col-span-1 md:col-span-2 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b00] uppercase mb-3">
              Order Status
            </h4>
            {PAYMENT_GATED_STATUSES.includes(orderStatus) ? (
              <p className="text-sm text-[#9a9898]">
                This order must be paid before its status can be updated.
              </p>
            ) : TERMINAL_ORDER_STATUSES.includes(orderStatus) ? (
              <p className="text-sm text-[#9a9898]">
                This order is{" "}
                <span className="text-white font-semibold">
                  {orderStatus.toUpperCase()}
                </span>{" "}
                — no further changes are possible.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                {getNextOrderStatus(orderStatus) && (
                  <OrangeButton onClick={handleAdvance} disabled={updatingStatus}>
                    {updatingStatus ? "UPDATING..." : NEXT_STATUS_LABEL[orderStatus]}
                  </OrangeButton>
                )}
                {CANCELLABLE_FROM_STATUSES.includes(orderStatus) && (
                  <button
                    onClick={handleCancel}
                    disabled={updatingStatus}
                    className="border border-red-900 text-red-400 hover:bg-red-900/20 font-bold text-[10px] tracking-[0.2em] uppercase px-6 py-3 rounded-lg transition-all disabled:opacity-40"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#0a0a0a]/80 flex justify-end">
          <OrangeButton
            onClick={handleShipment}
            disabled={submitting || !carrier}
          >
            {submitting ? "SUBMITTING..." : "SUBMIT UPDATE"}
          </OrangeButton>
        </div>
      </div>
    </div>
  );
}
