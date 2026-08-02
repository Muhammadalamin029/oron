"use client"

import Link from "next/link"
import { Instagram, Twitter, Facebook, Mail, ArrowRight } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { newsletterApi } from "@/services/newsletter"
import { getErrorMessage } from "@/lib/get-error-message"

const shopLinks = [
  { label: "Smartphones", href: "/products" },
  { label: "Audio", href: "/products" },
  { label: "Wearables", href: "/products" },
  { label: "Accessories", href: "/products" },
]

const companyLinks = [
  { label: "Our Ethos", href: "/about" },
  { label: "Engineering", href: "/about" },
  { label: "Careers", href: "/about" },
  { label: "Sustainability", href: "/about" },
]

const careLinks = [
  { label: "Support Center", href: "/support" },
  { label: "Shipping Info", href: "/contact" },
  { label: "Returns", href: "/returns" },
  { label: "Warranty", href: "/contact" },
]

const socials = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter,   label: "Twitter",   href: "#" },
  { icon: Facebook,  label: "Facebook",  href: "#" },
  { icon: Mail,      label: "Email",     href: "#" },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || subscribing) return
    try {
      setSubscribing(true)
      const result = await newsletterApi.subscribe(email)
      toast.success(result.detail || "You're on the list!", { description: "Expect exclusive drops in your inbox." })
      setEmail("")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to subscribe. Please try again."))
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="bg-surface-container-lowest border-t border-white/5">
      {/* Newsletter strip */}
      <div className="border-b border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 py-14 relative overflow-hidden">
          <div className="absolute inset-0 orange-radial pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                STAY IN THE LOOP
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Get early access to drops, archive sales, and technical blueprints before anyone else.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                required
                className="flex-1 md:w-72 bg-background border border-border text-foreground placeholder:text-muted-foreground text-xs font-semibold tracking-widest px-5 py-3.5 rounded-lg focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="bg-primary text-white text-xs font-bold tracking-widest px-6 py-3.5 rounded-lg glow-hover transition-all active:scale-95 hover:bg-[#ff8533] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {subscribing ? "SIGNING UP..." : "SIGN UP"} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-[1280px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold text-xl tracking-[0.2em] text-white">ORON</span>
              <span className="font-display font-bold text-xl tracking-[0.15em] text-primary">TECHWARE</span>
            </div>
            <p className="text-[9px] tracking-[0.35em] text-muted-foreground uppercase">
              Engineered for Performance
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Premium tech accessories built for people who demand more — from the streets of Lagos to wherever the world takes you.
          </p>
          <div className="flex gap-4">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-display font-semibold text-sm tracking-widest text-white mb-6 uppercase">
            Shop
          </h4>
          <ul className="space-y-3.5">
            {shopLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-display font-semibold text-sm tracking-widest text-white mb-6 uppercase">
            Company
          </h4>
          <ul className="space-y-3.5">
            {companyLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-display font-semibold text-sm tracking-widest text-white mb-6 uppercase">
            Customer Care
          </h4>
          <ul className="space-y-3.5">
            {careLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-[11px] tracking-widest">
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">TERMS OF SERVICE</Link>
          </div>
          <p>© {new Date().getFullYear()} ORON TECHWARE · NIGERIA 🇳🇬</p>
        </div>
      </div>
    </footer>
  )
}
