"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart, type Watch } from "@/lib/cart-context"
import { toast } from "sonner"

interface ProductCardProps {
  watch: Watch
}

export function ProductCard({ watch }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(watch)
    toast.success(`${watch.name} added to cart`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card className="group overflow-hidden border-border bg-card hover:shadow-lg transition-shadow">
      <Link href={`/products/${watch.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={watch.image}
            alt={watch.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {watch.originalPrice && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
              SALE
            </span>
          )}
          {!watch.inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${watch.id}`}>
          <h3 className="font-medium text-card-foreground hover:text-primary transition-colors line-clamp-1">
            {watch.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{watch.category}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-card-foreground">
            {formatPrice(watch.price)}
          </span>
          {watch.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(watch.originalPrice)}
            </span>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={!watch.inStock}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}
