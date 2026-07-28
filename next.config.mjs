const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Verified clean via `tsc --noEmit` — this gate now actually runs.
    ignoreBuildErrors: false,
  },
  images: {
    // Product `image_url` is an admin-free-text field (no upload pipeline / fixed
    // CDN on the backend), so there's no host list we can safely allow-list here.
    // A `hostname: '**'` wildcard would re-enable next/image optimization, but it
    // also turns the image optimizer into an open proxy for whatever URL an admin
    // enters — real SSRF surface, not worth trading for smaller images. Keep this
    // disabled until product images are served from a controlled domain/CDN.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src 'self' https: data:",
              "font-src 'self' data:",
              // 'unsafe-inline' on script/style keeps this from silently breaking Next's
              // inline hydration/bootstrap scripts and React inline styles on first ship.
              // Tighten to a nonce-based policy in a follow-up once verified route-by-route.
              "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "frame-src https://www.google.com",
              `connect-src 'self' ${API_BASE_URL} https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
