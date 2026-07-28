import type { MetadataRoute } from "next"
import { productsApi } from "@/services/products"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oron-marketplace.vercel.app"

const staticRoutes = ["", "/about", "/products", "/contact", "/privacy", "/terms", "/returns"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }))

  try {
    const products = await productsApi.getProducts()
    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified: product.updated_at || product.created_at,
    }))
    return [...staticEntries, ...productEntries]
  } catch {
    // Don't let a backend hiccup at build time take the whole sitemap down.
    return staticEntries
  }
}
