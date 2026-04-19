"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authApi } from "@/services/auth"

export default function VerificationRequiredPage() {
  const { user } = useAuth()
  const [isResending, setIsResending] = useState(false)

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsResending(true)
    try {
      await authApi.resendVerification(user.email)
      toast.success("Verification email sent! Please check your inbox.")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to resend verification email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription>
                Please verify your email address to access all features of ORON Marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Verification email sent to this address
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Next steps:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-xs">1</span>
                    </div>
                    <span>Check your email inbox</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-xs">2</span>
                    </div>
                    <span>Click the verification link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      <span className="text-xs">3</span>
                    </div>
                    <span>Return to continue shopping</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  <p>Didn't receive the email?</p>
                  <p>Check your spam folder or request a new verification email.</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  After verification, you'll be able to:
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>Place orders</li>
                  <li>Track your purchases</li>
                  <li>Receive notifications</li>
                  <li>Access customer support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
