"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStatusConfig } from "@/lib/status-utils"
import type { ComponentType, ReactNode } from "react"

/* ─────────────────────────────────────────────
   StatusBadge
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

/* ─────────────────────────────────────────────
   AdminPageHeader
   Usage:
     <AdminPageHeader title="ORDER MANIFEST" sub="/ ALL TRANSACTIONS" />
───────────────────────────────────────────── */
export function AdminPageHeader({
  title,
  sub,
  action,
}: {
  title: string
  sub?: string
  action?: ReactNode
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-2">
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white uppercase tracking-tight">
          {title}
        </h2>
        {sub && (
          <span className="font-mono text-xs font-bold text-primary tracking-[0.15em] uppercase">
            {sub}
          </span>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  )
}

/* ─────────────────────────────────────────────
   GlassCard — dark glassmorphism panel
   Usage: <GlassCard className="p-6">...</GlassCard>
───────────────────────────────────────────── */
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/5 rounded-lg",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        className
      )}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SectionHeader — panel title row
   Usage:
     <SectionHeader title="RECENT TRANSMISSIONS">
       <Button>VIEW ALL</Button>
     </SectionHeader>
───────────────────────────────────────────── */
export function SectionHeader({
  title,
  sub,
  children,
}: {
  title: string
  sub?: string
  children?: ReactNode
}) {
  return (
    <div className="flex justify-between items-center p-6 border-b border-white/5">
      <div>
        <h3 className="font-display font-bold text-lg text-white tracking-tight">{title}</h3>
        {sub && (
          <p className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase mt-1">{sub}</p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SkeletonRows — animated loading placeholder rows
   Usage: <SkeletonRows count={5} height="h-12" />
───────────────────────────────────────────── */
export function SkeletonRows({
  count = 5,
  height = "h-12",
}: {
  count?: number
  height?: string
}) {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("rounded-lg bg-muted animate-pulse", height)} />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   AdminTable — dark-styled table wrapper
   Usage:
     <AdminTable headers={["ID", "Name", "Status"]}>
       <tr>...</tr>
     </AdminTable>
───────────────────────────────────────────── */
type AdminTableHeader = string | { label: string; align?: "left" | "center" | "right" }

export function AdminTable({
  headers,
  children,
  lastRight = true,
}: {
  headers: AdminTableHeader[]
  children: ReactNode
  lastRight?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            {headers.map((h, i) => {
              const label = typeof h === "string" ? h : h.label
              const align = typeof h === "string" ? undefined : h.align
              return (
                <th
                  key={label}
                  className={cn(
                    "py-3 px-4 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase font-normal",
                    align === "center" && "text-center",
                    align === "right" && "text-right",
                    !align && lastRight && i === headers.length - 1 && "text-right"
                  )}
                >
                  {label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">{children}</tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────────
   AdminTr — table row with orange hover border
   (pass onClick to enable the clickable-row hover accent)
───────────────────────────────────────────── */
export function AdminTr({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors group",
        onClick
          ? "border-l-2 border-transparent hover:border-primary hover:bg-white/[0.02] cursor-pointer"
          : "hover:bg-white/[0.02]",
        className
      )}
    >
      {children}
    </tr>
  )
}

/* ─────────────────────────────────────────────
   AdminTd — standard table cell
───────────────────────────────────────────── */
export function AdminTd({
  children,
  className,
  mono,
}: {
  children: ReactNode
  className?: string
  mono?: boolean
}) {
  return (
    <td className={cn("py-4 px-4 text-sm text-secondary-text", mono && "font-mono", className)}>
      {children}
    </td>
  )
}

/* ─────────────────────────────────────────────
   CustomerCell — avatar initials + name + email
───────────────────────────────────────────── */
export function CustomerCell({
  name,
  email,
}: {
  name: string
  email?: string
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
        <span className="text-primary text-xs font-bold">{initials}</span>
      </div>
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm">{name}</p>
        {email && <p className="text-muted-foreground text-xs truncate">{email}</p>}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   DarkInput — styled search / text input
───────────────────────────────────────────── */
export function DarkInput({
  placeholder,
  value,
  onChange,
  icon,
  className,
}: {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      )}
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-[#0a0a0a] border border-[#1a1a1a] text-foreground placeholder:text-border",
          "px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary transition-all",
          icon && "pl-10"
        )}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   DarkSelect — styled select dropdown
───────────────────────────────────────────── */
export function DarkSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "bg-[#0a0a0a] border border-[#1a1a1a] text-foreground",
        "px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/* ─────────────────────────────────────────────
   OrangeButton — primary CTA
───────────────────────────────────────────── */
export function OrangeButton({
  children,
  onClick,
  disabled,
  type = "button",
  className,
  pill = false,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
  pill?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-primary text-white font-bold text-[10px] tracking-[0.2em] uppercase",
        "px-6 py-3 transition-all active:scale-95",
        "hover:bg-[#ff8533] disabled:opacity-40 disabled:cursor-not-allowed",
        pill
          ? "rounded-full shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:shadow-[0_0_25px_rgba(255,107,0,0.6)]"
          : "rounded-lg glow-hover",
        className
      )}
    >
      {children}
    </button>
  )
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
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5 text-border">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
      {message && <p className="text-muted-foreground text-sm mb-6 max-w-sm">{message}</p>}
      {action}
    </div>
  )
}

/* ─────────────────────────────────────────────
   StatTile — KPI card matching the dashboard's GlassCard pattern
   Usage: <StatTile label="Total" value={42} icon={Wallet} live highlight />
───────────────────────────────────────────── */
export function StatTile({
  label,
  value,
  icon: Icon,
  live = false,
  highlight = false,
}: {
  label: string
  value: string | number
  icon?: ComponentType<{ className?: string }>
  live?: boolean
  highlight?: boolean
}) {
  return (
    <GlassCard className="p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-5">
        <span className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {live && (
            <div className="flex items-center gap-1.5 bg-[#201f1f] border border-border px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-bold text-foreground tracking-widest">LIVE</span>
            </div>
          )}
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </div>
      <span className={cn("font-display font-bold text-3xl block", highlight ? "text-primary" : "text-white")}>
        {value}
      </span>
    </GlassCard>
  )
}

/* ─────────────────────────────────────────────
   AdminPagination — shared page-nav footer
   Usage: <AdminPagination page={page} pageSize={15} totalCount={filtered.length} onPageChange={setPage} itemLabel="Customers" />
───────────────────────────────────────────── */
export function AdminPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  itemLabel,
}: {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  itemLabel: string
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const from = totalCount === 0 ? 0 : page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalCount)

  return (
    <div className="p-4 border-t border-white/5 bg-[#0a0a0a]/30 flex items-center justify-between flex-shrink-0">
      <span className="font-mono text-xs text-muted-foreground">
        Showing {from}–{to} of {totalCount} {itemLabel}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="p-1.5 rounded bg-card border border-[#1a1a1a] text-muted-foreground hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="p-1.5 rounded bg-card border border-[#1a1a1a] text-muted-foreground hover:text-white hover:border-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   AdminModal — themed Radix Dialog wrapper for admin CRUD/detail modals
   Provides the shared overlay/panel/header/close chrome; body content is
   passed as children so each caller keeps its own form/detail layout.
   Usage:
     <AdminModal open={open} onClose={() => setOpen(false)} title="PAYMENT">
       <div className="p-6">...</div>
     </AdminModal>
───────────────────────────────────────────── */
export function AdminModal({
  open,
  onClose,
  title,
  maxWidth = "sm:max-w-2xl",
  children,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  maxWidth?: string
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)]",
            "bg-card/90 backdrop-blur-xl border border-white/5 rounded-xl shadow-2xl",
            "flex flex-col overflow-hidden max-h-[90vh] focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
            maxWidth
          )}
        >
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50 flex-shrink-0">
            <DialogPrimitive.Title className="font-display font-bold text-xl text-white tracking-tight">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-muted-foreground hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 flex-shrink-0">
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
