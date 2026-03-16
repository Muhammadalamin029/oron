"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const slides = [
  {
    title: "High-Quality Leather-Strapped Watch",
    subtitle: "High quality wrist watch brand in Nigeria",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop",
  },
  {
    title: "Luxurious Wrist Watch Collection",
    subtitle: "Elegance meets precision in every timepiece",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
  },
  {
    title: "Premium Craftsmanship",
    subtitle: "Handcrafted with attention to every detail",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=600&fit=crop",
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-muted">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
          </div>
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
                {slide.title}
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                {slide.subtitle}
              </p>
              <Link href="/products">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-medium">
                  EXPLORE OUR COLLECTION
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-primary" : "bg-muted-foreground/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
