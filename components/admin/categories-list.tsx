"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { categoriesApi } from "@/services/categories"
import type { Category } from "@/types/api"

interface CategoriesListProps {
  categories: Category[]
  loading: boolean
  onEdit: () => void
  onDelete: () => void
  onRefresh: () => void
}

export function CategoriesList({ categories, loading, onEdit, onDelete, onRefresh }: CategoriesListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    setDeleting(categoryId)
    try {
      await categoriesApi.delete(categoryId)
      toast.success("Category deleted successfully")
      onDelete()
      onRefresh()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete category")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-md bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No categories found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first category to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} found
          </p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products Count</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      ID: {category.id.slice(0, 8)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {category.description ? (
                      <p className="text-sm text-muted-foreground truncate">
                        {category.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No description</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {/* This would need to be fetched from the backend */}
                    {/* For now, showing placeholder */}
                    0 products
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // This would open an edit modal or navigate to edit page
                        toast.info("Edit functionality coming soon")
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                      disabled={deleting === category.id}
                    >
                      {deleting === category.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Note: Categories with products cannot be deleted until all products are removed or reassigned.</p>
      </div>
    </div>
  )
}
