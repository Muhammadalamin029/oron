"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImagePlus, Plus, Trash2 } from "lucide-react"
import { productsApi } from "@/services/products"
import { categoriesApi } from "@/services/categories"
import type { Category } from "@/types/api"
import {
  AdminPageHeader,
  GlassCard,
  OrangeButton,
} from "@/components/admin-ui"
import Image from "next/image"

type ProductForm = {
  id: string; // random local id
  name: string;
  price: string;
  stock: string;
  category_id: string;
  description: string;
  imageFile: File | null;
  imagePreview: string;
}

export default function AddProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [forms, setForms] = useState<ProductForm[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cats = await categoriesApi.list()
        if (cancelled) return
        setCategories(cats)
        if (cats.length > 0) {
          setForms([{
            id: Date.now().toString(),
            name: "",
            price: "",
            stock: "0",
            category_id: cats[0].id,
            description: "",
            imageFile: null,
            imagePreview: "",
          }])
        }
      } catch (err: any) {
        if (!cancelled) toast.error("Failed to load categories")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleImageChange = (formId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForms(prev => prev.map(f => 
          f.id === formId 
            ? { ...f, imageFile: file, imagePreview: reader.result as string }
            : f
        ))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormChange = (formId: string, key: keyof ProductForm, value: string) => {
    setForms(prev => prev.map(f => f.id === formId ? { ...f, [key]: value } : f))
  }

  const addForm = () => {
    const defaultCat = categories.length > 0 ? categories[0].id : ""
    setForms(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      name: "",
      price: "",
      stock: "0",
      category_id: defaultCat,
      description: "",
      imageFile: null,
      imagePreview: "",
    }])
  }

  const removeForm = (formId: string) => {
    if (forms.length === 1) return toast.error("You must add at least one product.")
    setForms(prev => prev.filter(f => f.id !== formId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setCreating(true)
      
      const promises = forms.map(form => {
        const payload = {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          image_url: form.imagePreview,
          category_id: form.category_id,
          stock: Number(form.stock || 0),
        }
        return productsApi.createProduct(payload)
      })

      await Promise.all(promises)
      toast.success(`${forms.length} product(s) added successfully`)
      router.push("/admin/products")
    } catch (err: any) {
      toast.error(err?.message || "Failed to add products")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <AdminPageHeader
        title="ADD PRODUCTS"
        sub="/ NEW ENTRIES"
        action={
          <button
            onClick={() => router.push("/admin/products")}
            className="border border-[#353534] text-[#9a9898] hover:text-white transition-colors px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase"
          >
            CANCEL
          </button>
        }
      />

      {loading ? (
        <GlassCard className="p-8">
          <div className="animate-pulse h-96 bg-[#1a1a1a]/50 rounded" />
        </GlassCard>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {forms.map((form, index) => (
            <GlassCard key={form.id} className="p-8 relative">
              {forms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeForm(form.id)}
                  className="absolute top-6 right-6 text-[#9a9898] hover:text-red-400 transition-colors"
                  title="Remove this product"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              
              <div className="mb-6 border-b border-white/5 pb-4">
                <h3 className="font-display font-bold text-lg text-white uppercase tracking-widest">
                  PRODUCT #{index + 1}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Image Upload */}
                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase">
                    Product Image
                  </label>
                  <div className="relative group w-full aspect-square bg-[#0a0a0a] border-2 border-dashed border-[#353534] hover:border-[#ff6b00] rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer">
                    {form.imagePreview ? (
                      <>
                        <Image
                          src={form.imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-bold tracking-wider">CHANGE IMAGE</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-[#353534] group-hover:text-[#ff6b00] transition-colors">
                        <ImagePlus className="w-12 h-12" />
                        <p className="text-xs font-bold tracking-widest uppercase">Click to upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(form.id, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ORON Chronos X1"
                      value={form.name}
                      onChange={(e) => handleFormChange(form.id, "name", e.target.value)}
                      required
                      className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                        Price (NGN)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => handleFormChange(form.id, "price", e.target.value)}
                        required
                        className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={(e) => handleFormChange(form.id, "stock", e.target.value)}
                        required
                        className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                      Category
                    </label>
                    <select
                      value={form.category_id}
                      onChange={(e) => handleFormChange(form.id, "category_id", e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => handleFormChange(form.id, "description", e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] placeholder:text-[#353534] px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={addForm}
              className="flex items-center gap-2 text-[#9a9898] hover:text-[#e5e2e1] border border-[#353534] hover:border-[#9a9898] transition-colors px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> ADD ANOTHER PRODUCT
            </button>
            <OrangeButton type="submit" disabled={creating} className="px-10 py-4 text-xs w-full sm:w-auto justify-center">
              {creating ? "SAVING PRODUCTS..." : `SAVE ALL PRODUCTS (${forms.length})`}
            </OrangeButton>
          </div>
        </form>
      )}
    </div>
  )
}
