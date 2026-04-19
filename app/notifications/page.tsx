"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notificationsApi } from "@/services/notifications"
import { useAuth } from "@/contexts/auth-context"
import type { Notification } from "@/types/api"

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
      } catch (error: any) {
        if (!cancelled)
          toast.error(error?.message || "Failed to load notifications")
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
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Updates about your orders and payments.
            </p>
          </div>
          <Link href="/orders">
            <Button variant="outline">My Orders</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-md bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className={`w-full text-left rounded-md border border-border p-4 hover:bg-muted/30 transition-colors ${
                      n.is_read ? "opacity-80" : ""
                    }`}
                    onClick={async () => {
                      if (n.is_read) return
                      try {
                        const updated = await notificationsApi.markRead(n.id)
                        setNotifications((prev) =>
                          prev.map((x) => (x.id === n.id ? updated : x))
                        )
                      } catch (error: any) {
                        toast.error(error?.message || "Failed to update")
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
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

