"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { categoriesApi } from "@/services/categories"
import { productsApi } from "@/services/products"
import { apiProductsToWatches } from "@/lib/product-mapper"
import type { Watch } from "@/lib/cart-context"

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [categoryNames, setCategoryNames] = useState<string[]>(["All"])
  const [watches, setWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)

  const apiSort = useMemo(() => {
    switch (sortBy) {
      case "price-low":
        return { sort_by: "price", sort_order: "asc" as const }
      case "price-high":
        return { sort_by: "price", sort_order: "desc" as const }
      case "name":
        return { sort_by: "name", sort_order: "asc" as const }
      default:
        return { sort_by: "created_at", sort_order: "desc" as const }
    }
  }, [sortBy])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const categories = await categoriesApi.getCategories()
        if (cancelled) return
        setCategoryNames(["All", ...categories.map((c) => c.name)])
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load categories")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const products = await productsApi.getProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          ...apiSort,
        })
        if (!cancelled) setWatches(apiProductsToWatches(products))
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load products")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedCategory, searchQuery, apiSort])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif text-foreground">Our Collection</h1>
            <p className="text-muted-foreground mt-1">
              Discover our premium wrist watches
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Category</h3>
                    <div className="flex flex-col gap-2">
                      {categoryNames.map((category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category ? "default" : "outline"
                          }
                          onClick={() => setSelectedCategory(category)}
                          className="justify-start"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Sort By</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold mb-4 text-foreground">Categories</h3>
              <div className="flex flex-col gap-2">
                {categoryNames.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category)}
                    className="justify-start"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[320px] rounded-lg border border-border bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            ) : watches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No watches found matching your criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {watches.map((watch) => (
                  <ProductCard key={watch.id} watch={watch} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
