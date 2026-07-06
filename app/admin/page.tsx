"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { Wallet, ShoppingCart, Package, Users, TrendingUp } from "lucide-react"
import { adminApi } from "@/services/admin"
import type { Order, User } from "@/types/api"
import { cn } from "@/lib/utils"
import { formatNGN, buildUserMap } from "@/lib/admin-utils"
import {
  AdminPageHeader,
  GlassCard,
  SectionHeader,
  SkeletonRows,
  StatusBadge,
} from "@/components/admin-ui"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
  })

  const userById = useMemo(() => buildUserMap(users), [users])

  const recentOrders = useMemo(() =>
    [...orders]
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 5)
      .map((o) => {
        const u = userById.get(o.user_id)
        return {
          id: o.id,
          customer: u?.full_name || "Customer",
          email: u?.email || o.user_id,
          product: o.items?.[0]?.product?.name || "—",
          amount: formatNGN(o.total_amount),
          status: o.status || "pending",
        }
      }),
  [orders, userById])

  const topProducts = useMemo(() => {
    const acc = new Map<string, { name: string; sales: number }>()
    for (const o of orders) {
      const status = (o.status || "").toLowerCase()
      if (!["paid", "completed", "success", "delivered", "shipped"].includes(status)) continue
      for (const item of o.items || []) {
        const name = item.product?.name || "Product"
        const cur = acc.get(name) || { name, sales: 0 }
        cur.sales += item.quantity
        acc.set(name, cur)
      }
    }
    return Array.from(acc.values()).sort((a, b) => b.sales - a.sales).slice(0, 4)
  }, [orders])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const [statsRes, ordersRes, usersRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getAllOrders(),
          adminApi.getUsers(),
        ])
        if (cancelled) return
        setStats(statsRes)
        setOrders(ordersRes)
        setUsers(usersRes)
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load dashboard")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const kpis = [
    { label: "TOTAL REVENUE",    value: loading ? "—" : formatNGN(stats.total_revenue),     icon: Wallet,       highlight: true,  live: false },
    { label: "ACTIVE ORDERS",    value: loading ? "—" : String(stats.total_orders),          icon: ShoppingCart, highlight: false, live: true  },
    { label: "CATALOG SIZE",     value: loading ? "—" : String(stats.total_products),        icon: Package,      highlight: false, live: false },
    { label: "TOTAL CUSTOMERS",  value: loading ? "—" : String(stats.total_customers),       icon: Users,        highlight: false, live: false },
  ]

  return (
    <div className="space-y-8">
      <AdminPageHeader title="DASHBOARD" sub="/ OVERVIEW" />

      {/* KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <GlassCard
            key={i}
            className={cn(
              "p-6 flex flex-col justify-between transition-colors duration-300 hover:border-[#ff6b00]/40",
              i === 1 && "border-l-2 border-l-[#ff6b00] !pl-5"
            )}
          >
            <div className="flex justify-between items-start mb-5">
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#9a9898] uppercase">
                {kpi.label}
              </span>
              <div className="flex items-center gap-2">
                {kpi.live && (
                  <div className="flex items-center gap-1.5 bg-[#201f1f] border border-[#353534] px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-pulse" />
                    <span className="text-[9px] font-bold text-[#e5e2e1] tracking-widest">LIVE</span>
                  </div>
                )}
                <kpi.icon className="h-4 w-4 text-[#9a9898]" />
              </div>
            </div>
            <div>
              <span className={cn("font-display font-bold text-3xl block", kpi.highlight ? "text-[#ff6b00]" : "text-white")}>
                {kpi.value}
              </span>
              {kpi.highlight && !loading && (
                <p className="text-sm text-[#c6c6c6] mt-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  Revenue tracked
                </p>
              )}
            </div>
          </GlassCard>
        ))}
      </section>

      {/* Data panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <SectionHeader title="RECENT ORDERS">
            <Link
              href="/admin/orders"
              className="px-4 py-1.5 border border-[#c6c6c6]/30 text-[#c6c6c6] hover:border-[#ff6b00] hover:text-[#ff6b00] transition-colors rounded text-[10px] font-bold tracking-widest uppercase"
            >
              VIEW ALL
            </Link>
          </SectionHeader>

          {loading ? (
            <SkeletonRows count={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Order ID", "Customer", "Product", "Amount (NGN)", "Status"].map((h) => (
                      <th key={h} className="py-3 px-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono text-[#c6c6c6] text-xs">#{o.id.slice(0, 10).toUpperCase()}</td>
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold text-sm">{o.customer}</p>
                        <p className="text-[#9a9898] text-xs">{o.email}</p>
                      </td>
                      <td className="py-4 px-4 text-[#c6c6c6] text-sm">{o.product}</td>
                      <td className="py-4 px-4 font-mono text-white text-sm font-bold">{o.amount}</td>
                      <td className="py-4 px-4"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Top Products */}
        <GlassCard className="flex flex-col">
          <SectionHeader title="TOP PRODUCTS" sub="BY VOLUME (7 DAYS)" />

          <div className="flex-1 p-4 flex flex-col gap-2">
            {loading ? (
              <SkeletonRows count={4} height="h-16" />
            ) : topProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[#9a9898] text-sm">No data yet</div>
            ) : (
              topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 p-3 bg-[#201f1f]/40 rounded border border-transparent hover:border-[#ff6b00]/30 transition-colors cursor-pointer group"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold",
                    i === 0
                      ? "bg-[#ff6b00]/10 border border-[#ff6b00] text-[#ff6b00]"
                      : "bg-[#353534] border border-[#353534] text-[#c6c6c6]"
                  )}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate group-hover:text-[#ff6b00] transition-colors">{p.name}</p>
                    <p className="text-[#9a9898] text-xs font-mono">{p.sales} UNITS</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/5">
            <Link
              href="/admin/products"
              className="block w-full text-center py-3 bg-[#ff6b00] text-white font-bold text-[10px] tracking-[0.2em] uppercase rounded hover:bg-[#ff8533] transition-all active:scale-95"
            >
              ANALYZE TRENDS
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
