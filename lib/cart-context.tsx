"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface Watch {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  brand: string
  inStock: boolean
}

export interface CartItem extends Watch {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (watch: Watch) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("oron-cart")
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("oron-cart", JSON.stringify(items))
    }
  }, [items, mounted])

  const addToCart = (watch: Watch) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === watch.id)
      if (existing) {
        return prev.map((item) =>
          item.id === watch.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...watch, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
