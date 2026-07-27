"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getPasswordError } from "@/lib/validation"
import { AuthShell, AuthHeading, AuthLabel, AuthInput } from "@/components/auth-ui"
import { GlassCard, OrangeButton } from "@/components/admin-ui"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const passwordError = getPasswordError(formData.password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (!formData.terms) {
      toast.error("Please accept the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      await register(formData.email, formData.name, formData.password)
      toast.success("Account created! Please check your email to verify.")
      router.push("/auth/login")
    } catch (error: any) {
      toast.error(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell tagline="Join our community of watch enthusiasts and get exclusive access to limited edition timepieces.">
      <AuthHeading title="Create an account" sub="Join ORON to start your watch collection" />

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <AuthLabel htmlFor="name">Full Name</AuthLabel>
            <AuthInput
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

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
            <AuthLabel htmlFor="password">Password</AuthLabel>
            <div className="relative">
              <AuthInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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

          <div>
            <AuthLabel htmlFor="confirmPassword">Confirm Password</AuthLabel>
            <AuthInput
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-[#9a9898] cursor-pointer leading-5">
            <input
              type="checkbox"
              checked={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded border-[#353534] bg-[#0a0a0a] accent-[#ff6b00] flex-shrink-0"
            />
            <span>
              I agree to the{" "}
              <Link href="#" className="text-[#ff6b00] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#ff6b00] hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          <OrangeButton type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </OrangeButton>
        </form>
      </GlassCard>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#9a9898]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#ff6b00] font-semibold hover:underline">
            Sign in
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
