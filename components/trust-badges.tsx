import { Shield, Award, CheckCircle } from "lucide-react"

const badges = [
  {
    icon: Shield,
    title: "AUTHENTICITY",
    subtitle: "GUARANTEED",
  },
  {
    icon: Award,
    title: "2-YEAR WARRANTY",
    subtitle: "",
  },
  {
    icon: CheckCircle,
    title: "100% AUTHENTICITY",
    subtitle: "GUARANTEED",
  },
]

export function TrustBadges() {
  return (
    <section className="py-8 border-y border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {badges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <badge.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground text-sm">
                  {badge.title}
                </p>
                {badge.subtitle && (
                  <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
