"use client"

import Link from "next/link"
import Image from "next/image"
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  Package,
  CreditCard,
  Bell,
  AlertCircle,
  HeadphonesIcon,
  LayoutDashboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { notificationsApi } from "@/services/notifications"
import { cn } from "@/lib/utils"

const navLeft = [
  { href: "/products", label: "Shop" },
]

const navRight = [
  { href: "/contact", label: "Custom" },
]

const mobileNavLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collection" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const accountLinks = [
  { href: "/account", label: "Account Settings", icon: Settings },
  { href: "/orders", label: "My Orders", icon: Package },
  { href: "/payments", label: "Payment History", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/disputes", label: "Disputes", icon: AlertCircle },
  { href: "/support", label: "Support", icon: HeadphonesIcon },
]

export function Header() {
  const { totalItems } = useCart()
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await notificationsApi.getNotifications()
        if (!cancelled) setUnreadCount(data.filter((n) => !n.is_read).length)
      } catch {
        // badge just won't show a count
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        "glass-nav border-b border-white/5",
        scrolled && "shadow-[0_2px_32px_rgba(0,0,0,0.6)]"
      )}
    >
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-[1280px] mx-auto relative">

        {/* ── Left: hamburger (mobile) + nav links (desktop) ── */}
        <div className="flex items-center gap-8">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden text-[#c6c6c6] hover:text-[#ff6b00] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            {/* ── Mobile Drawer ── */}
            <SheetContent
              side="left"
              className="w-80 p-0 flex flex-col bg-[#111111] border-r border-[#353534]"
              aria-label="Navigation"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 pt-8 pb-6 border-b border-[#353534]">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <span className="font-display font-bold text-xl tracking-[0.2em] text-[#e5e2e1]">ORON</span>
                  <span className="text-[#ff6b00] font-bold text-xl">TECHWARE</span>
                </Link>
                <SheetClose asChild>
                  <button className="text-[#9a9898] hover:text-[#e5e2e1] transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </SheetClose>
              </div>

              {/* Main Nav */}
              <nav className="flex flex-col px-4 py-4 gap-1">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-[#c6c6c6] hover:text-[#ff6b00] hover:bg-white/5 transition-all group"
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </nav>

              {/* Account Links */}
              {isAuthenticated && (
                <div className="px-4 py-2 border-t border-[#353534]">
                  <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#9a9898]">
                    My Account
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    {accountLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#c6c6c6] hover:text-[#ff6b00] hover:bg-white/5 transition-all"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#c6c6c6] hover:text-[#ff6b00] hover:bg-white/5 transition-all"
                      >
                        <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom CTA */}
              <div className="mt-auto px-4 pb-8 pt-4 border-t border-[#353534]">
                {!isAuthenticated ? (
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <button className="w-full bg-[#ff6b00] text-white font-semibold tracking-widest text-sm py-3 rounded-lg glow-hover transition-all active:scale-95">
                      SIGN IN
                    </button>
                  </Link>
                ) : (
                  <button
                    className="w-full border border-[#353534] text-[#c6c6c6] hover:border-[#ff6b00] hover:text-[#ff6b00] font-semibold tracking-wide text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    onClick={() => { logout(); setMobileOpen(false) }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop left nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLeft.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#c6c6c6] hover:text-[#ff6b00] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Centre: Logo (absolute centered) ── */}
        <div className="absolute left-1/2 -translate-x-1/2 flex-shrink-0">
          <Link
            href="/"
            className="flex flex-col items-center leading-none select-none group"
            aria-label="ORON Techware – Home"
          >
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl md:text-2xl tracking-[0.2em] text-[#e5e2e1] group-hover:text-white transition-colors">
                ORON
              </span>
              <span className="font-display font-bold text-xl md:text-2xl tracking-[0.15em] text-[#ff6b00]">
                TECHWARE
              </span>
            </div>
            <span className="hidden md:block text-[8px] tracking-[0.4em] text-[#9a9898] uppercase mt-0.5">
              Engineered for Performance
            </span>
          </Link>
        </div>

        {/* ── Right: desktop nav + action icons ── */}
        <div className="flex items-center gap-6">
          {/* Desktop right nav */}
          <nav className="hidden md:flex items-center gap-8 mr-2">
            {navRight.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#c6c6c6] hover:text-[#ff6b00] transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icon actions */}
          <div className="flex items-center gap-3">
            <button
              className="hidden md:flex text-[#c6c6c6] hover:text-[#ff6b00] transition-colors duration-200 active:scale-95"
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href={isAuthenticated ? "/account" : "/auth/login"}
              className="hidden md:flex text-[#c6c6c6] hover:text-[#ff6b00] transition-colors duration-200 active:scale-95"
              aria-label="Account"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>

            {isAuthenticated && (
              <Link
                href="/notifications"
                className="hidden md:flex relative text-[#c6c6c6] hover:text-[#ff6b00] transition-colors duration-200 active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {mounted && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#ff6b00] text-white text-[9px] flex items-center justify-center font-bold leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <Link href="/cart" className="relative text-[#ff6b00] hover:text-[#ff8533] transition-colors duration-200 active:scale-95" aria-label="Cart">
              <ShoppingCart className="h-[18px] w-[18px]" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#ff6b00] text-white text-[9px] flex items-center justify-center font-bold leading-none">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Orange gradient accent line */}
      <div className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-[#ff6b00]/40 to-transparent transition-opacity duration-300",
        scrolled ? "opacity-0" : "opacity-100"
      )} />
    </header>
  )
}
