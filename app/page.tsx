import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TrustBadges } from "@/components/trust-badges"
import { ProductCard } from "@/components/product-card"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"
import { watches } from "@/lib/watches"

export default function HomePage() {
  const featuredWatches = watches.slice(0, 8)

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
              {featuredWatches.map((watch) => (
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
