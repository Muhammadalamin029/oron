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
  
  updateSetting: async (key: string, value: string, description?: string): Promise<SiteSetting> => {
    const response = await apiClient.post<SiteSetting>(`/settings/${key}`, { value, description });
    return response.data;
  }
};
