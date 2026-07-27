import Link from "next/link"
import { ShieldCheck } from "lucide-react"

/**
 * Minimal, distraction-free chrome for the no-login payment-link flow.
 * Deliberately NOT the storefront Header/Footer — those carry full nav
 * (Shop/Tech/Archive/Custom) and a newsletter footer that would pull an
 * anonymous, mid-checkout customer away from completing payment.
 */
export function PayHeader() {
  return (
    <header className="border-b border-white/5 bg-[#131313]/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-xl tracking-wide text-white">
          ORON
        </Link>
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[#9a9898]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#ff6b00]" />
          Secure Checkout
        </div>
      </div>
    </header>
  )
}

export function PayFooter() {
  return (
    <footer className="border-t border-white/5 py-8 text-center">
      <p className="text-xs text-[#9a9898]">
        © {new Date().getFullYear()} ORON ·{" "}
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>{" "}
        ·{" "}
        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
      </p>
    </footer>
  )
}
