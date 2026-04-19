"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { authApi } from "@/services/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerification?: boolean
}

export function ProtectedRoute({ children, requireVerification = true }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return
      }

      if (requireVerification && user) {
        // Check verification status
        const checkVerificationStatus = async () => {
          try {
            const status = await authApi.getVerificationStatus()
            if (!status.is_verified) {
              router.push("/auth/verification-required")
            } else {
              setIsChecking(false)
            }
          } catch (error) {
            // If we can't check status, assume verified
            setIsChecking(false)
          }
        }

        checkVerificationStatus()
      } else {
        setIsChecking(false)
      }
    }
  }, [isAuthenticated, loading, user, router, requireVerification])

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}
