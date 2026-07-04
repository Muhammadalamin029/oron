"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

const slides = [
  {
    tag: "New Release",
    headline: ["NEXT-GEN", "WRISTWARE"],
    subtext: "Smartwatches engineered for the bold — precision meets performance.",
    cta: "SHOP NOW",
    href: "/products",
    bg: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&h=900&fit=crop&q=85",
  },
  {
    tag: "Premium Audio",
    headline: ["SOUND WITHOUT", "LIMITS"],
    subtext: "Noise-cancelling headphones & earbuds built for the relentless.",
    cta: "EXPLORE AUDIO",
    href: "/products",
    bg: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&h=900&fit=crop&q=85",
  },
  {
    tag: "Always Charged",
    headline: ["POWER.", "ALWAYS ON."],
    subtext: "High-capacity power banks and chargers — never run out anywhere.",
    cta: "SHOP POWER",
    href: "/products",
    bg: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1600&h=900&fit=crop&q=85",
  },
]

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 700)
  }, [animating])

  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = () => goTo((current + 1) % slides.length)

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [current, goTo])

  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-[#0e0e0e]">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* BG Image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-[1.02] transition-transform duration-[8000ms] ease-linear"
            style={{
              backgroundImage: `url(${slide.bg})`,
              transform: i === current ? "scale(1.05)" : "scale(1)",
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 z-20 max-w-[1280px] mx-auto left-0 right-0">
            <div className={cn("max-w-2xl", i === current ? "fade-up" : "")}>
              {/* Tag */}
              <span className="inline-flex items-center gap-2 text-[#ff6b00] text-xs font-semibold tracking-[0.35em] uppercase mb-5">
                <span className="h-px w-8 bg-[#ff6b00]" />
                {slide.tag}
              </span>

              {/* Headline */}
              <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] tracking-tight text-white mb-5">
                {slide.headline[0]}
                <br />
                <span className="text-[#ff6b00]">{slide.headline[1]}</span>
              </h1>

              {/* Subtext */}
              <p className="text-[#c6c6c6] text-base md:text-lg mb-8 max-w-md leading-relaxed">
                {slide.subtext}
              </p>

              {/* CTA */}
              <Link
                href={slide.href}
                className="inline-flex items-center gap-3 bg-[#ff6b00] text-white font-semibold text-sm tracking-widest px-8 py-4 rounded-full glow-hover transition-all active:scale-95 hover:bg-[#ff8533]"
              >
                {slide.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Controls */}
      <div className="absolute bottom-8 left-6 md:left-12 z-30 flex items-center gap-4">
        <button
          onClick={prev}
          className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2 ml-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-6 h-2 bg-[#ff6b00]"
                  : "w-2 h-2 bg-white/25 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-10 right-6 md:right-12 z-30 text-[#9a9898] text-xs font-semibold tracking-widest">
        0{current + 1} / 0{slides.length}
      </div>
    </section>
  )
}
