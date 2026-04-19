"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { adminApi } from "@/services/admin"
import type { Order, User } from "@/types/api"

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const rows = useMemo(() => {
    const ordersByUser = new Map<string, { count: number; spent: number }>()
    for (const o of orders) {
      const current = ordersByUser.get(o.user_id) || { count: 0, spent: 0 }
      current.count += 1
      const status = (o.status || "").toLowerCase()
      if (["paid", "completed", "success", "delivered", "shipped"].includes(status)) {
        current.spent += o.total_amount
      }
      ordersByUser.set(o.user_id, current)
    }

    return users
      .filter((u) => !u.is_admin)
      .filter(
        (u) =>
          u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((u) => {
        const info = ordersByUser.get(u.id) || { count: 0, spent: 0 }
        return {
          id: u.id,
          name: u.full_name,
          email: u.email,
          orders: info.count,
          totalSpent: formatPrice(info.spent),
          joined: u.created_at
            ? new Date(u.created_at).toLocaleDateString("en-NG")
            : "—",
        }
      })
  }, [users, orders, searchQuery])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const [usersRes, ordersRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getAllOrders(),
        ])
        if (cancelled) return
        setUsers(usersRes)
        setOrders(ordersRes)
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load customers")
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
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="text-muted-foreground">
          View and manage your customer base
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
                    <TableHead>Customer</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>{customer.totalSpent}</TableCell>
                      <TableCell>{customer.joined}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
