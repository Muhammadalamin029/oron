"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Bell } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { notificationsApi } from "@/services/notifications"
import { useAuth } from "@/contexts/auth-context"
import type { Notification } from "@/types/api"
import { getErrorMessage } from "@/lib/get-error-message"
import { SiteMain, PageHeading, SecondaryButton, SiteCard, SkeletonLine, EmptyState } from "@/components/site-ui"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent("/notifications")}`)
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    let cancelled = false
    if (!isAuthenticated) return
    ;(async () => {
      try {
        setFetching(true)
        const data = await notificationsApi.getNotifications()
        if (!cancelled) setNotifications(data)
      } catch (error: unknown) {
        if (!cancelled)
          toast.error(getErrorMessage(error, "Failed to load notifications"))
      } finally {
        if (!cancelled) setFetching(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SiteMain>
        <PageHeading
          sub="Updates about your orders and payments."
          action={<SecondaryButton href="/orders">My Orders</SecondaryButton>}
        >
          Notifications
        </PageHeading>

        <SiteCard className="p-6">
          {fetching ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLine key={i} className="h-14" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications yet" />
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    "w-full text-left rounded-lg border border-border p-4 hover:border-primary/30 transition-colors",
                    n.is_read && "opacity-80"
                  )}
                  onClick={async () => {
                    if (n.is_read) return
                    try {
                      const updated = await notificationsApi.markRead(n.id)
                      setNotifications((prev) =>
                        prev.map((x) => (x.id === n.id ? updated : x))
                      )
                    } catch (error: unknown) {
                      toast.error(getErrorMessage(error, "Failed to update"))
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {n.message}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleDateString("en-NG")
                        : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SiteCard>
      </SiteMain>
      <Footer />
    </div>
  )
}
