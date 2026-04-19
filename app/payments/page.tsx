"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"
import { paymentsApi } from "@/services/payments"
import type { Payment } from "@/types/api"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {
    try {
      const data = await paymentsApi.getUserPayments()
      setPayments(data)
    } catch (error) {
      console.error("Failed to fetch payments:", error)
      toast.error("Failed to load payment history")
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
              <h1 className="text-3xl font-serif tracking-[0.2em] mb-2">Payment History</h1>
              <p className="text-muted-foreground">
                View your payment transactions and order details
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Your Payments
                </CardTitle>
                <CardDescription>
                  Complete history of all your payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payment history found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your payment transactions will appear here once you make purchases.
                    </p>
                    <Button className="mt-4" onClick={() => window.location.href = "/products"}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {payments.length} payment{payments.length === 1 ? '' : 's'} found
                    </div>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">
                                    {payment.id.slice(0, 8)}...
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {payment.reference.slice(0, 8)}...
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    #{payment.order?.id?.slice(-6) || 'Unknown'}
                                  </p>
                                  {payment.order?.items && payment.order.items.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {payment.order.items.length} item{payment.order.items.length === 1 ? '' : 's'}
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
                                <Badge variant="secondary" className="capitalize">
                                  {payment.provider}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(payment.created_at).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.location.href = `/orders/${payment.order?.id}`}
                                >
                                  <ExternalLink className="h-4 w-4" />
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
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
