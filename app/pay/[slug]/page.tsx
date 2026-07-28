"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { PayHeader, PayFooter } from "@/app/pay/pay-chrome"
import { paymentLinksApi } from "@/services/payment-links"
import { ApiError } from "@/lib/api"
import { toast } from "sonner"
import { ShieldCheck, Zap, Minus, Plus, Tag } from "lucide-react"
import type { PaymentLinkPublic } from "@/types/api"
import { getErrorMessage } from "@/lib/get-error-message"

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function PaymentLinkCheckoutPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [link, setLink] = useState<PaymentLinkPublic | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [emailConflict, setEmailConflict] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "Lagos",
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await paymentLinksApi.getPublic(params.slug)
        if (cancelled) return
        setLink(data)
        const initialQty: Record<string, number> = {}
        data.items.forEach((item) => {
          initialQty[item.product_id] = item.default_quantity
        })
        setQuantities(initialQty)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params.slug])

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  const adjustQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] ?? 1) + delta),
    }))
  }

  const total = link
    ? link.items.reduce((sum, item) => sum + item.product.price * (quantities[item.product_id] ?? item.default_quantity), 0)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!link) return
    setEmailConflict(false)
    setIsProcessing(true)
    try {
      const result = await paymentLinksApi.checkout(params.slug, {
        items: link.items.map((item) => ({
          product_id: item.product_id,
          quantity: quantities[item.product_id] ?? item.default_quantity,
        })),
        shipping: {
          email: formData.email,
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: "Nigeria",
        },
      })
      router.replace(`/pay/session/${result.order_id}`)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        setEmailConflict(true)
      } else {
        toast.error(getErrorMessage(error, "Checkout failed"))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <PayHeader />
        <main className="max-w-[1280px] mx-auto px-6 pt-14 pb-24">
          <div className="h-64 rounded-lg bg-white/5 animate-pulse max-w-2xl mx-auto" />
        </main>
        <PayFooter />
      </div>
    )
  }

  if (notFound || !link) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <PayHeader />
        <main className="max-w-[1280px] mx-auto px-6 pt-14 pb-24 flex flex-col items-center text-center">
          <h1 className="font-display font-bold text-4xl text-white mb-4">
            Link No Longer Available
          </h1>
          <p className="text-[#9a9898] mb-10">
            This payment link doesn&apos;t exist or is no longer active.
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

  if (emailConflict) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <PayHeader />
        <main className="max-w-[1280px] mx-auto px-6 pt-14 pb-24 flex flex-col items-center text-center">
          <h1 className="font-display font-bold text-4xl text-white mb-4">
            Account Already Exists
          </h1>
          <p className="text-[#9a9898] max-w-md mb-10">
            An account already exists for {formData.email || "this email"}. Please use a different
            email to complete this purchase.
          </p>
          <button
            onClick={() => setEmailConflict(false)}
            className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95"
          >
            TRY A DIFFERENT EMAIL
          </button>
        </main>
        <PayFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      <PayHeader />

      <main className="max-w-[1280px] mx-auto px-6 pt-14 pb-24">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-2">
          {link.title}
        </h1>
        <p className="text-[#9a9898] mb-10">Complete your purchase — no account needed.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Shipping form */}
          <div className="lg:col-span-7">
            <h2 className="font-display font-bold text-2xl text-white mb-6">
              Shipping <span className="text-[#ff6b00]">Details</span>
            </h2>

            <form id="pay-link-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={set("firstName")}
                    placeholder="Enter first name"
                    required
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={set("lastName")}
                    placeholder="Enter last name"
                    required
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={set("address")}
                  placeholder="House/flat number, street name"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={set("city")}
                    placeholder="Lagos"
                    required
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={set("state")}
                    required
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all appearance-none"
                  >
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={set("email")}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={set("phone")}
                  placeholder="+234 800 000 0000"
                  required
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all"
                />
              </div>

              {/* Coupon code — visible, disabled, coming soon */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                  <Tag className="h-3 w-3" /> Coupon Code
                  <span className="bg-[#2a2a2a] text-[#9a9898] text-[8px] px-2 py-0.5 rounded-full tracking-widest normal-case font-semibold">
                    Coming soon
                  </span>
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Coming soon"
                  className="w-full bg-[#0a0a0a]/50 border border-[#1a1a1a] text-[#353534] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm cursor-not-allowed"
                />
              </div>
            </form>
          </div>

          {/* RIGHT: Order summary + submit */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-6">
              <h2 className="font-display font-bold text-lg text-white mb-5">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {link.items.map((item) => {
                  const qty = quantities[item.product_id] ?? item.default_quantity
                  return (
                    <div key={item.product_id} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-[#111111] border border-[#353534]">
                        <Image
                          src={item.product.image_url || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#e5e2e1] line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#9a9898]">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => adjustQuantity(item.product_id, -1)}
                          className="w-7 h-7 rounded-md border border-[#353534] text-[#9a9898] hover:border-[#ff6b00] hover:text-[#ff6b00] flex items-center justify-center transition-all"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold text-white w-5 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => adjustQuantity(item.product_id, 1)}
                          className="w-7 h-7 rounded-md border border-[#353534] text-[#9a9898] hover:border-[#ff6b00] hover:text-[#ff6b00] flex items-center justify-center transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-white/5">
                <span className="font-display font-semibold text-white">Total</span>
                <span className="font-display font-extrabold text-3xl text-[#ff6b00] leading-none">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-7">
              <div className="flex items-center gap-2.5 p-3.5 bg-[#131313] rounded-lg border border-[#353534] mb-5">
                <ShieldCheck className="h-4 w-4 text-[#ff6b00] flex-shrink-0" />
                <p className="text-[11px] font-semibold tracking-wide text-[#9a9898]">
                  You&apos;ll get a dedicated bank account number to complete payment — no account
                  or login required.
                </p>
              </div>

              <button
                type="submit"
                form="pay-link-form"
                disabled={isProcessing}
                className="w-full bg-[#ff6b00] text-white font-display font-bold text-sm tracking-widest py-5 rounded-lg flex items-center justify-center gap-2 glow-hover transition-all active:scale-95 hover:bg-[#ff8533] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    CONTINUE TO PAYMENT
                    <Zap className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <PayFooter />
    </div>
  )
}
