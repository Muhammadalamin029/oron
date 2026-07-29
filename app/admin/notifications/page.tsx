"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Bell, CheckCircle, Clock, Package, CreditCard, AlertTriangle, Headphones } from "lucide-react"
import { notificationsApi } from "@/services/notifications"
import type { Notification } from "@/types/api"
import { AdminPageHeader, GlassCard, SkeletonRows, EmptyState, StatTile } from "@/components/admin-ui"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/get-error-message"

const ICONS: Record<string, typeof Bell> = {
  order: Package,
  payment: CreditCard,
  dispute: AlertTriangle,
  support: Headphones,
}

const ICON_COLORS: Record<string, string> = {
  order: "bg-blue-900/20 text-blue-400",
  payment: "bg-green-900/20 text-green-400",
  dispute: "bg-red-900/20 text-red-400",
  support: "bg-amber-900/20 text-amber-400",
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await notificationsApi.getNotifications()
        if (!cancelled) setNotifications(data)
      } catch (error: unknown) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load notifications"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
    } catch {
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read)
      await Promise.all(unread.map((n) => notificationsApi.markAsRead(n.id)))
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark notifications as read")
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const stats = [
    { label: "Total", value: notifications.length },
    { label: "Unread", value: unreadCount, accent: true },
    { label: "Orders", value: notifications.filter((n) => n.type === "order").length },
    { label: "Disputes", value: notifications.filter((n) => n.type === "dispute").length },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="NOTIFICATIONS"
        sub="/ SYSTEM ALERTS"
        action={
          unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              className="border border-border text-muted-foreground hover:text-white hover:border-primary transition-colors px-6 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase"
            >
              Mark All Read
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} highlight={stat.accent} />
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <SkeletonRows count={5} height="h-16" />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No notifications yet"
            message="You'll see notifications here when important events occur."
          />
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => {
              const Icon = ICONS[n.type] || Bell
              return (
                <div
                  key={n.id}
                  className={cn("flex items-start gap-4 p-5", !n.is_read && "bg-white/[0.02]")}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      ICON_COLORS[n.type] || "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">{n.title}</p>
                      {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{n.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded border border-border uppercase tracking-widest text-[9px] font-bold">
                        {n.type}
                      </span>
                    </div>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      aria-label="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
