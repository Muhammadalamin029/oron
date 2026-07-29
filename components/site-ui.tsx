"use client"

import { forwardRef } from "react"
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStatusConfig } from "@/lib/status-utils"

/* ─────────────────────────────────────────────
   SiteMain — page content wrapper
   Usage: <SiteMain>...</SiteMain> / <SiteMain guard>...</SiteMain>
───────────────────────────────────────────── */
export function SiteMain({
  children,
  className,
  guard = false,
}: {
  children: ReactNode
  className?: string
  guard?: boolean
}) {
  return (
    <main className={cn("max-w-[1280px] mx-auto px-6", guard ? "pt-32 pb-24" : "pt-28 pb-24", className)}>
      {children}
    </main>
  )
}

/* ─────────────────────────────────────────────
   PageHeading
   Usage: <PageHeading sub="...">My <span className="text-primary">Orders</span></PageHeading>
───────────────────────────────────────────── */
export function PageHeading({
  children,
  sub,
  action,
}: {
  children: ReactNode
  sub?: string
  action?: ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-4 mb-8", action && "sm:flex-row sm:items-end sm:justify-between")}>
      <div>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-white">{children}</h1>
        {sub && <p className="text-muted-foreground text-sm mt-2">{sub}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SiteCard — canonical flat card
   Usage: <SiteCard className="p-6">...</SiteCard>
───────────────────────────────────────────── */
export function SiteCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div className={cn("bg-card border border-border rounded-lg", hover && "hover:border-primary/30 transition-colors", className)}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────
   IconCircle
   Usage: <IconCircle icon={<Watch className="h-8 w-8" />} size="lg" tone="primary" />
───────────────────────────────────────────── */
const ICON_CIRCLE_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-20 h-20",
}

const ICON_CIRCLE_TONE: Record<"primary" | "muted" | "success", string> = {
  primary: "bg-primary/10 text-primary",
  muted: "bg-card border border-border text-muted-foreground",
  success: "bg-green-500/10 text-green-400",
}

export function IconCircle({
  icon,
  size = "md",
  tone = "primary",
}: {
  icon: ReactNode
  size?: "sm" | "md" | "lg"
  tone?: "primary" | "muted" | "success"
}) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        ICON_CIRCLE_SIZE[size],
        ICON_CIRCLE_TONE[tone]
      )}
    >
      {icon}
    </div>
  )
}

/* ─────────────────────────────────────────────
   PrimaryButton — canonical shop CTA
   Usage: <PrimaryButton onClick={...}>Add to Cart</PrimaryButton>
          <PrimaryButton pill href="/products">Shop Now</PrimaryButton>
───────────────────────────────────────────── */
export function PrimaryButton({
  children,
  onClick,
  href,
  type = "button",
  disabled,
  pill = false,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  type?: "button" | "submit"
  disabled?: boolean
  pill?: boolean
  className?: string
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 bg-primary text-white font-display font-bold text-sm tracking-widest uppercase",
    "px-8 py-3 glow-hover transition-all active:scale-95",
    "hover:bg-[#ff8533] disabled:opacity-40 disabled:cursor-not-allowed",
    pill ? "rounded-full" : "rounded-lg",
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}

/* ─────────────────────────────────────────────
   SecondaryButton — outline CTA
───────────────────────────────────────────── */
export function SecondaryButton({
  children,
  onClick,
  href,
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 border border-border text-secondary-text font-bold text-sm tracking-widest uppercase",
    "px-8 py-4 rounded-lg transition-all active:scale-95",
    "hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed",
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}

/* ─────────────────────────────────────────────
   SiteFieldLabel / SiteInput / SiteTextarea / SiteSelect
   Built on the .input-dark utility class already in globals.css.
───────────────────────────────────────────── */
export function SiteFieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-1.5">
      {children}
    </label>
  )
}

export const SiteInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function SiteInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "input-dark w-full text-foreground px-4 py-3 rounded-lg text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      />
    )
  }
)

export const SiteTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function SiteTextarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "input-dark w-full text-foreground px-4 py-3 rounded-lg text-sm focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      />
    )
  }
)

export const SiteSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function SiteSelect({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        {...props}
        className={cn(
          "input-dark w-full text-foreground px-4 py-3 rounded-lg text-sm focus:outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {children}
      </select>
    )
  }
)

/* ─────────────────────────────────────────────
   Pill — tag / filter chip
   Usage: <Pill active={activeCategory === c} onClick={() => setActiveCategory(c)}>{c}</Pill>
───────────────────────────────────────────── */
export function Pill({
  children,
  active = false,
  onClick,
  onRemove,
  className,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  className?: string
}) {
  const classes = cn(
    "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all",
    active ? "bg-primary/10 border border-primary/20 text-primary" : "bg-card border border-border text-secondary-text",
    className
  )

  const remove = onRemove && (
    <X
      className="h-3 w-3"
      onClick={(e) => {
        e.stopPropagation()
        onRemove()
      }}
    />
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
        {remove}
      </button>
    )
  }

  return (
    <span className={classes}>
      {children}
      {remove}
    </span>
  )
}

/* ─────────────────────────────────────────────
   SaleFlag — static "SALE" marker (not a Pill: a
   flag, not an interactive filter tag)
───────────────────────────────────────────── */
export function SaleFlag({ className }: { className?: string }) {
  return (
    <span className={cn("bg-primary text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded", className)}>
      SALE
    </span>
  )
}

/* ─────────────────────────────────────────────
   SkeletonLine / SkeletonBlock — loading placeholders
───────────────────────────────────────────── */
export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("bg-muted rounded animate-pulse", className)} />
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("bg-card border border-border rounded-lg animate-pulse", className)} />
}

/* ─────────────────────────────────────────────
   EmptyState
───────────────────────────────────────────── */
export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && (
        <div className="mb-5">
          <IconCircle icon={icon} size="lg" tone="muted" />
        </div>
      )}
      <h2 className="font-display font-bold text-2xl text-white mb-2">{title}</h2>
      {message && <p className="text-muted-foreground text-sm mb-6 max-w-sm">{message}</p>}
      {action}
    </div>
  )
}

/* ─────────────────────────────────────────────
   StatusBadge — shares status color data with the
   admin panel's StatusBadge via lib/status-utils
   Usage: <StatusBadge status="paid" />
───────────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const s = getStatusConfig(status)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-[0.15em] uppercase",
        s.badge
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", s.dot)} />
      {s.label}
    </span>
  )
}
