"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"
import { CreditCard, Building2, Smartphone, Lock, ChevronLeft } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const tax = totalPrice * 0.075
  const shipping = totalPrice >= 100000 ? 0 : 2500
  const finalTotal = totalPrice + tax + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    clearCart()
    toast.success("Payment successful!")
    router.push("/checkout/success")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif text-foreground mb-4">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Add some watches to your cart before checking out.
          </p>
          <Link href="/products">
            <Button className="bg-primary text-primary-foreground">
              Browse Collection
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-serif text-foreground mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Street Name"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Lagos"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="Lagos"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">
                  Payment Method
                </h2>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label
                      htmlFor="card"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span>Credit / Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label
                      htmlFor="bank"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Building2 className="h-5 w-5 text-primary" />
                      <span>Bank Transfer</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary transition-colors">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label
                      htmlFor="mobile"
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <Smartphone className="h-5 w-5 text-primary" />
                      <span>Mobile Money / USSD</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, cardNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={(e) =>
                            setFormData({ ...formData, expiry: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) =>
                            setFormData({ ...formData, cvv: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-card-foreground line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-card-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-card-foreground">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-card-foreground">
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (7.5%)</span>
                    <span className="text-card-foreground">
                      {formatPrice(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-border pt-3">
                    <span className="text-card-foreground">Total</span>
                    <span className="text-card-foreground">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 py-6"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay {formatPrice(finalTotal)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
