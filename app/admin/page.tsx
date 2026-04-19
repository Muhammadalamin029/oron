"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react"
import { adminApi } from "@/services/admin"
import type { Order, User } from "@/types/api"

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

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 5)
      .map((order) => {
        const user = userById.get(order.user_id)
        const firstItem = order.items?.[0]?.product?.name
        return {
          id: order.id,
          customer: user?.full_name || user?.email || order.user_id,
          product: firstItem || "—",
          amount: formatPrice(order.total_amount),
          status: order.status,
        }
      })
  }, [orders, userById])

  const topProducts = useMemo(() => {
    const acc = new Map<
      string,
      { name: string; sales: number; revenue: number }
    >()

    for (const order of orders) {
      const status = (order.status || "").toLowerCase()
      if (!["paid", "completed", "success", "delivered", "shipped"].includes(status))
        continue
      for (const item of order.items || []) {
        const name = item.product?.name || "Product"
        const current = acc.get(name) || { name, sales: 0, revenue: 0 }
        current.sales += item.quantity
        current.revenue += item.price * item.quantity
        acc.set(name, current)
      }
    }

    return Array.from(acc.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4)
      .map((p) => ({
        name: p.name,
        sales: p.sales,
        revenue: formatPrice(p.revenue),
      }))
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
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load dashboard")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: formatPrice(stats.total_revenue), icon: DollarSign },
          { title: "Orders", value: String(stats.total_orders), icon: ShoppingCart },
          { title: "Products", value: String(stats.total_products), icon: Package },
          { title: "Customers", value: String(stats.total_customers), icon: Users },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {loading ? "—" : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 rounded-md bg-muted/30 animate-pulse"
                    />
                  ))
                : recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-card-foreground">
                      {order.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.product}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-card-foreground">
                      {order.amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        (order.status || "").toLowerCase() === "paid" ||
                        (order.status || "").toLowerCase() === "completed" ||
                        (order.status || "").toLowerCase() === "success"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : (order.status || "").toLowerCase() === "processing"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : (order.status || "").toLowerCase() === "shipped"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-md bg-muted/30 animate-pulse"
                    />
                  ))
                : topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-4 py-2 border-b border-border last:border-0"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} sales
                    </p>
                  </div>
                  <p className="font-medium text-card-foreground">
                    {product.revenue}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
