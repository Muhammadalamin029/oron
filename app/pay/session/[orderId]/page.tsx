"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { PayHeader, PayFooter } from "@/app/pay/pay-chrome"
import { paymentLinksApi } from "@/services/payment-links"
import { CheckCircle, Copy, Clock, AlertTriangle } from "lucide-react"
import type { Order, PaymentStatusResponse } from "@/types/api"
import { getErrorMessage } from "@/lib/get-error-message"

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
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadOrder = useCallback(async () => {
    try {
      setFetching(true)
      const data = await paymentLinksApi.sessionOrder(params.orderId)
      if (mountedRef.current) setOrder(data)
    } catch {
      if (mountedRef.current) setNotFound(true)
    } finally {
      if (mountedRef.current) setFetching(false)
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
      if (!mountedRef.current) return
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
      if (!mountedRef.current) return
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
    } catch (error: unknown) {
      if (mountedRef.current) toast.error(getErrorMessage(error, "Failed to generate account number"))
    } finally {
      if (mountedRef.current) setInitiating(false)
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
      if (!mountedRef.current) return
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
    } catch (error: unknown) {
      if (mountedRef.current) toast.error(getErrorMessage(error, "Failed to verify payment"))
    } finally {
      if (mountedRef.current) setVerifying(false)
    }
  }, [params.orderId, stopPolling])

  const copyAccountNumber = () => {
    if (!payment?.account_number) return
    navigator.clipboard.writeText(payment.account_number)
    toast.success("Account number copied")
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <PayHeader />
        <main className="max-w-2xl mx-auto px-6 pt-14 pb-24">
          <div className="h-40 rounded-lg bg-white/5 animate-pulse" />
        </main>
        <PayFooter />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <PayHeader />
        <main className="max-w-2xl mx-auto px-6 pt-14 pb-24 text-center">
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            We couldn&apos;t find this payment session
          </h1>
          <p className="text-[#9a9898] mb-8">
            This link may be invalid or the session may no longer exist.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95"
          >
            BROWSE PRODUCTS
          </Link>
        </main>
        <PayFooter />
      </div>
    )
  }

  const isPaid = order.status === "paid"
  const isAwaitingPayment = payment && payment.payment_status === "pending"
  const isExpired = payment && payment.payment_status === "expired"

  return (
    <div className="min-h-screen bg-[#131313]">
      <PayHeader />
      <main className="max-w-2xl mx-auto px-6 pt-14 pb-24">
        <div className="text-center mb-8">
          <p className="text-sm text-[#9a9898] mb-2">Order</p>
          <h1 className="font-display font-bold text-2xl text-white">{order.id}</h1>
          <div className="mt-3">
            <span
              className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                isPaid ? "bg-[#ff6b00]/15 text-[#ff6b00]" : "bg-white/5 text-[#9a9898]"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {isPaid ? (
          <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#ff6b00]/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#ff6b00]" />
            </div>
            <p className="text-lg font-semibold text-white mb-1">Payment received</p>
            <p className="text-sm text-[#9a9898]">
              We&apos;re preparing your order. You&apos;ll get an email as its status changes.
            </p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-6 mb-8">
            <h2 className="font-display font-bold text-lg text-white mb-5">Complete your payment</h2>

            {initiating && !payment ? (
              <p className="text-[#9a9898] text-sm">Generating your account number...</p>
            ) : isExpired ? (
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 text-[#ff6b00] mx-auto mb-3" />
                <p className="text-white font-medium mb-1">Payment window expired</p>
                <p className="text-sm text-[#9a9898] mb-4">
                  No charge was made. Generate a new account number to try again.
                </p>
                <button
                  onClick={initiateCharge}
                  disabled={initiating}
                  className="bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-6 py-3 rounded-full glow-hover transition-all active:scale-95 disabled:opacity-50"
                >
                  {initiating ? "Generating..." : "Generate New Account Number"}
                </button>
              </div>
            ) : payment?.account_number ? (
              <>
                <div className="rounded-lg border border-white/5 bg-[#131313] p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9a9898]">Bank</span>
                    <span className="font-medium text-white">{payment.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#9a9898]">Account Number</span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-white text-base">
                        {payment.account_number}
                      </span>
                      <button
                        onClick={copyAccountNumber}
                        className="w-6 h-6 flex items-center justify-center rounded text-[#9a9898] hover:text-[#ff6b00] transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9a9898]">Account Name</span>
                    <span className="font-medium text-white">{payment.account_name}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/5 pt-3">
                    <span className="text-[#9a9898]">Amount</span>
                    <span className="font-semibold text-white">
                      {formatPrice(payment.amount ?? order.total_amount)}
                    </span>
                  </div>
                </div>

                {typeof payment.seconds_remaining === "number" && (
                  <div className="flex items-center justify-center gap-2 text-sm text-[#9a9898] mt-4">
                    <Clock className="h-4 w-4" />
                    <span>Expires in {formatCountdown(payment.seconds_remaining)}</span>
                  </div>
                )}

                {isAwaitingPayment && (
                  <div className="text-center space-y-3 mt-5">
                    <p className="text-xs text-[#9a9898]">
                      Waiting for your transfer — this page updates automatically once received.
                    </p>
                    <button
                      onClick={verifyPayment}
                      disabled={verifying}
                      className="border border-[#353534] text-[#e5e2e1] hover:border-[#ff6b00] hover:text-[#ff6b00] transition-colors px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50"
                    >
                      {verifying ? "Checking..." : "I have sent the money"}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-6">
          <h2 className="font-display font-bold text-base text-white mb-4">Items</h2>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-[#e5e2e1]">
                  {item.product?.name || "Product"} × {item.quantity}
                </span>
                <span className="text-[#9a9898]">{formatPrice(item.price)} each</span>
              </div>
            ))}
          </div>
          {order.shipping_info && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="font-medium text-white mb-1 text-sm">Shipping</p>
              <p className="text-sm text-[#9a9898]">
                {order.shipping_info.first_name} {order.shipping_info.last_name} • {order.shipping_info.phone}
              </p>
              <p className="text-sm text-[#9a9898]">
                {order.shipping_info.address}, {order.shipping_info.city} {order.shipping_info.state}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
      <PayFooter />
    </div>
  )
}
