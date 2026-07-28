import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oron-marketplace.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/account",
        "/cart",
        "/checkout",
        "/orders",
        "/payments",
        "/notifications",
        "/disputes",
        "/support",
        "/auth",
        "/pay",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
