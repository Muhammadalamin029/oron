import { apiClient } from '@/lib/api';
import { Category } from '@/types/api';

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/');
    return response.data;
  },
};
