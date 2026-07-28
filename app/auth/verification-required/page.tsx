"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authApi } from "@/services/auth"
import { AuthShell } from "@/components/auth-ui"
import { GlassCard, OrangeButton } from "@/components/admin-ui"
import { getErrorMessage } from "@/lib/get-error-message"

export default function VerificationRequiredPage() {
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsResending(true)
    try {
      await authApi.resendVerification(user.email)
      toast.success("Verification email sent! Please check your inbox.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to resend verification email"))
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell tagline="Please verify your email address to access all features of ORON.">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-[#ff6b00]" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Verify your email</h2>
        <p className="text-[#9a9898] mt-2">
          Please verify your email address to access all features of ORON Marketplace.
        </p>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#9a9898] flex-shrink-0" />
            <div className="text-left">
              <p className="font-medium text-white">{user?.email}</p>
              <p className="text-sm text-[#9a9898]">Verification email sent to this address</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-[#9a9898] mb-6">
          {["Check your email inbox", "Click the verification link", "Return to continue shopping"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border border-[#ff6b00] flex items-center justify-center text-xs text-[#ff6b00] flex-shrink-0">
                  {i + 1}
                </div>
                <span>{step}</span>
              </div>
            )
          )}
        </div>

        <OrangeButton
          onClick={handleResendVerification}
          disabled={isResending}
          className="w-full"
        >
          {isResending ? "SENDING..." : "RESEND VERIFICATION EMAIL"}
        </OrangeButton>

        <p className="text-xs text-[#9a9898] text-center mt-4">
          Didn&apos;t receive the email? Check your spam folder or request a new one above.
        </p>
      </GlassCard>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[#9a9898] hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>
    </AuthShell>
  )
}
