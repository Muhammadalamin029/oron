"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api"
import { AuthShell, AuthHeading, AuthLabel, AuthInput } from "@/components/auth-ui"
import { GlassCard, OrangeButton } from "@/components/admin-ui"
import { getErrorMessage } from "@/lib/get-error-message"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await login(formData.email, formData.password)
      toast.success(user.is_admin ? "Welcome back, Admin!" : "Login successful!")
      const next = searchParams.get("next")
      if (next) {
        if (next.startsWith("/admin") && !user.is_admin) {
          router.push("/")
        } else {
          router.push(next)
        }
        return
      }
      router.push(user.is_admin ? "/admin" : "/")
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 403) {
        router.push(`/auth/forgot-password?sent=1&email=${encodeURIComponent(formData.email)}`)
        return
      }
      toast.error(getErrorMessage(error, "Please enter valid credentials"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell tagline="Timeless Masterpiece. Discover our collection of premium luxury watches crafted with precision and elegance.">
      <AuthHeading title="Welcome back" sub="Sign in to your account to continue" />

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <AuthLabel htmlFor="email">Email</AuthLabel>
            <AuthInput
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="password"
                className="text-[10px] font-bold tracking-[0.2em] text-[#9a9898] uppercase"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-[#ff6b00] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <AuthInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <label className="flex items-center gap-2 text-sm text-[#9a9898] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              className="w-4 h-4 rounded border-[#353534] bg-[#0a0a0a] accent-[#ff6b00]"
            />
            Remember me for 30 days
          </label>

          <OrangeButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </OrangeButton>
        </form>
      </GlassCard>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#9a9898]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#ff6b00] font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[#9a9898] hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>
    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
