"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Eye, PackageSearch } from "lucide-react";
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
  AdminTable,
  AdminTr,
  AdminTd,
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
                    ? "bg-primary text-white"
                    : "bg-[#0a0a0a] border border-[#1a1a1a] text-muted-foreground hover:border-primary hover:text-primary",
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
              icon={<PackageSearch className="h-8 w-8" />}
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
            <AdminTable
              headers={["TXN ID", "Date", "Customer", "Items", "NGN Total", "Status", { label: "Action", align: "center" }]}
              lastRight={false}
            >
              {filtered.map((order) => {
                const u = order.user;
                const itemCount =
                  order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
                return (
                  <AdminTr
                    key={order.id}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <AdminTd mono className="text-xs truncate max-w-[110px]">
                      #{order.id.slice(0, 10).toUpperCase()}
                    </AdminTd>
                    <AdminTd className="whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </AdminTd>
                    <AdminTd>
                      <CustomerCell
                        name={u?.full_name || "Customer"}
                        email={u?.email || order.user_id}
                      />
                    </AdminTd>
                    <AdminTd>{itemCount}</AdminTd>
                    <AdminTd className="font-display font-bold text-lg text-white">
                      {formatNGN(order.total_amount)}
                    </AdminTd>
                    <AdminTd>
                      <StatusBadge status={order.status} />
                    </AdminTd>
                    <AdminTd className="text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/orders/${order.id}`);
                        }}
                        className="text-muted-foreground group-hover:text-primary transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </AdminTd>
                  </AdminTr>
                );
              })}
            </AdminTable>
          )}
      </GlassCard>
    </div>
  );
}
