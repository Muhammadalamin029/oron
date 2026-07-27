"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  LayoutGrid,
  ShoppingCart,
  Users,
  Star,
  Scale,
  Bell,
  Headphones,
  Settings,
  LogOut,
  ExternalLink,
  Link2,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin",                  label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/products",         label: "Products",      icon: Package         },
  { href: "/admin/categories",       label: "Categories",    icon: LayoutGrid      },
  { href: "/admin/orders",           label: "Orders",        icon: ShoppingCart    },
  { href: "/admin/payment-links",    label: "Payment Links", icon: Link2           },
  { href: "/admin/payments",         label: "Payments",      icon: CreditCard      },
  { href: "/admin/customers",        label: "Customers",     icon: Users           },
  { href: "/admin/reviews",          label: "Reviews",       icon: Star            },
  { href: "/admin/disputes",         label: "Disputes",      icon: Scale           },
  { href: "/admin/notifications",    label: "Notifications", icon: Bell            },
  { href: "/admin/support",          label: "Support",       icon: Headphones      },
  { href: "/admin/settings",         label: "Settings",      icon: Settings        },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const initials = (user?.full_name || "AD")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#0e0e0e] border-r border-white/5 flex flex-col z-50">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-[#ff6b00] text-sm font-mono">{initials}</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-none tracking-tighter">
            <span className="text-[#e5e2e1]">ORON</span>
            <span className="text-[#ff6b00]"> / ADMIN</span>
          </h1>
          <p className="text-[9px] font-bold tracking-[0.25em] text-[#9a9898] uppercase mt-1">
            ADMINISTRATOR
          </p>
        </div>
      </div>

      {/* Orange rule */}
      <div className="h-px bg-gradient-to-r from-[#ff6b00]/60 via-[#ff6b00]/20 to-transparent mx-6 mb-4" />

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-[#ff6b00] text-white"
                  : "text-[#9a9898] hover:text-[#e5e2e1] hover:bg-white/[0.04]"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-[#9a9898] group-hover:text-[#e5e2e1]"
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#9a9898] hover:text-[#e5e2e1] hover:bg-white/[0.04] transition-all"
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          Exit to Store ↗
        </Link>
        <button
          onClick={() => { logout(); router.push("/auth/login") }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#9a9898] hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Terminate Session
        </button>
      </div>
    </aside>
  )
}
