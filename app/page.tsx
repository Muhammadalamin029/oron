"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import {
  Smartphone,
  Watch,
  Ear,
  BatteryCharging,
  Headphones,
  Camera,
  ChevronRight,
} from "lucide-react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TrustBadges } from "@/components/trust-badges"
import { ProductCard } from "@/components/product-card"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { productsApi } from "@/services/products"
import { apiProductsToWatches } from "@/lib/product-mapper"
import type { Watch as WatchType } from "@/lib/cart-context"
import { getErrorMessage } from "@/lib/get-error-message"

const categories = [
  { icon: Smartphone,     label: "Smartphones",   href: "/products" },
  { icon: Watch,          label: "Smartwatches",  href: "/products" },
  { icon: Ear,            label: "Earbuds",       href: "/products" },
  { icon: BatteryCharging,label: "Power Banks",   href: "/products" },
  { icon: Headphones,     label: "Headphones",    href: "/products" },
  { icon: Camera,         label: "Action Cameras",href: "/products" },
]

export default function HomePage() {
  const [featuredWatches, setFeaturedWatches] = useState<WatchType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const products = await productsApi.getProducts({ limit: 8 })
        if (!cancelled) setFeaturedWatches(apiProductsToWatches(products))
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load products"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-[#131313]">
      <Header />

      <main>
        {/* ── Hero Carousel ── */}
        <Hero />

        {/* ── Trust Badges ── */}
        <TrustBadges />

        {/* ── Category Pills ── */}
        <section className="py-16 max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-3xl text-white">
              Categories
            </h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-[#ff6b00] text-xs font-bold tracking-widest hover:gap-2 transition-all"
            >
              VIEW ALL <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Scrollable pill row */}
          <div className="flex gap-3 overflow-x-auto pb-3 scroll-hide">
            {categories.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#111111] border border-[#353534] hover:border-[#ff6b00] transition-colors group flex-shrink-0"
              >
                <Icon className="h-4 w-4 text-[#9a9898] group-hover:text-[#ff6b00] transition-colors flex-shrink-0" />
                <span className="text-xs font-bold tracking-wider text-[#c6c6c6] group-hover:text-white transition-colors whitespace-nowrap">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Gear Grid ── */}
        <section className="py-4 pb-20 max-w-[1280px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-display font-bold text-3xl text-white">
              Engineered Gear
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#353534] to-transparent" />
            <Link
              href="/products"
              className="text-[#ff6b00] text-xs font-bold tracking-widest hover:text-[#ff8533] transition-colors flex-shrink-0"
            >
              SEE ALL
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[340px] rounded-lg bg-[#111111] border border-[#353534] animate-pulse"
                  />
                ))
              : featuredWatches.map((watch) => (
                  <ProductCard key={watch.id} watch={watch} />
                ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <Testimonials />

        {/* ── Newsletter (baked into footer, but also shown inline per design) ── */}
      </main>

      <Footer />
    </div>
  )
}
