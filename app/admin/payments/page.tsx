"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, Search, User, Package, Eye } from "lucide-react"
import { paymentsApi } from "@/services/payments"
import type { Payment } from "@/types/api"

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const fetchPayments = async () => {
    try {
      const data = await paymentsApi.getAllPayments()
      setPayments(data)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast.error("Failed to load payment data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === "" || 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order?.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.order?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleViewDetails = async (payment: Payment) => {
    try {
      const detailedPayment = await paymentsApi.getPaymentDetails(payment.id)
      setSelectedPayment(detailedPayment)
    } catch (error) {
      toast.error("Failed to fetch payment details")
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-md bg-muted/30 animate-pulse" />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-serif tracking-[0.2em] mb-2">Payment Management</h1>
              <p className="text-muted-foreground">
                Monitor and manage all payment transactions in the marketplace
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Successful</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {payments.filter(p => p.status === "success").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {payments.filter(p => p.status === "pending").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {payments.filter(p => p.status === "failed").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  All Payments
                </CardTitle>
                <CardDescription>
                  Comprehensive view of all payment transactions with customer and order details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by payment ID, order, customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payments found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {filteredPayments.length} of {payments.length} payments
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment Details</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium font-mono text-sm">
                                    {payment.id.slice(0, 12)}...
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Ref: {payment.reference.slice(0, 12)}...
                                  </p>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {payment.provider}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">
                                      {payment.order?.user?.full_name || 'Unknown'}
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {payment.order?.user?.email || 'No email'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">
                                      #{payment.order?.id?.slice(-6) || 'Unknown'}
                                    </p>
                                  </div>
                                  {payment.order?.items && (
                                    <p className="text-xs text-muted-foreground">
                                      {payment.order.items.length} items
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">
                                  {formatCurrency(payment.amount)}
                                </p>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(payment.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <div>
                                    {new Date(payment.created_at).toLocaleDateString()}
                                    <p className="text-xs">
                                      {new Date(payment.created_at).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(payment)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details Modal */}
            {selectedPayment && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Complete information about this payment transaction</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Payment ID</p>
                        <p className="font-mono text-sm">{selectedPayment.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reference</p>
                        <p className="font-mono text-sm">{selectedPayment.reference}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Amount</p>
                        <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Status</p>
                        <div>{getStatusBadge(selectedPayment.status)}</div>
                      </div>
                    </div>
                    
                    {selectedPayment.order && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Order Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Order ID</p>
                            <p>#{selectedPayment.order.id.slice(-6)}</p>
                          </div>
                          <div>
                            <p className="font-medium">Customer</p>
                            <p>{selectedPayment.order.user?.full_name}</p>
                            <p className="text-muted-foreground">{selectedPayment.order.user?.email}</p>
                          </div>
                        </div>
                        
                        {selectedPayment.order.items && selectedPayment.order.items.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Order Items</h5>
                            <div className="space-y-2">
                              {selectedPayment.order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span>{item.product?.name} x {item.quantity}</span>
                                  <span>{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => setSelectedPayment(null)}>
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
