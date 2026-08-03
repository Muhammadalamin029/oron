import { apiClient } from "@/lib/api";

export interface NotificationRule {
  action: string;
  notify_customers: boolean;
  notify_newsletter: boolean;
  updated_at?: string | null;
}

export const notificationRulesApi = {
  list: async (): Promise<NotificationRule[]> => {
    const response = await apiClient.get<NotificationRule[]>("/notification-rules/");
    return response.data;
  },

  update: async (
    action: string,
    data: { notify_customers: boolean; notify_newsletter: boolean },
  ): Promise<NotificationRule> => {
    const response = await apiClient.post<NotificationRule>(
      `/notification-rules/${action}`,
      data,
    );
    return response.data;
  },
};
