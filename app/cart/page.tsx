"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart()

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)

  const shipping = totalPrice >= 100_000 ? 0 : 2_500
  const tax = totalPrice * 0.075
  const total = totalPrice + shipping + tax

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Header />
        <main className="max-w-[1280px] mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#111111] border border-[#353534] flex items-center justify-center mb-8">
            <ShoppingBag className="h-10 w-10 text-[#9a9898]" />
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-3">
            Your Terminal is Empty
          </h1>
          <p className="text-[#9a9898] mb-10 max-w-sm">
            No gear loaded. Head to the collection and pick your arsenal.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95 hover:bg-[#ff8533]"
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
        {/* Page title */}
        <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-12">
          Your Terminal{" "}
          <span className="text-[#ff6b00]">/ Cart</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-8">
            {/* Desktop column header */}
            <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-white/5 mb-2">
              <div className="col-span-6 text-[10px] font-bold tracking-[0.18em] text-[#9a9898] uppercase">Product</div>
              <div className="col-span-2 text-center text-[10px] font-bold tracking-[0.18em] text-[#9a9898] uppercase">Quantity</div>
              <div className="col-span-3 text-right text-[10px] font-bold tracking-[0.18em] text-[#9a9898] uppercase">Price</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-4 hover:border-[#ff6b00]/30 transition-colors"
                >
                  {/* Product info */}
                  <div className="col-span-1 md:col-span-6 flex items-center gap-5">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-[#111111] border border-[#353534] rounded overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.id}`}
                        className="font-display font-semibold text-[#e5e2e1] hover:text-[#ff6b00] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[11px] font-semibold tracking-widest text-[#9a9898] mt-1 uppercase">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  {/* Qty stepper */}
                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                    <div className="flex items-center border border-[#353534] rounded-lg overflow-hidden h-9">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 h-full text-[#9a9898] hover:text-white hover:bg-[#353534] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-4 text-sm font-bold text-white tabular-nums min-w-[2.5rem] text-center">
                        {String(item.quantity).padStart(2, "0")}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 h-full text-[#9a9898] hover:text-white hover:bg-[#353534] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 md:col-span-3 text-left md:text-right">
                    <p className="font-display font-bold text-lg text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-[11px] text-[#9a9898] tracking-wide">
                        {formatPrice(item.price)} each
                      </p>
                    )}
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 md:col-span-1 flex md:justify-end">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#9a9898] hover:text-red-400 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue shopping link */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 mt-8 text-sm text-[#9a9898] hover:text-[#ff6b00] transition-colors font-semibold tracking-wide"
            >
              ← CONTINUE SHOPPING
            </Link>
          </div>

          {/* ── Manifest / Order Summary ── */}
          <div className="lg:col-span-4">
            <div className="bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg p-8 sticky top-24">
              <h2 className="font-display font-bold text-xl text-white mb-6 pb-4 border-b border-white/5">
                Manifest
              </h2>

              {/* Line items */}
              <div className="space-y-3.5 mb-8">
                <div className="flex justify-between text-sm text-[#9a9898]">
                  <span>Subtotal</span>
                  <span className="text-[#e5e2e1]">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#9a9898]">
                  <span>Priority Shipping</span>
                  <span className="text-[#e5e2e1]">
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-[#9a9898]">
                  <span>Tax (7.5%)</span>
                  <span className="text-[#e5e2e1]">{formatPrice(tax)}</span>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="font-display font-semibold text-white">Total Order</span>
                  <span className="font-display font-extrabold text-3xl text-[#ff6b00] leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* SSL badge */}
              <div className="flex items-center gap-2.5 p-3.5 bg-[#131313] rounded-lg border border-[#353534] mb-5">
                <ShieldCheck className="h-4 w-4 text-[#ff6b00] flex-shrink-0" />
                <p className="text-[11px] font-semibold tracking-wide text-[#9a9898]">
                  Secure checkout verified via 256-bit SSL
                </p>
              </div>

              {/* Proceed CTA */}
              <Link href="/checkout">
                <button className="w-full bg-[#ff6b00] text-white font-display font-bold text-sm tracking-widest py-5 rounded-lg flex items-center justify-center gap-2 glow-hover transition-all active:scale-95 hover:bg-[#ff8533]">
                  PROCEED TO CHECKOUT
                  <Zap className="h-4 w-4" />
                </button>
              </Link>

              {/* Decorative encrypted watermark */}
              <div className="mt-6 opacity-20 select-none overflow-hidden">
                <div className="border-t border-[#ff6b00]/30 mb-1" />
                <p className="text-[8px] font-mono tracking-tighter text-[#9a9898] whitespace-nowrap">
                  SYSTEM_STATUS: ENCRYPTED // TRANSACTION_ID: ORN-99821-X // AES-256-GCM
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
