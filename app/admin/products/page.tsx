"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { toast } from "sonner"
import { productsApi } from "@/services/products"
import { categoriesApi } from "@/services/categories"
import type { Category, Product } from "@/types/api"

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: "",
    price: "",
    category_id: "",
    description: "",
    image_url: "",
    stock: "0",
  })

  const categoryNames = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories]
  )

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "All" || p.category?.name === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const load = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      productsApi.getProducts(),
      categoriesApi.getCategories(),
    ])
    setProducts(productsRes)
    setCategories(categoriesRes)
    if (!form.category_id && categoriesRes[0]?.id) {
      setForm((prev) => ({ ...prev, category_id: categoriesRes[0].id }))
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        await load()
      } catch (error: any) {
        if (!cancelled) toast.error(error?.message || "Failed to load products")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleDelete = async (id: string) => {
    try {
      await productsApi.deleteProduct(id)
      toast.success("Product deleted successfully")
      await load()
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete product")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your watch inventory
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  setCreating(true)
                  await productsApi.createProduct({
                    name: form.name,
                    description: form.description,
                    price: Number(form.price),
                    image_url: form.image_url,
                    category_id: form.category_id,
                    stock: Number(form.stock || 0),
                  })
                  toast.success("Product added successfully")
                  setForm({
                    name: "",
                    price: "",
                    category_id: categories[0]?.id || "",
                    description: "",
                    image_url: "",
                    stock: "0",
                  })
                  await load()
                } catch (error: any) {
                  toast.error(error?.message || "Failed to add product")
                } finally {
                  setCreating(false)
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (NGN)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(value) => setForm({ ...form, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={creating}
              >
                {creating ? "Adding..." : "Add Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryNames.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-md bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={product.image_url || "/placeholder.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name || "—"}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" disabled>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
