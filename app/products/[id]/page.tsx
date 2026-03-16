"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { watches } from "@/lib/watches"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import {
  ChevronLeft,
  Minus,
  Plus,
  Shield,
  Award,
  CheckCircle,
  Truck,
} from "lucide-react"
import { useState } from "react"

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const watch = watches.find((w) => w.id === id)
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!watch) {
    notFound()
  }

  const relatedWatches = watches
    .filter((w) => w.category === watch.category && w.id !== watch.id)
    .slice(0, 4)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(watch)
    }
    toast.success(`${quantity} x ${watch.name} added to cart`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/products"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Collection
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={watch.image}
                alt={watch.name}
                fill
                className="object-cover"
                priority
              />
              {watch.originalPrice && (
                <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-medium px-3 py-1 rounded">
                  SALE
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary cursor-pointer transition-colors"
                >
                  <Image
                    src={watch.image}
                    alt={`${watch.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-primary font-medium mb-2">
              {watch.brand}
            </p>
            <h1 className="text-3xl font-serif text-foreground mb-4">
              {watch.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(watch.price)}
              </span>
              {watch.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(watch.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {watch.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">
                  Authenticity Guaranteed
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">
                  Free Shipping Nationwide
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">
                  {watch.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">
                Quantity:
              </span>
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!watch.inStock}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-6"
                size="lg"
              >
                Add to Cart
              </Button>
              <Link href="/checkout" className="flex-1">
                <Button
                  variant="outline"
                  disabled={!watch.inStock}
                  className="w-full py-6"
                  size="lg"
                >
                  Buy Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {relatedWatches.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-serif text-foreground mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedWatches.map((relatedWatch) => (
                <ProductCard key={relatedWatch.id} watch={relatedWatch} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
