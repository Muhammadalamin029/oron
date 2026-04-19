"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { authApi } from "@/services/auth"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    let cancelled = false
    const token = searchParams.get("token")
    if (!token) {
      setLoading(false)
      setMessage("Missing verification token.")
      return
    }

    ;(async () => {
      try {
        setLoading(true)
        const result = await authApi.verifyEmail(token)
        if (!cancelled) setMessage(result.msg || "Email verified.")
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error?.message || "Verification failed")
          setMessage(error?.message || "Verification failed.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-serif text-foreground mb-4">
            Verify Email
          </h1>
          <p className="text-muted-foreground mb-8">
            {loading ? "Verifying your email..." : message}
          </p>
          <Link href="/auth/login">
            <Button className="bg-primary text-primary-foreground">
              Go to Login
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

