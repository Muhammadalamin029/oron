"use client"

import { useState } from "react"
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

const customers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+234 801 234 5678",
    orders: 5,
    totalSpent: "₦425,000",
    joined: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+234 802 345 6789",
    orders: 3,
    totalSpent: "₦186,000",
    joined: "2024-02-20",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+234 803 456 7890",
    orders: 8,
    totalSpent: "₦720,000",
    joined: "2023-11-10",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+234 804 567 8901",
    orders: 2,
    totalSpent: "₦173,000",
    joined: "2024-03-01",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david@example.com",
    phone: "+234 805 678 9012",
    orders: 6,
    totalSpent: "₦512,000",
    joined: "2023-12-05",
  },
  {
    id: "6",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+234 806 789 0123",
    orders: 4,
    totalSpent: "₦298,000",
    joined: "2024-01-28",
  },
]

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {customer.name
                              .split(" ")
                              .map((n) => n[0])
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
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell>{customer.totalSpent}</TableCell>
                    <TableCell>{customer.joined}</TableCell>
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
