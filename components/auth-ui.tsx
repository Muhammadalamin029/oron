"use client"

import { ReactNode } from "react"
import { Watch } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────
   AuthShell — split-screen shell matching the
   admin panel's dark, atmospheric-grid aesthetic.
───────────────────────────────────────────── */
export function AuthShell({
  tagline,
  children,
}: {
  tagline: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12 border-r border-white/5">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center mx-auto mb-6">
            <Watch className="h-10 w-10 text-[#ff6b00]" />
          </div>
          <h1 className="font-display font-extrabold text-4xl text-white uppercase tracking-tight mb-4">
            ORON
          </h1>
          <p className="text-[#9a9898] text-lg">{tagline}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center mx-auto mb-4">
              <Watch className="h-7 w-7 text-[#ff6b00]" />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight">ORON</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   AuthHeading — form title + subtitle
───────────────────────────────────────────── */
export function AuthHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center mb-8">
      <h2 className="font-display font-bold text-2xl text-white">{title}</h2>
      {sub && <p className="text-[#9a9898] mt-2">{sub}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   AuthLabel — uppercase tracked field label
───────────────────────────────────────────── */
export function AuthLabel({
  children,
  htmlFor,
}: {
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase mb-1.5"
    >
      {children}
    </label>
  )
}

/* ─────────────────────────────────────────────
   AuthInput — dark bordered text/password input
───────────────────────────────────────────── */
export function AuthInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-[#0a0a0a] border border-[#353534] text-[#e5e2e1] placeholder:text-[#353534]",
        "px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-[#ff6b00] transition-all",
        className
      )}
    />
  )
}
