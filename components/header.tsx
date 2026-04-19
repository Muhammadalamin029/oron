"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Menu, Search, ShoppingCart, Moon, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { totalItems } = useCart()
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Collection" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const desktopLinks = [
    ...navLinks,
    ...(isAuthenticated ? [{ href: "/orders", label: "Orders" }] : []),
    ...(isAuthenticated ? [{ href: "/notifications", label: "Notifications" }] : []),
    ...(isAuthenticated ? [{ href: "/disputes", label: "Disputes" }] : []),
    ...(isAuthenticated ? [{ href: "/support", label: "Support" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetTitle className="text-xl font-serif tracking-widest">ORON</SheetTitle>
              <nav className="flex flex-col gap-4 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated ? (
                  <Link
                    href="/auth/login"
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/orders"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/notifications"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Notifications
                    </Link>
                    <Link
                      href="/disputes"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Disputes
                    </Link>
                    <Link
                      href="/support"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      Support
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start px-0 text-lg font-medium hover:text-primary transition-colors"
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <nav className="hidden md:flex items-center gap-6">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="text-2xl md:text-3xl font-serif tracking-[0.2em] text-foreground">
            ORON
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <Link
            href={isAuthenticated ? "/orders" : "/auth/login"}
            className="hidden md:block"
          >
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
