"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { authApi } from "@/services/auth"
import { AuthShell, AuthHeading } from "@/components/auth-ui"
import { GlassCard, OrangeButton } from "@/components/admin-ui"
import { getErrorMessage } from "@/lib/get-error-message"

function VerifyEmailPageContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    let cancelled = false
    const token = searchParams.get("token")
    if (!token) {
      setStatus("error")
      setMessage("Missing verification token.")
      return
    }

    ;(async () => {
      try {
        const result = await authApi.verifyEmail(token)
        if (!cancelled) {
          setStatus("success")
          setMessage(result.msg || "Email verified.")
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setStatus("error")
          setMessage(getErrorMessage(error, "Verification failed."))
          toast.error(getErrorMessage(error, "Verification failed"))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  return (
    <AuthShell tagline="Timeless Masterpiece. Discover our collection of premium luxury watches crafted with precision and elegance.">
      <AuthHeading
        title={
          status === "loading"
            ? "Verifying your email"
            : status === "success"
              ? "Email verified"
              : "Verification failed"
        }
      />

      <GlassCard className="p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center mx-auto mb-6">
          {status === "loading" && <Loader2 className="h-8 w-8 text-[#ff6b00] animate-spin" />}
          {status === "success" && <CheckCircle2 className="h-8 w-8 text-[#ff6b00]" />}
          {status === "error" && <XCircle className="h-8 w-8 text-[#ff6b00]" />}
        </div>
        <p className="text-[#9a9898] mb-8">
          {status === "loading" ? "Please wait a moment..." : message}
        </p>

        {status !== "loading" && (
          <Link href="/auth/login">
            <OrangeButton className="w-full">GO TO LOGIN</OrangeButton>
          </Link>
        )}
      </GlassCard>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[#9a9898] hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}
