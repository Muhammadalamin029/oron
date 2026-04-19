"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { CategoriesList } from "@/components/admin/categories-list"
import { CategoryForm } from "@/components/admin/category-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, List } from "lucide-react"
import { categoriesApi } from "@/services/categories"
import type { Category } from "@/types/api"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.list()
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [refreshKey])

  const handleCategoryCreated = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleCategoryUpdated = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleCategoryDeleted = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-serif tracking-[0.2em] mb-2">Categories Management</h1>
              <p className="text-muted-foreground">
                Manage product categories for the marketplace
              </p>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  All Categories
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Categories</CardTitle>
                    <CardDescription>
                      Manage all product categories in the marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CategoriesList
                      categories={categories}
                      loading={loading}
                      onEdit={handleCategoryUpdated}
                      onDelete={handleCategoryDeleted}
                      onRefresh={fetchCategories}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Category</CardTitle>
                    <CardDescription>
                      Add a new product category to the marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CategoryForm onSuccess={handleCategoryCreated} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
