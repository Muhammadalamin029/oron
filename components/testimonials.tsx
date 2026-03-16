"use client"

import Image from "next/image"
import { Star, Play } from "lucide-react"
import { testimonials } from "@/lib/watches"

export function Testimonials() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-serif text-center mb-12 text-foreground">
          Testimonials
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-primary text-primary"
                />
              ))}
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {testimonials[0].text}
            </p>
            <div className="flex items-center gap-3">
              <Image
                src={testimonials[0].image}
                alt={testimonials[0].name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="font-medium text-card-foreground">
                {testimonials[0].name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=300&h=300&fit=crop"
                alt="Watch showcase"
                fill
                className="object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-foreground/20 hover:bg-foreground/30 transition-colors" aria-label="Play video">
                <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-foreground ml-1" />
                </div>
              </button>
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1509941943102-10c232535736?w=300&h=300&fit=crop"
                alt="Watch on wrist"
                fill
                className="object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-foreground/20 hover:bg-foreground/30 transition-colors" aria-label="Play video">
                <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-foreground ml-1" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
