"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Search, Plus, Trash2, Copy, Check } from "lucide-react"
import { productsApi } from "@/services/products"
import { paymentLinksApi } from "@/services/payment-links"
import { formatNGN } from "@/lib/admin-utils"
import type { Product } from "@/types/api"
import { AdminPageHeader, GlassCard, OrangeButton } from "@/components/admin-ui"

type SelectedItem = {
  product: Product
  default_quantity: number
}

export default function CreatePaymentLinkPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SelectedItem[]>([])
  const [creating, setCreating] = useState(false)
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      try {
        setSearching(true)
        const res = await productsApi.searchProducts(query, { limit: 10 })
        if (!cancelled) setResults(res)
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const addProduct = (product: Product) => {
    if (selected.some((s) => s.product.id === product.id)) {
      toast.error("Already added")
      return
    }
    setSelected((prev) => [...prev, { product, default_quantity: 1 }])
    setQuery("")
    setResults([])
  }

  const removeProduct = (productId: string) => {
    setSelected((prev) => prev.filter((s) => s.product.id !== productId))
  }

  const setQuantity = (productId: string, qty: number) => {
    setSelected((prev) =>
      prev.map((s) =>
        s.product.id === productId ? { ...s, default_quantity: Math.max(1, qty) } : s,
      ),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selected.length === 0) {
      toast.error("Add at least one product")
      return
    }
    try {
      setCreating(true)
      const link = await paymentLinksApi.create({
        title,
        items: selected.map((s) => ({
          product_id: s.product.id,
          default_quantity: s.default_quantity,
        })),
      })
      setCreatedUrl(`${window.location.origin}/pay/${link.slug}`)
      toast.success("Payment link created")
    } catch (err: any) {
      toast.error(err?.message || "Failed to create payment link")
    } finally {
      setCreating(false)
    }
  }

  const copyUrl = () => {
    if (!createdUrl) return
    navigator.clipboard.writeText(createdUrl)
    setCopied(true)
    toast.success("Link copied")
    setTimeout(() => setCopied(false), 2000)
  }

  if (createdUrl) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto pb-12">
        <AdminPageHeader title="PAYMENT LINK CREATED" sub="/ READY TO SHARE" />
        <GlassCard className="p-8 text-center">
          <p className="text-[#9a9898] text-sm mb-4">
            Share this link anywhere — social media, DMs, print. No login required for the customer.
          </p>
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#353534] rounded-lg p-4 mb-6">
            <span className="flex-1 font-mono text-sm text-[#e5e2e1] truncate text-left">
              {createdUrl}
            </span>
            <button
              onClick={copyUrl}
              className="text-[#9a9898] hover:text-[#ff6b00] transition-colors flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex gap-3 justify-center">
            <OrangeButton onClick={() => router.push("/admin/payment-links")}>
              VIEW ALL LINKS
            </OrangeButton>
            <button
              onClick={() => {
                setCreatedUrl(null)
                setTitle("")
                setSelected([])
              }}
              className="border border-[#353534] text-[#9a9898] hover:text-white transition-colors px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase"
            >
              CREATE ANOTHER
            </button>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <AdminPageHeader
        title="CREATE PAYMENT LINK"
        sub="/ NEW LINK"
        action={
          <button
            onClick={() => router.push("/admin/payment-links")}
            className="border border-[#353534] text-[#9a9898] hover:text-white transition-colors px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase"
          >
            CANCEL
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <GlassCard className="p-8">
          <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
            Link Title
          </label>
          <input
            type="text"
            placeholder="e.g. Instagram Promo — July"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
          />
          <p className="text-xs text-[#9a9898] mt-1.5">For your own reference — customers won't see this.</p>
        </GlassCard>

        <GlassCard className="p-8">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-widest mb-4">
            Products
          </h3>

          <div className="relative mb-4">
            <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#353534] rounded-lg px-4 py-3 focus-within:border-[#ff6b00] transition-all">
              <Search className="h-4 w-4 text-[#9a9898] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search your product catalog..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-[#e5e2e1] placeholder:text-[#353534] text-sm focus:outline-none"
              />
            </div>
            {query.trim() && (
              <div className="absolute z-10 mt-1 w-full bg-[#111111] border border-[#353534] rounded-lg overflow-hidden shadow-xl max-h-72 overflow-y-auto">
                {searching ? (
                  <p className="p-4 text-sm text-[#9a9898]">Searching...</p>
                ) : results.length === 0 ? (
                  <p className="p-4 text-sm text-[#9a9898]">No products found</p>
                ) : (
                  results.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                    >
                      <span className="text-sm text-[#e5e2e1] truncate">{product.name}</span>
                      <span className="text-xs text-[#ff6b00] font-semibold flex-shrink-0">
                        {formatNGN(product.price)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selected.length === 0 ? (
            <p className="text-sm text-[#9a9898] py-6 text-center">
              No products added yet. Search above to add some.
            </p>
          ) : (
            <div className="space-y-3">
              {selected.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#e5e2e1] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-[#9a9898]">{formatNGN(item.product.price)}</p>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold tracking-widest text-[#9a9898] uppercase mb-1">
                      Default Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.default_quantity}
                      onChange={(e) => setQuantity(item.product.id, Number(e.target.value))}
                      className="w-20 bg-[#111111] border border-[#353534] text-[#e5e2e1] px-3 py-2 rounded text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(item.product.id)}
                    className="text-[#9a9898] hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <div className="flex justify-end pt-2">
          <OrangeButton type="submit" disabled={creating} className="px-10 py-4 text-xs">
            {creating ? "CREATING..." : "CREATE PAYMENT LINK"}
          </OrangeButton>
        </div>
      </form>
    </div>
  )
}
