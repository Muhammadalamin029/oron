import { apiClient } from "@/lib/api";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string | null;
}

export const newsletterApi = {
  subscribe: async (
    email: string,
  ): Promise<{ status: string; detail: string }> => {
    const response = await apiClient.post<{ status: string; detail: string }>(
      "/newsletter/subscribe",
      { email },
    );
    return response.data;
  },

  list: async (): Promise<NewsletterSubscriber[]> => {
    const response = await apiClient.get<NewsletterSubscriber[]>("/newsletter/");
    return response.data;
  },
};
