"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { CreditCard, Calendar, ExternalLink } from "lucide-react"
import { paymentsApi } from "@/services/payments"
import type { Payment } from "@/types/api"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteMain, PageHeading, SiteCard, SkeletonLine, EmptyState, StatusBadge, PrimaryButton } from "@/components/site-ui"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await paymentsApi.getUserPayments()
        if (!cancelled) setPayments(data)
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load payment history"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
          <SiteMain>
            <div className="max-w-6xl mx-auto">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonLine key={i} className="h-24" />
                ))}
              </div>
            </div>
          </SiteMain>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <SiteMain>
          <div className="max-w-6xl mx-auto">
            <PageHeading sub="View your payment transactions and order details">
              Payment History
            </PageHeading>

            <SiteCard className="p-6">
              <div className="mb-6">
                <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Your Payments
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete history of all your payment transactions
                </p>
              </div>

              {payments.length === 0 ? (
                <EmptyState
                  icon={<CreditCard className="h-6 w-6" />}
                  title="No payment history found"
                  message="Your payment transactions will appear here once you make purchases."
                  action={
                    <PrimaryButton onClick={() => window.location.href = "/products"}>
                      Browse Products
                    </PrimaryButton>
                  }
                />
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {payments.length} payment{payments.length === 1 ? '' : 's'} found
                  </div>
                  <div className="border border-border rounded-lg">
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
                              <StatusBadge status={payment.status} />
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
            </SiteCard>
          </div>
        </SiteMain>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
