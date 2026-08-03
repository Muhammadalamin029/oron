"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { newsletterApi } from "@/services/newsletter"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteMain, SiteCard, IconCircle, PrimaryButton } from "@/components/site-ui"

function UnsubscribePageContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    let cancelled = false
    const email = searchParams.get("email")
    if (!email) {
      setStatus("error")
      setMessage("Missing email address.")
      return
    }

    ;(async () => {
      try {
        const result = await newsletterApi.unsubscribe(email)
        if (!cancelled) {
          setStatus("success")
          setMessage(result.detail || "You've been unsubscribed.")
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setStatus("error")
          setMessage(getErrorMessage(error, "Failed to unsubscribe. Please try again."))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SiteMain guard>
        <div className="max-w-md mx-auto text-center">
          <SiteCard className="p-8">
            <div className="flex justify-center mb-6">
              <IconCircle
                icon={
                  status === "loading" ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : status === "success" ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : (
                    <XCircle className="h-8 w-8" />
                  )
                }
                size="lg"
                tone={status === "success" ? "success" : status === "error" ? "muted" : "primary"}
              />
            </div>
            <h1 className="font-display font-bold text-2xl text-white mb-2">
              {status === "loading"
                ? "Unsubscribing..."
                : status === "success"
                  ? "You're unsubscribed"
                  : "Something went wrong"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {status === "loading" ? "Please wait a moment..." : message}
            </p>
            {status !== "loading" && (
              <PrimaryButton href="/" className="w-full">
                Back to Home
              </PrimaryButton>
            )}
          </SiteCard>
        </div>
      </SiteMain>
      <Footer />
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnsubscribePageContent />
    </Suspense>
  )
}
