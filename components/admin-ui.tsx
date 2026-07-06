"use client"

import { cn } from "@/lib/utils"
import { getStatusConfig } from "@/lib/admin-utils"
import type { ReactNode } from "react"

/* ─────────────────────────────────────────────
   StatusBadge
   Usage: <StatusBadge status="paid" />
───────────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const s = getStatusConfig(status)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold tracking-[0.15em] uppercase",
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
          <span className="font-mono text-xs font-bold text-[#ff6b00] tracking-[0.15em] uppercase">
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
          <p className="text-[9px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mt-1">{sub}</p>
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
        <div key={i} className={cn("rounded bg-[#1c1b1b] animate-pulse", height)} />
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
export function AdminTable({
  headers,
  children,
  lastRight = true,
}: {
  headers: string[]
  children: ReactNode
  lastRight?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5">
            {headers.map((h, i) => (
              <th
                key={h}
                className={cn(
                  "py-3 px-4 text-[10px] font-bold tracking-[0.15em] text-[#9a9898] uppercase font-normal",
                  lastRight && i === headers.length - 1 && "text-right"
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">{children}</tbody>
      </table>
    </div>
  )
}

/* ─────────────────────────────────────────────
   AdminTr — table row with orange hover border
───────────────────────────────────────────── */
export function AdminTr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("hover:bg-white/[0.02] transition-colors group", className)}>
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
    <td className={cn("py-4 px-4 text-sm text-[#c6c6c6]", mono && "font-mono", className)}>
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
      <div className="w-8 h-8 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center flex-shrink-0">
        <span className="text-[#ff6b00] text-xs font-bold">{initials}</span>
      </div>
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm">{name}</p>
        {email && <p className="text-[#9a9898] text-xs truncate">{email}</p>}
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
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9898]">{icon}</div>
      )}
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1] placeholder:text-[#353534]",
          "px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all",
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
        "bg-[#0a0a0a] border border-[#1a1a1a] text-[#e5e2e1]",
        "px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all appearance-none cursor-pointer",
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
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-[#ff6b00] text-white font-bold text-[10px] tracking-[0.2em] uppercase",
        "px-6 py-3 rounded-lg glow-hover transition-all active:scale-95",
        "hover:bg-[#ff8533] disabled:opacity-40 disabled:cursor-not-allowed",
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
        <div className="w-20 h-20 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-5 text-[#353534]">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
      {message && <p className="text-[#9a9898] text-sm mb-6 max-w-sm">{message}</p>}
      {action}
    </div>
  )
}
