"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart, type Watch } from "@/lib/cart-context"
import { toast } from "sonner"
import { memo } from "react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  watch: Watch
}

function ProductCardImpl({ watch }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(watch)
    toast.success(`${watch.name} added to cart`, {
      description: formatPrice(watch.price),
    })
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)

  return (
    <div className="product-card group bg-[#111111] border border-[#353534] rounded-lg p-4 transition-all duration-300 flex flex-col">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden rounded-md mb-5 bg-[#1c1b1b]">
        {/* Discount badge */}
        {watch.originalPrice && (
          <span className="absolute top-3 left-3 z-10 bg-[#ff6b00] text-white text-[10px] font-bold tracking-wider px-2 py-1 rounded">
            SALE
          </span>
        )}

        {/* Out of stock overlay */}
        {!watch.inStock && (
          <div className="absolute inset-0 z-10 bg-black/70 flex items-center justify-center">
            <span className="text-[#9a9898] text-sm font-semibold tracking-widest">OUT OF STOCK</span>
          </div>
        )}

        {/* Product image */}
        <Link href={`/products/${watch.id}`}>
          <Image
            src={watch.image}
            alt={watch.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <span className="text-[#ff6b00] text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5">
          {watch.category}
        </span>

        <Link href={`/products/${watch.id}`}>
          <h3 className="font-display font-semibold text-[#e5e2e1] hover:text-[#ff6b00] transition-colors leading-tight line-clamp-1 mb-3">
            {watch.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-5">
          <span className="font-bold text-[#e5e2e1]">{formatPrice(watch.price)}</span>
          {watch.originalPrice && (
            <span className="text-sm text-[#9a9898] line-through">{formatPrice(watch.originalPrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!watch.inStock}
          className={cn(
            "mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-md text-xs font-bold tracking-widest transition-all active:scale-95",
            watch.inStock
              ? "bg-[#2a2a2a] text-[#e5e2e1] hover:bg-[#ff6b00] hover:text-white"
              : "bg-[#1c1b1b] text-[#9a9898] cursor-not-allowed"
          )}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          ADD TO CART
        </button>
      </div>
    </div>
  )
}

export const ProductCard = memo(ProductCardImpl)
