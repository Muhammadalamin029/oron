"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";
import { adminApi } from "@/services/admin";
import type { Order, User } from "@/types/api";
import { formatNGN, formatDate } from "@/lib/admin-utils";
import {
  AdminPageHeader,
  GlassCard,
  StatusBadge,
  SkeletonRows,
  DarkInput,
  OrangeButton,
  CustomerCell,
  EmptyState,
} from "@/components/admin-ui";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/get-error-message"

const STATUSES = [
  "ALL",
  "PENDING",
  "UNPAID",
  "PAID",
  "EXPIRED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

/* ── Main Page ── */
export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<(Order & { user?: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");

  const load = async () => {
    const ordersRes = await adminApi.getAllOrdersWithUsers();
    setOrders(ordersRes);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load orders"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const u = o.user;
      const hay =
        `${o.id} ${u?.full_name || ""} ${u?.email || ""}`.toLowerCase();
      const matchesSearch = hay.includes(search.toLowerCase());
      const matchesStatus =
        activeStatus === "ALL" ||
        (o.status || "").toLowerCase() === activeStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, activeStatus]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="ORDERS" sub="/ ALL TRANSACTIONS" />

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
                    : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#9a9898] hover:border-[#ff6b00] hover:text-[#ff6b00]",
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
                <OrangeButton
                  onClick={() => {
                    setSearch("");
                    setActiveStatus("ALL");
                  }}
                >
                  CLEAR FILTERS
                </OrangeButton>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0a0a0a]/50">
                    {[
                      "TXN ID",
                      "Date",
                      "Customer",
                      "Items",
                      "NGN Total",
                      "Status",
                      "Action",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "p-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal",
                          i === 6 && "text-center",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((order) => {
                    const u = order.user;
                    const itemCount =
                      order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
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
                        <td className="p-4 text-[#c6c6c6] text-sm">
                          {itemCount}
                        </td>
                        <td className="p-4 font-display font-bold text-lg text-white">
                          {formatNGN(order.total_amount)}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/orders/${order.id}`);
                            }}
                            className="text-[#9a9898] group-hover:text-[#ff6b00] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </GlassCard>
    </div>
  );
}
