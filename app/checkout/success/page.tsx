"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Mail } from "lucide-react"
import { paymentsApi } from "@/services/payments"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const reference = searchParams.get("reference")
    if (!reference) {
      setLoading(false)
      setMessage("Missing payment reference.")
      return
    }

    ;(async () => {
      try {
        setLoading(true)
        const result = await paymentsApi.verifyPayment(reference)
        if (cancelled) return

        setOrderId(result.order_id)
        if (result.status === "success" || result.order_status === "paid") {
          clearCart()
          setMessage("Payment verified successfully.")
        } else {
          setMessage(`Payment status: ${result.status}`)
        }
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error?.message || "Failed to verify payment")
          setMessage(error?.message || "Failed to verify payment.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, clearCart])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-serif text-foreground mb-4">
            Thank you for your order!
          </h1>

          <p className="text-muted-foreground mb-8">
            Your order has been confirmed and will be shipped soon. We&apos;ve
            sent you an email with your order details.
          </p>

          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-semibold text-card-foreground mb-6">
              {loading ? "Verifying..." : orderId ? orderId : "—"}
            </p>
            {!loading && message && (
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
            )}

            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Confirmation sent</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>Ships in 2-3 days</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">What happens next?</h3>
            <div className="text-left space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Order Confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive an email with your order details
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Processing</p>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll prepare your watch with care
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Shipped</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll receive tracking information via email
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Delivered</p>
                  <p className="text-sm text-muted-foreground">
                    Enjoy your new ORON timepiece!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/orders" className="flex-1">
              <Button variant="outline" className="w-full">
                View My Orders
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
