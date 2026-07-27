"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { ArrowLeft, Mail } from "lucide-react"
import { AuthShell, AuthHeading, AuthLabel, AuthInput } from "@/components/auth-ui"
import { GlassCard, OrangeButton } from "@/components/admin-ui"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setIsSubmitted(true)
    toast.success("Reset link sent to your email")

    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <AuthShell tagline="No worries, we'll send you reset instructions.">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-[#ff6b00]" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-4">Check your email</h2>
          <p className="text-[#9a9898] mb-8">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-white">{email}</span>
          </p>
          <Link href="/auth/login">
            <OrangeButton className="w-full">BACK TO SIGN IN</OrangeButton>
          </Link>
          <p className="text-sm text-[#9a9898] mt-6">
            Didn&apos;t receive the email?{" "}
            <button onClick={() => setIsSubmitted(false)} className="text-[#ff6b00] hover:underline">
              Try again
            </button>
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell tagline="No worries, we'll send you reset instructions.">
      <Link
        href="/auth/login"
        className="inline-flex items-center text-sm text-[#9a9898] hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sign in
      </Link>

      <AuthHeading title="Forgot password?" sub="No worries, we'll send you reset instructions." />

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <AuthLabel htmlFor="email">Email</AuthLabel>
            <AuthInput
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <OrangeButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "SENDING..." : "RESET PASSWORD"}
          </OrangeButton>
        </form>
      </GlassCard>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[#9a9898] hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>
    </AuthShell>
  )
}
