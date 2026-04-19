"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { categoriesApi } from "@/services/categories"

interface CategoryFormProps {
  onSuccess?: () => void
  initialData?: {
    name?: string
    description?: string
  }
}

export function CategoryForm({ onSuccess, initialData }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setIsSubmitting(true)
    try {
      await categoriesApi.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
      })
      
      toast.success("Category created successfully!")
      setFormData({ name: "", description: "" })
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create category")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Luxury Watches, Sports Watches"
            required
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            The name will be displayed to customers throughout the marketplace
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this category to help customers understand what products it contains..."
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            Optional: Provide a detailed description for this category
          </p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Category Guidelines:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Use clear, descriptive names that customers will understand</li>
          <li>Keep names concise (under 100 characters)</li>
          <li>Consider how categories will appear in navigation menus</li>
          <li>Descriptions help with SEO and user experience</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData({ name: "", description: "" })}
        >
          Clear Form
        </Button>
      </div>
    </form>
  )
}
