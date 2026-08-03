import type { Product } from "@/types/api"
import type { Watch } from "@/lib/cart-context"

export function apiProductToWatch(product: Product): Watch {
  const images = (product.images || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => img.image_url)

  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    image: product.image_url || images[0] || "/placeholder.jpg",
    images: images.length > 0 ? images : [product.image_url || "/placeholder.jpg"],
    category: product.category?.name || "Uncategorized",
    brand: "ORON",
    inStock: (product.stock || 0) > 0,
  }
}

export function apiProductsToWatches(products: Product[]): Watch[] {
  return products.map(apiProductToWatch)
}

