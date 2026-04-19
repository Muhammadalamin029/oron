"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Star,
} from "lucide-react"
import { productsApi } from "@/services/products"
import { apiProductToWatch, apiProductsToWatches } from "@/lib/product-mapper"
import type { Watch } from "@/lib/cart-context"
import { reviewsApi } from "@/services/reviews"
import type { Review } from "@/types/api"
import { useAuth } from "@/contexts/auth-context"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [reviewForm, setReviewForm] = useState({
    rating: "5",
    title: "",
    comment: "",
  })
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

        const categoryName = product.category?.name
        if (categoryName) {
          const relatedProducts = await productsApi.getProducts({
            category: categoryName,
            limit: 5,
          })
          if (!cancelled) {
            setRelatedWatches(
              apiProductsToWatches(relatedProducts)
                .filter((p) => p.id !== id)
                .slice(0, 4)
            )
          }
        } else {
          if (!cancelled) setRelatedWatches([])
        }
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load product")
        if (!cancelled) setWatch(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setReviewsLoading(true)
        const data = await reviewsApi.getProductReviews(id)
        if (!cancelled) setReviews(data)
      } catch (error) {
        if (!cancelled) setReviews([])
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!watch) return
    for (let i = 0; i < quantity; i++) {
      addToCart(watch)
    }
    toast.success(`${quantity} x ${watch.name} added to cart`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    )
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="h-6 w-32 bg-muted/40 rounded animate-pulse mb-8" />
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square rounded-lg bg-muted/40 animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-24 bg-muted/40 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-muted/40 rounded animate-pulse" />
              <div className="h-8 w-40 bg-muted/40 rounded animate-pulse" />
              <div className="h-24 w-full bg-muted/40 rounded animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!watch) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif text-foreground mb-3">
            Product not found
          </h1>
          <Link href="/products">
            <Button className="bg-primary text-primary-foreground">
              Back to Collection
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
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

        <section className="mt-16">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif text-foreground">Reviews</h2>
              <p className="text-muted-foreground mt-1">
                {reviews.length > 0
                  ? `${reviews.length} review(s) • ${averageRating.toFixed(1)} / 5`
                  : "No reviews yet."}
              </p>
            </div>
            {reviews.length > 0 && renderStars(Math.round(averageRating))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {reviewsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-lg border border-border bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-lg border border-border p-6 text-muted-foreground">
                  Be the first to review this product.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {r.title || "Review"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {r.user?.full_name || "Customer"} •{" "}
                            {r.created_at
                              ? new Date(r.created_at).toLocaleDateString("en-NG")
                              : ""}
                          </p>
                        </div>
                        {renderStars(r.rating)}
                      </div>
                      {r.comment && (
                        <p className="text-sm text-muted-foreground mt-3 whitespace-pre-line">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border p-6 bg-card">
              <h3 className="font-semibold text-foreground mb-4">
                Write a review
              </h3>
              {!isAuthenticated ? (
                <div className="text-sm text-muted-foreground">
                  Please{" "}
                  <Link className="text-primary hover:underline" href={`/auth/login?next=${encodeURIComponent(`/products/${id}`)}`}>
                    sign in
                  </Link>{" "}
                  to leave a review.
                </div>
              ) : user && !user.is_verified ? (
                <div className="text-sm text-muted-foreground">
                  Verify your email to leave a review.
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      setSubmittingReview(true)
                      await reviewsApi.createReview({
                        product_id: id,
                        rating: Number(reviewForm.rating),
                        title: reviewForm.title,
                        comment: reviewForm.comment,
                      })
                      toast.success("Review submitted for approval")
                      setReviewForm({ rating: "5", title: "", comment: "" })
                      const data = await reviewsApi.getProductReviews(id)
                      setReviews(data)
                    } catch (error: any) {
                      toast.error(error?.message || "Failed to submit review")
                    } finally {
                      setSubmittingReview(false)
                    }
                  }}
                >
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <Select
                      value={reviewForm.rating}
                      onValueChange={(v) =>
                        setReviewForm((p) => ({ ...p, rating: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {["5", "4", "3", "2", "1"].map((v) => (
                          <SelectItem key={v} value={v}>
                            {v} star{v === "1" ? "" : "s"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review-title">Title</Label>
                    <Input
                      id="review-title"
                      value={reviewForm.title}
                      onChange={(e) =>
                        setReviewForm((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="Short summary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review-comment">Comment</Label>
                    <Textarea
                      id="review-comment"
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((p) => ({
                          ...p,
                          comment: e.target.value,
                        }))
                      }
                      placeholder="Share details about your experience"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-primary text-primary-foreground"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
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
