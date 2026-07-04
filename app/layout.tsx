import type { Metadata } from "next"
import { Sora, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ORON TECHWARE | Engineered for Performance",
  description:
    "Premium tech accessories — smartphones, smartwatches, earbuds, power banks, headphones and action cameras. 2-year warranty. Nationwide delivery.",
  icons: {
    icon: [
      { url: "/icon-dark-32x32.png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${sora.variable} ${inter.variable} font-sans antialiased bg-[#131313] text-[#e5e2e1]`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#1c1b1b",
              border: "1px solid #353534",
              color: "#e5e2e1",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
