"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, Clock, Package, CreditCard, AlertTriangle, Eye } from "lucide-react"
import { notificationsApi } from "@/services/notifications"
import { toast } from "sonner"
import type { Notification } from "@/types/api"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      toast.success("Notification marked as read")
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      await Promise.all(unreadNotifications.map(n => notificationsApi.markAsRead(n.id)))
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark notifications as read")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "dispute":
        return <AlertTriangle className="h-4 w-4" />
      case "support":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800"
      case "payment":
        return "bg-green-100 text-green-800"
      case "dispute":
        return "bg-red-100 text-red-800"
      case "support":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-md bg-muted/30 animate-pulse" />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-serif tracking-[0.2em] mb-2">Notifications</h1>
                  <p className="text-muted-foreground">
                    Stay updated with important system events and user activities
                  </p>
                </div>
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline">
                    Mark All as Read
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Unread</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notifications.filter(n => n.type === "order").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notifications.filter(n => n.type === "dispute").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>
                  Latest system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll see notifications here when important events occur.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                    </div>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.is_read ? 'bg-background' : 'bg-muted/50 border-primary/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{notification.title}</h4>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(notification.created_at).toLocaleDateString()}
                                  </div>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {notification.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
