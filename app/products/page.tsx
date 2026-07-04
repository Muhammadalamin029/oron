"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Search, ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { categoriesApi } from "@/services/categories"
import { productsApi } from "@/services/products"
import { apiProductsToWatches } from "@/lib/product-mapper"
import type { Watch } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

const sortOptions = [
  { value: "featured", label: "Sort by: Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
]

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [categoryNames, setCategoryNames] = useState<string[]>(["All"])
  const [watches, setWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOpen, setSortOpen] = useState(false)

  const apiSort = useMemo(() => {
    switch (sortBy) {
      case "price-low":  return { sort_by: "price", sort_order: "asc" as const }
      case "price-high": return { sort_by: "price", sort_order: "desc" as const }
      case "name":       return { sort_by: "name", sort_order: "asc" as const }
      default:           return { sort_by: "created_at", sort_order: "desc" as const }
    }
  }, [sortBy])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cats = await categoriesApi.getCategories()
        if (!cancelled) setCategoryNames(["All", ...cats.map((c) => c.name)])
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load categories")
      }
    })()
    return () => { cancelled = true }
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
      } catch (err: any) {
        if (!cancelled) toast.error(err?.message || "Failed to load products")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [selectedCategory, searchQuery, apiSort])

  const currentSortLabel = sortOptions.find((s) => s.value === sortBy)?.label || "Sort by: Newest"
  const hasActiveFilters = selectedCategory !== "All" || searchQuery !== ""

  return (
    <div className="min-h-screen bg-[#131313]">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 pt-28 pb-24">
        {/* ── Collection Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white">
              Our <span className="text-[#ff6b00]">Collection</span>
            </h1>
            <p className="text-[#9a9898] mt-2 text-sm">
              Premium tech accessories engineered for performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative group flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9898] group-focus-within:text-[#ff6b00] transition-colors" />
              <input
                placeholder="Filter techware..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e0e0e] border border-[#353534]/30 text-[#e5e2e1] placeholder:text-[#9a9898] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
              />
            </div>

            {/* Sort dropdown — desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 bg-[#0e0e0e] border border-[#353534]/30 text-[#e5e2e1] text-sm px-4 py-2.5 rounded-lg hover:border-[#ff6b00] transition-colors w-[200px] justify-between"
              >
                <span className="truncate">{currentSortLabel}</span>
                <ChevronDown className={cn("h-4 w-4 text-[#9a9898] transition-transform flex-shrink-0", sortOpen && "rotate-180")} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-30 bg-[#111111] border border-[#353534] rounded-lg overflow-hidden shadow-2xl min-w-[200px]">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm hover:bg-[#1c1b1b] transition-colors",
                          sortBy === opt.value ? "text-[#ff6b00] font-semibold" : "text-[#c6c6c6]"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile filter drawer */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden flex items-center gap-2 bg-[#0e0e0e] border border-[#353534]/30 text-[#c6c6c6] text-sm px-4 py-2.5 rounded-lg hover:border-[#ff6b00] transition-colors">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
              </SheetTrigger>
              <SheetContent className="bg-[#111111] border-l border-[#353534]">
                <SheetHeader>
                  <SheetTitle className="font-display text-white">Filters &amp; Sort</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-8">
                  <div>
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b00] uppercase mb-4">Categories</h3>
                    <div className="flex flex-col gap-1.5">
                      {categoryNames.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            "text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                            selectedCategory === cat ? "bg-[#ff6b00] text-white" : "text-[#c6c6c6] hover:bg-white/5"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#ff6b00] uppercase mb-4">Sort By</h3>
                    <div className="flex flex-col gap-1.5">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={cn(
                            "text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                            sortBy === opt.value ? "bg-[#ff6b00] text-white" : "text-[#c6c6c6] hover:bg-white/5"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* ── Category pills (horizontal scroll) ── */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scroll-hide">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold tracking-wider whitespace-nowrap transition-all flex-shrink-0 border",
                selectedCategory === cat
                  ? "bg-[#ff6b00]/10 border-[#ff6b00]/20 text-[#ff6b00]"
                  : "bg-[#111111] border-[#353534]/20 text-[#c6c6c6] hover:border-[#ff6b00]/30 hover:text-[#ff6b00]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Active filters bar ── */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scroll-hide">
            <span className="text-[#9a9898] text-[11px] font-bold tracking-widest whitespace-nowrap uppercase">Active:</span>
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 hover:bg-[#ff6b00]/20 transition-all"
              >
                {selectedCategory} <X className="h-3 w-3" />
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 hover:bg-[#ff6b00]/20 transition-all"
              >
                &quot;{searchQuery}&quot; <X className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery("") }}
              className="text-[#9a9898] hover:text-[#ff6b00] transition-colors text-[11px] font-bold tracking-wide ml-2 underline underline-offset-4"
            >
              Clear All
            </button>
          </div>
        )}

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-[#111111] border border-[#353534]/20 rounded-xl overflow-hidden">
                <div className="h-72 bg-[#1c1b1b] animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-3/4 bg-[#1c1b1b] rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#1c1b1b] rounded animate-pulse" />
                  <div className="h-8 w-full bg-[#1c1b1b] rounded animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : watches.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-6">
              <RotateCcw className="h-10 w-10 text-[#353534]" />
            </div>
            <h2 className="font-display font-bold text-3xl text-white mb-2">
              No products found
            </h2>
            <p className="text-[#9a9898] text-sm mb-8 max-w-md leading-relaxed">
              We couldn&apos;t find any techware matching your current filter configuration.
              Try adjusting your parameters or search terms.
            </p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery("") }}
              className="bg-[#ff6b00] text-white font-bold text-xs tracking-widest px-8 py-3 rounded-lg glow-hover transition-all active:scale-95 hover:bg-[#ff8533]"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {watches.map((watch) => (
              <ProductCard key={watch.id} watch={watch} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
