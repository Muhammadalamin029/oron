"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { format } from "date-fns"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { Wallet, ShoppingCart, Package, Users, TrendingUp, Scale, Headphones, CreditCard } from "lucide-react"
import { adminApi } from "@/services/admin"
import type { AdminDashboardResponse } from "@/types/api"
import { cn } from "@/lib/utils"
import { formatNGN } from "@/lib/admin-utils"
import {
  AdminPageHeader,
  GlassCard,
  SectionHeader,
  SkeletonRows,
  StatusBadge,
  AdminTable,
  AdminTr,
  AdminTd,
  CustomerCell,
} from "@/components/admin-ui"
import { getErrorMessage } from "@/lib/get-error-message"

const REVENUE_TREND_DAYS = 30

// API returns bare "YYYY-MM-DD" strings. `new Date("2026-07-28")` parses as UTC midnight,
// which date-fns' format() (local-time-based) can render as the *previous* day for any
// admin west of UTC — anchor to local midnight explicitly to avoid that off-by-one.
function parseTrendDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`)
}

function formatTrendDate(dateStr: string) {
  return format(parseTrendDate(dateStr), "MMM d")
}

function RevenueTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload as { date: string; revenue: number }
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{format(parseTrendDate(point.date), "MMM d, yyyy")}</p>
      <p className="text-white font-semibold">{formatNGN(point.revenue)}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const data = await adminApi.getDashboard()
        if (cancelled) return
        setDashboard(data)
      } catch (err: unknown) {
        if (!cancelled) toast.error(getErrorMessage(err, "Failed to load dashboard"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const stats = dashboard?.stats
  const recentOrders = dashboard?.recent_orders ?? []
  const topProducts = dashboard?.top_products ?? []
  const needsAttention = dashboard?.needs_attention
  const revenueTrend = dashboard?.revenue_trend ?? []

  const kpis = [
    { label: "TOTAL REVENUE",    value: loading || !stats ? "—" : formatNGN(stats.total_revenue),    icon: Wallet,       highlight: true,  live: false },
    { label: "ACTIVE ORDERS",    value: loading || !stats ? "—" : String(stats.total_orders),         icon: ShoppingCart, highlight: false, live: true  },
    { label: "CATALOG SIZE",     value: loading || !stats ? "—" : String(stats.total_products),       icon: Package,      highlight: false, live: false },
    { label: "TOTAL CUSTOMERS",  value: loading || !stats ? "—" : String(stats.total_customers),      icon: Users,        highlight: false, live: false },
  ]

  const attentionItems = [
    { label: "OPEN DISPUTES",    count: needsAttention?.open_disputes ?? 0,        href: "/admin/disputes", icon: Scale       },
    { label: "SUPPORT TICKETS",  count: needsAttention?.open_support_tickets ?? 0, href: "/admin/support",  icon: Headphones  },
    { label: "PENDING PAYMENTS", count: needsAttention?.pending_payments ?? 0,     href: "/admin/payments", icon: CreditCard  },
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
              "p-6 flex flex-col justify-between transition-colors duration-300 hover:border-primary/40",
              i === 1 && "border-l-2 border-l-primary !pl-5"
            )}
          >
            <div className="flex justify-between items-start mb-5">
              <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                {kpi.label}
              </span>
              <div className="flex items-center gap-2">
                {kpi.live && (
                  <div className="flex items-center gap-1.5 bg-[#201f1f] border border-border px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-bold text-foreground tracking-widest">LIVE</span>
                  </div>
                )}
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <span className={cn("font-display font-bold text-3xl block", kpi.highlight ? "text-primary" : "text-white")}>
                {kpi.value}
              </span>
              {kpi.highlight && !loading && (
                <p className="text-sm text-secondary-text mt-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  Revenue tracked
                </p>
              )}
            </div>
          </GlassCard>
        ))}
      </section>

      {/* Needs Attention */}
      <section>
        <p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase mb-3">
          NEEDS ATTENTION
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {attentionItems.map((item) => {
            const hasItems = !loading && item.count > 0
            return (
              <Link key={item.label} href={item.href} className="block h-full">
                <GlassCard className="p-6 h-full flex flex-col justify-between transition-colors duration-300 hover:border-primary/40">
                  <div className="flex justify-between items-start mb-5">
                    <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasItems && (
                        <div className="flex items-center gap-1.5 bg-[#201f1f] border border-border px-2 py-1 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[9px] font-bold text-foreground tracking-widest">LIVE</span>
                        </div>
                      )}
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <span className={cn("font-display font-bold text-3xl block", hasItems ? "text-primary" : "text-white")}>
                    {loading || !needsAttention ? "—" : item.count}
                  </span>
                </GlassCard>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Revenue Trend */}
      <GlassCard>
        <SectionHeader title="REVENUE TREND" sub={`LAST ${REVENUE_TREND_DAYS} DAYS`} />
        <div className="p-6 h-72" role="img" aria-label={`Revenue trend, last ${REVENUE_TREND_DAYS} days`}>
          {loading ? (
            <div className="h-full rounded bg-muted animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff6b00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTrendDate}
                  tick={{ fill: "#9a9898", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis hide />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "#ff6b00", strokeOpacity: 0.3 }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ff6b00"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#ff6b00", stroke: "#1a1a1a", strokeWidth: 2 }}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

      {/* Data panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <SectionHeader title="RECENT ORDERS">
            <Link
              href="/admin/orders"
              className="px-4 py-1.5 border border-secondary-text/30 text-secondary-text hover:border-primary hover:text-primary transition-colors rounded text-[10px] font-bold tracking-widest uppercase"
            >
              VIEW ALL
            </Link>
          </SectionHeader>

          {loading ? (
            <SkeletonRows count={5} />
          ) : (
            <AdminTable headers={["Order ID", "Customer", "Product", "Amount (NGN)", "Status"]} lastRight={false}>
              {recentOrders.map((o) => (
                <AdminTr key={o.id}>
                  <AdminTd mono className="text-xs">#{o.id.slice(0, 10).toUpperCase()}</AdminTd>
                  <AdminTd>
                    <CustomerCell name={o.customer_name} email={o.customer_email} />
                  </AdminTd>
                  <AdminTd>{o.product_name}</AdminTd>
                  <AdminTd mono className="text-white font-bold">{formatNGN(o.total_amount)}</AdminTd>
                  <AdminTd><StatusBadge status={o.status} /></AdminTd>
                </AdminTr>
              ))}
            </AdminTable>
          )}
        </GlassCard>

        {/* Top Products */}
        <GlassCard className="flex flex-col">
          <SectionHeader title="TOP PRODUCTS" sub="BY VOLUME (7 DAYS)" />

          <div className="flex-1 p-4 flex flex-col gap-2">
            {loading ? (
              <SkeletonRows count={4} height="h-16" />
            ) : topProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              topProducts.map((p, i) => (
                <div
                  key={p.product_id}
                  className="flex items-center gap-3 p-3 bg-[#201f1f]/40 rounded border border-transparent hover:border-primary/30 transition-colors cursor-pointer group"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold",
                    i === 0
                      ? "bg-primary/10 border border-primary text-primary"
                      : "bg-border border border-border text-secondary-text"
                  )}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate group-hover:text-primary transition-colors">{p.product_name}</p>
                    <p className="text-muted-foreground text-xs font-mono">{p.units_sold} UNITS</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/5">
            <Link
              href="/admin/products"
              className="block w-full text-center py-3 bg-primary text-white font-bold text-[10px] tracking-[0.2em] uppercase rounded hover:bg-[#ff8533] transition-all active:scale-95"
            >
              ANALYZE TRENDS
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
