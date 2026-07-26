"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { paymentLinksApi } from "@/services/payment-links"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, Clock, AlertTriangle } from "lucide-react"
import type { Order, PaymentStatusResponse } from "@/types/api"

const POLL_INTERVAL_MS = 5000

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price)
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function PaymentLinkSessionPage() {
  const params = useParams<{ orderId: string }>()

  const [order, setOrder] = useState<Order | null>(null)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null)
  const [initiating, setInitiating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadOrder = useCallback(async () => {
    try {
      setFetching(true)
      const data = await paymentLinksApi.sessionOrder(params.orderId)
      setOrder(data)
    } catch {
      setNotFound(true)
    } finally {
      setFetching(false)
    }
  }, [params.orderId])

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const checkStatus = useCallback(async () => {
    try {
      const status = await paymentLinksApi.sessionStatus(params.orderId)
      setPayment(status)
      if (status.order_status === "paid") {
        stopPolling()
        setOrder((prev) => (prev ? { ...prev, status: "paid" } : prev))
      }
    } catch {
      // transient error — polling will retry
    }
  }, [params.orderId, stopPolling])

  const initiateCharge = useCallback(async () => {
    try {
      setInitiating(true)
      const charge = await paymentLinksApi.sessionCharge(params.orderId)
      setPayment({
        order_id: charge.order_id,
        payment_id: charge.payment_id,
        payment_status: charge.status,
        order_status: "unpaid",
        amount: charge.amount,
        bank_name: charge.bank_name,
        account_number: charge.account_number,
        account_name: charge.account_name,
        expires_at: charge.expires_at,
        seconds_remaining: null,
      })
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate account number")
    } finally {
      setInitiating(false)
    }
  }, [params.orderId])

  useEffect(() => {
    if (!order) return
    if (order.status === "unpaid" || order.status === "expired") {
      initiateCharge()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status])

  useEffect(() => {
    if (!payment) return
    if (payment.payment_status === "pending") {
      stopPolling()
      pollRef.current = setInterval(checkStatus, POLL_INTERVAL_MS)
      checkStatus()
    } else {
      stopPolling()
    }
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.payment_status])

  useEffect(() => stopPolling, [stopPolling])

  const verifyPayment = useCallback(async () => {
    try {
      setVerifying(true)
      const status = await paymentLinksApi.sessionVerify(params.orderId)
      setPayment(status)
      if (status.order_status === "paid") {
        stopPolling()
        setOrder((prev) => (prev ? { ...prev, status: "paid" } : prev))
        toast.success("Payment confirmed!")
      } else if (status.payment_status === "failed") {
        toast.error("We couldn't confirm this transfer. Please contact support if you already sent it.")
      } else {
        toast("Still checking — we'll keep polling automatically.")
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to verify payment")
    } finally {
      setVerifying(false)
    }
  }, [params.orderId, stopPolling])

  const copyAccountNumber = () => {
    if (!payment?.account_number) return
    navigator.clipboard.writeText(payment.account_number)
    toast.success("Account number copied")
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="h-40 rounded-md bg-muted/30 animate-pulse max-w-2xl mx-auto" />
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <h1 className="text-2xl font-serif text-foreground mb-2">
            We couldn&apos;t find this payment session
          </h1>
          <p className="text-muted-foreground mb-8">
            This link may be invalid or the session may no longer exist.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const isPaid = order.status === "paid"
  const isAwaitingPayment = payment && payment.payment_status === "pending"
  const isExpired = payment && payment.payment_status === "expired"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2">Order</p>
          <h1 className="text-2xl font-serif text-foreground">{order.id}</h1>
          <div className="mt-3">
            <Badge variant={isPaid ? "default" : "secondary"}>{order.status}</Badge>
          </div>
        </div>

        {isPaid ? (
          <Card className="mb-8">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">Payment received</p>
              <p className="text-sm text-muted-foreground">
                We're preparing your order. You'll get an email as its status changes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Complete your payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {initiating && !payment ? (
                <p className="text-muted-foreground text-sm">Generating your account number...</p>
              ) : isExpired ? (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
                  <p className="text-foreground font-medium mb-1">Payment window expired</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    No charge was made. Generate a new account number to try again.
                  </p>
                  <Button onClick={initiateCharge} disabled={initiating}>
                    {initiating ? "Generating..." : "Generate New Account Number"}
                  </Button>
                </div>
              ) : payment?.account_number ? (
                <>
                  <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bank</span>
                      <span className="font-medium text-foreground">{payment.bank_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Account Number</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground text-base">
                          {payment.account_number}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAccountNumber}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Account Name</span>
                      <span className="font-medium text-foreground">{payment.account_name}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-3">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(payment.amount ?? order.total_amount)}
                      </span>
                    </div>
                  </div>

                  {typeof payment.seconds_remaining === "number" && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Expires in {formatCountdown(payment.seconds_remaining)}</span>
                    </div>
                  )}

                  {isAwaitingPayment && (
                    <div className="text-center space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Waiting for your transfer — this page updates automatically once received.
                      </p>
                      <Button variant="outline" size="sm" onClick={verifyPayment} disabled={verifying}>
                        {verifying ? "Checking..." : "I have sent the money"}
                      </Button>
                    </div>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {item.product?.name || "Product"} × {item.quantity}
                </span>
                <span className="text-muted-foreground">{formatPrice(item.price)} each</span>
              </div>
            ))}
            {order.shipping_info && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-medium text-foreground mb-1 text-sm">Shipping</p>
                <p className="text-sm text-muted-foreground">
                  {order.shipping_info.first_name} {order.shipping_info.last_name} • {order.shipping_info.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shipping_info.address}, {order.shipping_info.city} {order.shipping_info.state}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Link href="/products" className="w-full sm:w-auto">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
