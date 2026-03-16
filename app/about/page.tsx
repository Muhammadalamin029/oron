import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Award, Heart, Globe } from "lucide-react"

const values = [
  {
    icon: Shield,
    title: "Authenticity",
    description:
      "Every ORON timepiece comes with a certificate of authenticity, ensuring you receive only genuine products.",
  },
  {
    icon: Award,
    title: "Quality",
    description:
      "We partner with the finest craftsmen to bring you watches that stand the test of time.",
  },
  {
    icon: Heart,
    title: "Passion",
    description:
      "Our love for horology drives us to curate only the most exceptional timepieces.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description:
      "Making luxury watches accessible to Nigerians without compromising on quality.",
  },
]

const team = [
  {
    name: "Adewale Johnson",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
  },
  {
    name: "Chioma Okonkwo",
    role: "Head of Curation",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
  },
  {
    name: "Emeka Nwachukwu",
    role: "Operations Director",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative h-[400px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1509941943102-10c232535736?w=1200&h=600&fit=crop)",
            }}
          >
            <div className="absolute inset-0 bg-foreground/60" />
          </div>
          <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
            <div className="text-center text-background">
              <h1 className="text-4xl md:text-5xl font-serif mb-4">Our Story</h1>
              <p className="text-lg max-w-2xl mx-auto opacity-90">
                Bringing timeless elegance to Nigeria since 2020
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif text-foreground mb-6">
                  The ORON Journey
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    ORON was born from a passion for exceptional timepieces and a
                    desire to make luxury watches accessible to Nigerians. What
                    started as a small collection has grown into Nigeria&apos;s
                    premier destination for quality wristwatches.
                  </p>
                  <p>
                    Our name, ORON, reflects our Nigerian heritage and our
                    commitment to serving our community with excellence. We believe
                    that everyone deserves to own a timepiece that tells their
                    story.
                  </p>
                  <p>
                    Today, we curate the finest leather-strapped watches from
                    around the world, each piece carefully selected for its
                    craftsmanship, design, and durability. Our 2-year warranty and
                    authenticity guarantee ensure peace of mind with every
                    purchase.
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=400&fit=crop"
                  alt="ORON workshop"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif text-center text-foreground mb-12">
              Our Values
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif text-center text-foreground mb-12">
              Meet Our Team
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
