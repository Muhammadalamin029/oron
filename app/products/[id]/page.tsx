"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import {
  ChevronLeft, Minus, Plus, Shield, Award, Truck,
  CheckCircle, Star, ShoppingBag, Zap,
} from "lucide-react"
import { productsApi } from "@/services/products"
import { apiProductToWatch, apiProductsToWatches } from "@/lib/product-mapper"
import type { Watch } from "@/lib/cart-context"
import { reviewsApi } from "@/services/reviews"
import type { Review } from "@/types/api"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [watch, setWatch] = useState<Watch | null>(null)
  const [relatedWatches, setRelatedWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: "5", title: "", comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const product = await productsApi.getProduct(id)
        if (cancelled) return
        const mapped = apiProductToWatch(product)
        setWatch(mapped)
        const catName = product.category?.name
        if (catName) {
          const related = await productsApi.getProducts({ category: catName, limit: 5 })
          if (!cancelled) setRelatedWatches(apiProductsToWatches(related).filter((p) => p.id !== id).slice(0, 4))
        }
      } catch (err: any) {
        if (!cancelled) { toast.error(err?.message || "Failed to load product"); setWatch(null) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setReviewsLoading(true)
        const data = await reviewsApi.getProductReviews(id)
        if (!cancelled) setReviews(data)
      } catch { if (!cancelled) setReviews([]) }
      finally { if (!cancelled) setReviewsLoading(false) }
    })()
    return () => { cancelled = true }
  }, [id])

  const fmt = (p: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(p)

  const handleAddToCart = () => {
    if (!watch) return
    for (let i = 0; i < quantity; i++) addToCart(watch)
    toast.success(`${quantity} × ${watch.name} added to cart`)
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-4 w-4", i < rating ? "text-[#ff6b00] fill-[#ff6b00]" : "text-[#353534]")} />
      ))}
    </div>
  )

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Header />
        <main className="max-w-[1280px] mx-auto px-6 pt-28 pb-24">
          <div className="h-5 w-36 bg-[#1c1b1b] rounded animate-pulse mb-10" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square rounded-lg bg-[#111111] animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-24 bg-[#1c1b1b] rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-[#1c1b1b] rounded animate-pulse" />
              <div className="h-8 w-40 bg-[#1c1b1b] rounded animate-pulse" />
              <div className="h-24 w-full bg-[#1c1b1b] rounded animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Not found ── */
  if (!watch) {
    return (
      <div className="min-h-screen bg-[#131313]">
        <Header />
        <main className="max-w-[1280px] mx-auto px-6 pt-32 pb-24 text-center">
          <h1 className="font-display font-bold text-3xl text-white mb-4">Product not found</h1>
          <Link href="/products" className="inline-flex items-center gap-2 bg-[#ff6b00] text-white font-bold text-sm tracking-widest px-8 py-3 rounded-full glow-hover transition-all active:scale-95">
            BACK TO COLLECTION
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
        {/* Breadcrumb */}
        <Link href="/products" className="inline-flex items-center gap-1 text-[#9a9898] hover:text-[#ff6b00] transition-colors text-sm font-semibold tracking-wide mb-10">
          <ChevronLeft className="h-4 w-4" /> BACK TO COLLECTION
        </Link>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
          {/* ── Image column ── */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#111111] border border-[#353534]">
              <Image src={watch.image} alt={watch.name} fill className="object-cover" priority />
              {watch.originalPrice && (
                <span className="absolute top-4 left-4 bg-[#ff6b00] text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded">SALE</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-[#111111] border border-[#353534] hover:border-[#ff6b00] cursor-pointer transition-colors">
                  <Image src={watch.image} alt={`${watch.name} view ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Detail column ── */}
          <div>
            <span className="text-[#ff6b00] text-[10px] font-bold tracking-[0.25em] uppercase block mb-2">{watch.brand || watch.category}</span>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-5">{watch.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="font-display font-extrabold text-3xl text-white">{fmt(watch.price)}</span>
              {watch.originalPrice && (
                <span className="text-lg text-[#9a9898] line-through">{fmt(watch.originalPrice)}</span>
              )}
            </div>

            <p className="text-[#c6c6c6] text-sm leading-relaxed mb-8">{watch.description}</p>

            {/* Trust badges */}
            <div className="space-y-3 mb-8 p-5 bg-[#111111] rounded-lg border border-[#353534]">
              {[
                { icon: Shield, text: "Authenticity Guaranteed" },
                { icon: Award, text: "2-Year Warranty" },
                { icon: Truck, text: "Nationwide Delivery" },
                { icon: CheckCircle, text: watch.inStock ? "In Stock — Ready to Ship" : "Currently Out of Stock" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#ff6b00] flex-shrink-0" />
                  <span className="text-sm text-[#c6c6c6]">{text}</span>
                </div>
              ))}
            </div>

            {/* Quantity + CTA */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">Qty:</span>
              <div className="flex items-center border border-[#353534] rounded-lg overflow-hidden h-10">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="px-3 h-full text-[#9a9898] hover:text-white hover:bg-[#353534] transition-colors disabled:opacity-30">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-5 text-sm font-bold text-white tabular-nums">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 h-full text-[#9a9898] hover:text-white hover:bg-[#353534] transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!watch.inStock}
                className="flex-1 bg-[#ff6b00] text-white font-bold text-sm tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 glow-hover transition-all active:scale-95 hover:bg-[#ff8533] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4 w-4" /> ADD TO CART
              </button>
              <Link href="/checkout" className="flex-1">
                <button disabled={!watch.inStock} className="w-full border border-[#353534] text-[#c6c6c6] hover:border-[#ff6b00] hover:text-[#ff6b00] font-bold text-sm tracking-widest py-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Zap className="h-4 w-4" /> BUY NOW
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Related ── */}
        {relatedWatches.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="font-display font-bold text-2xl text-white">Related Gear</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#353534] to-transparent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {relatedWatches.map((rw) => <ProductCard key={rw.id} watch={rw} />)}
            </div>
          </section>
        )}

        {/* ── Reviews ── */}
        <section className="mt-20">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Reviews</h2>
              <p className="text-[#9a9898] text-sm mt-1">
                {reviews.length > 0 ? `${reviews.length} review(s) • ${avgRating.toFixed(1)} / 5` : "No reviews yet."}
              </p>
            </div>
            {reviews.length > 0 && renderStars(Math.round(avgRating))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Review list */}
            <div className="space-y-4">
              {reviewsLoading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-[#111111] border border-[#353534] animate-pulse" />)
              ) : reviews.length === 0 ? (
                <div className="rounded-lg border border-[#353534] p-6 text-[#9a9898] text-sm">Be the first to review this product.</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="rounded-lg bg-[#111111] border border-[#353534] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#e5e2e1]">{r.title || "Review"}</p>
                        <p className="text-[11px] text-[#9a9898] mt-0.5">
                          {r.user?.full_name || "Customer"} • {r.created_at ? new Date(r.created_at).toLocaleDateString("en-NG") : ""}
                        </p>
                      </div>
                      {renderStars(r.rating)}
                    </div>
                    {r.comment && <p className="text-sm text-[#c6c6c6] mt-3 whitespace-pre-line">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Write review */}
            <div className="rounded-lg bg-[#111111] border border-[#353534] p-6">
              <h3 className="font-display font-semibold text-white mb-4">Write a Review</h3>
              {!isAuthenticated ? (
                <p className="text-sm text-[#9a9898]">
                  Please <Link className="text-[#ff6b00] hover:underline" href={`/auth/login?next=${encodeURIComponent(`/products/${id}`)}`}>sign in</Link> to leave a review.
                </p>
              ) : user && !user.is_verified ? (
                <p className="text-sm text-[#9a9898]">Verify your email to leave a review.</p>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      setSubmittingReview(true)
                      await reviewsApi.createReview({ product_id: id, rating: Number(reviewForm.rating), title: reviewForm.title, comment: reviewForm.comment })
                      toast.success("Review submitted for approval")
                      setReviewForm({ rating: "5", title: "", comment: "" })
                      const data = await reviewsApi.getProductReviews(id)
                      setReviews(data)
                    } catch (err: any) { toast.error(err?.message || "Failed to submit review") }
                    finally { setSubmittingReview(false) }
                  }}
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">Rating</label>
                    <select value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))} className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none">
                      {["5","4","3","2","1"].map((v) => <option key={v} value={v}>{v} star{v === "1" ? "" : "s"}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">Title</label>
                    <input value={reviewForm.title} onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))} placeholder="Short summary" className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">Comment</label>
                    <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} placeholder="Share your experience..." rows={3} className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={submittingReview} className="bg-[#ff6b00] text-white font-bold text-xs tracking-widest px-6 py-3 rounded-lg glow-hover transition-all active:scale-95 disabled:opacity-50">
                    {submittingReview ? "SUBMITTING..." : "SUBMIT REVIEW"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
