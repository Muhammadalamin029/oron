import { apiClient } from "@/lib/api"
import type { Notification } from "@/types/api"

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>("/notifications/")
    return response.data
  },

  markRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`)
    return response.data
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${notificationId}/read`)
    return response.data
  },
}

