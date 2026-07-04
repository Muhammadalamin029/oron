"use client"

import Image from "next/image"
import { Star, Quote } from "lucide-react"

const review = {
  text: '"ORON isn\'t just about the hardware; it\'s a statement of digital sovereignty. The engineering precision is unmatched in the current consumer market."',
  name: "ALEX K.",
  role: "CYBERSECURITY ARCHITECT",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  rating: 5,
}

const showcase = [
  {
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    alt: "Smartwatch on wrist",
  },
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    alt: "Premium headphones",
    offset: true,
  },
  {
    src: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop",
    alt: "Power bank lifestyle",
    offset: true,
    negOffset: true,
  },
  {
    src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop",
    alt: "Tech accessories desk setup",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 max-w-[1280px] mx-auto px-6">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-14">
        <h2 className="font-display font-bold text-4xl text-white">
          WHAT CUSTOMERS SAY
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#353534] to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Review card */}
        <div className="relative bg-[#111111] rounded-lg border border-[#353534] p-10 overflow-hidden">
          {/* Orange left border accent */}
          <div className="absolute left-0 top-8 bottom-8 w-1 bg-[#ff6b00] rounded-full" />

          {/* Big quote icon */}
          <Quote className="absolute top-8 right-8 h-16 w-16 text-[#ff6b00]/10" />

          <div className="relative z-10">
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#ff6b00] text-[#ff6b00]" />
              ))}
            </div>

            {/* Quote */}
            <p className="font-display font-semibold text-xl md:text-2xl text-[#e5e2e1] leading-snug italic mb-8">
              {review.text}
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-[#ff6b00]/30">
                <Image
                  src={review.avatar}
                  alt={review.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-display font-bold text-[#e5e2e1] tracking-wide">
                  {review.name}
                </p>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9a9898]">
                  {review.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image mosaic */}
        <div className="grid grid-cols-2 gap-3">
          {showcase.map(({ src, alt, offset, negOffset }, i) => (
            <div
              key={i}
              className={`relative h-44 rounded-lg overflow-hidden ${
                offset ? (negOffset ? "-mt-6" : "mt-6") : ""
              }`}
            >
              <Image src={src} alt={alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
