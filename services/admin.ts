import { apiClient } from '@/lib/api';
import { Order, Product, User } from '@/types/api';

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

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/auth/users');
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
    const [ordersRes, productsRes, usersRes] = await Promise.all([
      apiClient.get<Order[]>('/orders/'),
      apiClient.get<Product[]>('/products/'),
      apiClient.get<User[]>('/auth/users'),
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const users = usersRes.data || [];

    return {
      total_revenue: orders
        .filter((o) => ['paid', 'completed', 'success', 'shipped', 'delivered'].includes((o.status || '').toLowerCase()))
        .reduce((sum, o) => sum + o.total_amount, 0),
      total_orders: orders.length,
      total_products: products.length,
      total_customers: users.filter((u) => !u.is_admin).length,
    };
  }
};
