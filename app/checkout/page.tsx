"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { ordersApi } from "@/services/orders"
import { checkoutApi } from "@/services/checkout"
import { ApiError } from "@/lib/api"
import { toast } from "sonner"
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ChevronLeft,
  Lock,
  Mail,
} from "lucide-react"
import { getErrorMessage } from "@/lib/get-error-message"

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const paymentMethods = [
  { id: "VISA", label: "Visa" },
  { id: "MASTERCARD", label: "Mastercard" },
  { id: "APPLE_PAY", label: "Apple Pay" },
  { id: "BANK_TRANSFER", label: "Bank Transfer" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [guestConfirmation, setGuestConfirmation] = useState<{ email: string } | null>(null)
  const [emailConflict, setEmailConflict] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "Lagos",
    postalCode: "",
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)

  const shipping = totalPrice >= 100_000 ? 0 : 2_500
  const tax = totalPrice * 0.075
  const total = totalPrice + shipping + tax

  useEffect(() => {
    if (user) {
      const parts = user.full_name?.split(" ") || []
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(" ") || prev.lastName,
      }))
    }
  }, [user])

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailConflict(false)
    setIsProcessing(true)
    try {
      if (isAuthenticated) {
        const order = await ordersApi.createOrder({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        })
        await ordersApi.upsertShippingInfo(order.id, {
          email: formData.email,
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: "Nigeria",
        })
        clearCart()
        router.push(`/orders/${order.id}`)
        return
      }

      const result = await checkoutApi.guestCheckout({
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
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
      clearCart()
      setGuestConfirmation({ email: result.email })
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

  /* ── Guest checkout: check-your-email confirmation ── */
  if (guestConfirmation) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Header />
        <main className="max-w-[1280px] mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#ff6b00]/10 flex items-center justify-center mb-6">
            <Mail className="h-7 w-7 text-[#ff6b00]" />
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-4">
            Check Your Email
          </h1>
          <p className="text-[#9a9898] max-w-md mb-10">
            We've sent a link to <span className="text-white font-semibold">{guestConfirmation.email}</span>{" "}
            to verify your email and set a password. Once you do, you&apos;ll be taken straight to your order.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95"
          >
            CONTINUE SHOPPING <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Guest checkout: email already has an account ── */
  if (emailConflict) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Header />
        <main className="max-w-[1280px] mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <h1 className="font-display font-bold text-4xl text-white mb-4">
            Account Already Exists
          </h1>
          <p className="text-[#9a9898] max-w-md mb-10">
            An account already exists for {formData.email || "this email"}. Log in to continue checking out.
          </p>
          <Link
            href={`/auth/login?next=${encodeURIComponent("/checkout")}`}
            className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95"
          >
            LOG IN TO CONTINUE <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Empty cart guard ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Header />
        <main className="max-w-[1280px] mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <h1 className="font-display font-bold text-4xl text-white mb-4">
            Nothing to Check Out
          </h1>
          <p className="text-[#9a9898] mb-10">Your cart is empty. Add some gear first.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95"
          >
            BROWSE GEAR <ArrowRight className="h-4 w-4" />
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 pt-28 pb-24">
        {/* Back link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-[#9a9898] hover:text-[#ff6b00] transition-colors text-sm font-semibold tracking-wide mb-10"
        >
          <ChevronLeft className="h-4 w-4" />
          BACK TO CART
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── LEFT: Shipping form ── */}
          <div className="lg:col-span-7">
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-10">
              Shipping{" "}
              <span className="text-[#ff6b00]">Protocol</span>
            </h1>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Name row */}
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

              {/* Delivery address */}
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

              {/* City / State / Postal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase px-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={set("postalCode")}
                    placeholder="100001"
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
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
                  readOnly={!!user}
                  className={`w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]/20 transition-all ${
                    user ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Phone */}
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
            </form>
          </div>

          {/* ── RIGHT: Payment gateway + order summary ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Order mini-manifest */}
            <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-6">
              <h2 className="font-display font-bold text-lg text-white mb-5">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-[#111111] border border-[#353534]">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#ff6b00] text-white text-[9px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#e5e2e1] line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-[#9a9898]">{formatPrice(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-white flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 border-t border-white/5 pt-4">
                <div className="flex justify-between text-sm text-[#9a9898]">
                  <span>Subtotal</span>
                  <span className="text-[#e5e2e1]">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#9a9898]">
                  <span>Shipping</span>
                  <span className="text-[#e5e2e1]">{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#9a9898]">
                  <span>Tax (7.5%)</span>
                  <span className="text-[#e5e2e1]">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-white/5">
                  <span className="font-display font-semibold text-white">Total Order</span>
                  <span className="font-display font-extrabold text-3xl text-[#ff6b00] leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment gateway card */}
            <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-7">
              <h2 className="font-display font-bold text-lg text-white mb-6">
                Payment{" "}
                <span className="text-[#ff6b00]">Gateway</span>
              </h2>

              {/* Paystack panel */}
              <div className="bg-[#111111] border border-[#353534] rounded-xl p-6 flex flex-col items-center text-center mb-6">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#09A5DB] flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-xl text-white">Paystack</span>
                </div>
                <p className="text-sm text-[#9a9898] leading-relaxed">
                  {isAuthenticated
                    ? "We'll generate a dedicated bank account number on your order page — transfer the exact amount to complete your purchase."
                    : "After this step, verify your email to unlock a dedicated bank account number for your payment."}
                </p>
              </div>

              {/* Accepted payment chips */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {paymentMethods.map(({ id, label }) => (
                  <span
                    key={id}
                    className="bg-[#2a2a2a] border border-[#353534] text-[#9a9898] text-[10px] font-bold px-3 py-1.5 rounded tracking-widest uppercase"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* SSL trust badge */}
              <div className="flex items-center gap-2.5 p-3.5 bg-[#131313] rounded-lg border border-[#353534] mb-5">
                <ShieldCheck className="h-4 w-4 text-[#ff6b00] flex-shrink-0" />
                <p className="text-[11px] font-semibold tracking-wide text-[#9a9898]">
                  Secure checkout verified via 256-bit SSL
                </p>
              </div>

              {/* Pay button (submits the form in the left column) */}
              <button
                type="submit"
                form="checkout-form"
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
                    {isAuthenticated ? "PLACE ORDER" : "CONTINUE"}
                    <Zap className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-[#9a9898] mt-4 leading-relaxed">
                By finalizing, you agree to our{" "}
                <Link href="/terms" className="text-[#ff6b00] hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#ff6b00] hover:underline">Privacy Policy</Link>.
              </p>

              {/* Decorative encrypted watermark */}
              <div className="mt-6 opacity-20 select-none overflow-hidden">
                <div className="border-t border-[#ff6b00]/30 mb-1" />
                <p className="text-[8px] font-mono tracking-tighter text-[#9a9898] whitespace-nowrap">
                  SYSTEM_STATUS: ENCRYPTED // TRANSACTION_ID: ORN-99821-X // ENCRYPTION_STRENGTH: AES-256-GCM // TRACE_STATUS: HIDDEN
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
