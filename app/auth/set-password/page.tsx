"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { authApi } from "@/services/auth"
import { useAuth } from "@/contexts/auth-context"
import { getPasswordError } from "@/lib/validation"
import { AuthShell, AuthHeading, AuthLabel, AuthInput } from "@/components/auth-ui"
import { SiteCard, PrimaryButton } from "@/components/site-ui"
import { getErrorMessage } from "@/lib/get-error-message"

function SetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { applySession } = useAuth()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Missing or invalid link. Please check your email again.")
      return
    }

    const passwordError = getPasswordError(password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const result = await authApi.setPassword(token, password)
      applySession(result)
      toast.success("Password set! You're now signed in.")
      router.push(result.order_id ? `/orders/${result.order_id}` : "/account")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to set password"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell tagline="Set a password to access your account, orders, and more.">
      <AuthHeading title="Set your password" sub="This verifies your email and unlocks your account." />

      <SiteCard className="p-6 sm:p-8">
        {!token ? (
          <p className="text-center text-[#9a9898]">
            This link is missing its verification token. Please use the link from your email.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <AuthLabel htmlFor="password">Password</AuthLabel>
              <div className="relative">
                <AuthInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9898] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <AuthLabel htmlFor="confirmPassword">Confirm Password</AuthLabel>
              <AuthInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <PrimaryButton type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "SETTING PASSWORD..." : "SET PASSWORD & CONTINUE"}
            </PrimaryButton>
          </form>
        )}
      </SiteCard>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[#9a9898] hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>
    </AuthShell>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPasswordPageContent />
    </Suspense>
  )
}
