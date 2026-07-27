import { apiClient } from '@/lib/api';
import { Order, User, Dispute, AdminDashboardResponse } from '@/types/api';

export const adminApi = {
  getAllOrdersWithUsers: async (): Promise<(Order & { user?: User })[]> => {
    const response = await apiClient.get<(Order & { user?: User })[]>('/admin/orders');
    return response.data;
  },

  getOrderWithUser: async (orderId: string): Promise<Order & { user?: User }> => {
    const response = await apiClient.get<Order & { user?: User }>(`/admin/orders/${orderId}`);
    return response.data;
  },

  getUsersWithStats: async (): Promise<(User & { total_orders?: number; total_spent?: number })[]> => {
    const response = await apiClient.get<(User & { total_orders?: number; total_spent?: number })[]>('/admin/users/stats');
    return response.data;
  },

  getDisputesWithDetails: async (): Promise<(Dispute & { user?: User; order?: Order })[]> => {
    const response = await apiClient.get<(Dispute & { user?: User; order?: Order })[]>('/admin/disputes');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${orderId}/status?status=${status}`);
    return response.data;
  },
  
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  getDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
    return response.data;
  }
};
