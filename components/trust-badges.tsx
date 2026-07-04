import { Shield, Truck, Headphones, Lock, CheckCircle } from "lucide-react"

const badges = [
  { icon: CheckCircle, label: "2-YEAR WARRANTY" },
  { icon: Truck,       label: "NATIONWIDE DELIVERY" },
  { icon: Headphones,  label: "TECH SUPPORT 24/7" },
  { icon: Shield,      label: "100% AUTHENTIC" },
  { icon: Lock,        label: "SECURE CHECKOUT" },
]

export function TrustBadges() {
  return (
    <section className="py-6 border-y border-white/5 bg-[#1c1b1b]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {badges.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-2.5 group">
              <Icon className="h-4 w-4 text-[#ff6b00] flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-semibold tracking-[0.12em] text-[#c6c6c6] whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
