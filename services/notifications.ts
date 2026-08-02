import { apiClient } from "@/lib/api";
import type { Notification } from "@/types/api";

export interface BroadcastPayload {
  title: string;
  subject: string;
  message: string;
  include_customers?: boolean;
  include_newsletter?: boolean;
  custom_recipients?: string[];
  is_html?: boolean;
  unsubscribe_url?: string | null;
}

export interface BroadcastMessage {
  id: string;
  subject: string;
  title: string;
  message: string;
  include_customers: boolean;
  include_newsletter: boolean;
  recipient_count: number;
  recipient_emails: string[];
  created_at: string;
  sent_by_admin: string;
}

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>("/notifications/");
    return response.data;
  },

  getBroadcasts: async (): Promise<BroadcastMessage[]> => {
    const response = await apiClient.get<BroadcastMessage[]>("/broadcast/");
    return response.data;
  },

  markRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(
      `/notifications/${notificationId}/read`,
    );
    return response.data;
  },

  sendBroadcast: async (
    payload: BroadcastPayload,
  ): Promise<{
    status: string;
    detail: string;
    broadcast_id: string;
    recipient_count: number;
    include_customers: boolean;
    include_newsletter: boolean;
  }> => {
    const response = await apiClient.post<{
      status: string;
      detail: string;
      broadcast_id: string;
      recipient_count: number;
      include_customers: boolean;
      include_newsletter: boolean;
    }>("/broadcast/", payload);
    return response.data;
  },
};
