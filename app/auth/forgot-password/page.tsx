"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Watch, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    toast.success("Reset link sent to your email")

    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Check your email
          </h2>
          <p className="text-muted-foreground mb-8">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <Link href="/auth/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Sign in
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-6">
            Didn&apos;t receive the email?{" "}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign in
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Watch className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Forgot password?
          </h2>
          <p className="text-muted-foreground mt-2">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Reset password"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
