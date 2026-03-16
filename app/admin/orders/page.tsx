"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const orders = [
  {
    id: "ORD-001",
    date: "2024-03-15",
    customer: "John Doe",
    email: "john@example.com",
    items: 2,
    total: "₦107,000",
    status: "Completed",
    address: "123 Victoria Island, Lagos",
  },
  {
    id: "ORD-002",
    date: "2024-03-14",
    customer: "Jane Smith",
    email: "jane@example.com",
    items: 1,
    total: "₦62,000",
    status: "Processing",
    address: "45 Lekki Phase 1, Lagos",
  },
  {
    id: "ORD-003",
    date: "2024-03-14",
    customer: "Mike Johnson",
    email: "mike@example.com",
    items: 3,
    total: "₦165,000",
    status: "Pending",
    address: "78 Wuse 2, Abuja",
  },
  {
    id: "ORD-004",
    date: "2024-03-13",
    customer: "Sarah Williams",
    email: "sarah@example.com",
    items: 1,
    total: "₦125,000",
    status: "Completed",
    address: "22 GRA Phase 2, Port Harcourt",
  },
  {
    id: "ORD-005",
    date: "2024-03-13",
    customer: "David Brown",
    email: "david@example.com",
    items: 2,
    total: "₦143,000",
    status: "Shipped",
    address: "56 Bodija Estate, Ibadan",
  },
  {
    id: "ORD-006",
    date: "2024-03-12",
    customer: "Emily Davis",
    email: "emily@example.com",
    items: 1,
    total: "₦48,000",
    status: "Completed",
    address: "91 Independence Layout, Enugu",
  },
]

const statuses = ["All", "Pending", "Processing", "Shipped", "Completed"]

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      selectedStatus === "All" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "Processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "Shipped":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "Pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

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
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{order.total}</TableCell>
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
                            <DialogTitle>Order Details - {order.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Customer
                                </p>
                                <p className="font-medium">{order.customer}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Email
                                </p>
                                <p className="font-medium">{order.email}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Date
                                </p>
                                <p className="font-medium">{order.date}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Total
                                </p>
                                <p className="font-medium">{order.total}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Shipping Address
                              </p>
                              <p className="font-medium">{order.address}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Update Status
                              </p>
                              <Select defaultValue={order.status}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.slice(1).map((status) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
