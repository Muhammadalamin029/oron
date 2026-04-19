import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/');
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/');
    return response.data;
  },

  create: async (categoryData: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories/', categoryData);
    return response.data;
  },

  update: async (categoryId: string, categoryData: { name?: string; description?: string }): Promise<Category> => {
    const response = await apiClient.patch<Category>(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  delete: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`);
  },
};
