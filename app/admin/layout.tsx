"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, Terminal, User, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"

/* ── Breadcrumb map ── */
const breadcrumbs: Record<string, string> = {
  "/admin":              "ADMIN / DASHBOARD",
  "/admin/products":     "ADMIN / PRODUCTS",
  "/admin/categories":   "ADMIN / CATEGORIES",
  "/admin/orders":       "ADMIN / ORDERS",
  "/admin/customers":    "ADMIN / CUSTOMERS",
  "/admin/reviews":      "ADMIN / REVIEWS",
  "/admin/disputes":     "ADMIN / DISPUTES",
  "/admin/notifications":"ADMIN / NOTIFICATIONS",
  "/admin/support":      "ADMIN / SUPPORT",
  "/admin/settings":     "ADMIN / SETTINGS",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, isAuthenticated, isAdmin } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.replace(`/auth/login?next=${encodeURIComponent("/admin")}`)
    }
  }, [loading, isAuthenticated, isAdmin, router])

  const crumb = breadcrumbs[pathname] || "ADMIN"
  const initials = (user?.full_name || "AD")
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-[#ff6b00] font-mono text-sm tracking-[0.2em] animate-pulse">
          INITIALIZING...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] overflow-x-hidden">
      {/* Atmospheric grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Top header bar */}
      <header className="fixed top-0 right-0 md:left-[240px] left-0 h-16 bg-[#131313]/70 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40">
        {/* Mobile: hamburger */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden text-[#9a9898] hover:text-[#e5e2e1] transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px] bg-[#0e0e0e] border-r border-white/5">
              <AdminSidebar />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb */}
          <span className="font-mono text-sm font-semibold text-[#9a9898] tracking-widest hidden sm:block">
            {crumb}
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-5">
          <button className="text-[#9a9898] hover:text-[#e5e2e1] transition-colors">
            <Terminal className="h-5 w-5" />
          </button>
          <button className="relative text-[#9a9898] hover:text-[#e5e2e1] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff6b00] rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center">
            <span className="text-[#ff6b00] text-xs font-bold">{initials}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 md:ml-[240px] pt-16 min-h-screen">
        <div className="p-6 md:p-8">{children}</div>
      </main>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 z-0 pointer-events-none opacity-20">
        <span className="font-mono text-xs text-[#c6c6c6] tracking-[0.2em]">
          
        </span>
      </div>
    </div>
  )
}
