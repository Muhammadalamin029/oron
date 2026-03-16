"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  Watch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full ${mobile ? "" : "w-64 border-r border-border"} bg-card`}
    >
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Watch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-card-foreground">ORON</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        {mounted && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>
        )}
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <LogOut className="h-5 w-5" />
            <span>Exit Admin</span>
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      <div className="flex-1">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">A</span>
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">
                Admin
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
