import { apiClient } from '@/lib/api';

export interface SiteSetting {
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

export const settingsApi = {
  getAllSettings: async (): Promise<SiteSetting[]> => {
    const response = await apiClient.get<SiteSetting[]>('/settings/');
    return response.data;
  },

  getSetting: async (key: string): Promise<SiteSetting | null> => {
    try {
      const response = await apiClient.get<SiteSetting>(`/settings/${key}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  updateSetting: async (key: string, data: { value: string; description?: string }): Promise<SiteSetting> => {
    const response = await apiClient.post<SiteSetting>(`/settings/${key}`, data);
    return response.data;
  }
};
