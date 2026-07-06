import { apiClient } from '@/lib/api';
import { Order, Product, User, Dispute } from '@/types/api';

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
}

export const adminApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders/');
    return response.data;
  },

  getAllOrdersWithUsers: async (): Promise<(Order & { user?: User })[]> => {
    const response = await apiClient.get<(Order & { user?: User })[]>('/admin/orders');
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/auth/users');
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

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/admin/stats');
    return response.data;
  }
};
