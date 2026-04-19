"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TrustBadges } from "@/components/trust-badges"
import { ProductCard } from "@/components/product-card"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { productsApi } from "@/services/products"
import { apiProductsToWatches } from "@/lib/product-mapper"
import type { Watch } from "@/lib/cart-context"

export default function HomePage() {
  const [featuredWatches, setFeaturedWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const products = await productsApi.getProducts({ limit: 8 })
        if (!cancelled) setFeaturedWatches(apiProductsToWatches(products))
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load products")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TrustBadges />

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 text-foreground">
              Product Grilles
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[320px] rounded-lg border border-border bg-muted/30 animate-pulse"
                    />
                  ))
                : featuredWatches.map((watch) => (
                    <ProductCard key={watch.id} watch={watch} />
                  ))}
            </div>
          </div>
        </section>

        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
