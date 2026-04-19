import { apiClient } from '@/lib/api';
import { Order, OrderCreate, OrderShippingInfo } from '@/types/api';

export const ordersApi = {
  createOrder: async (data: OrderCreate): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders/', data);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders/');
    return response.data;
  },
  
  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  upsertShippingInfo: async (orderId: string, data: Omit<OrderShippingInfo, "id" | "order_id" | "created_at" | "updated_at">): Promise<OrderShippingInfo> => {
    const response = await apiClient.post<OrderShippingInfo>(`/orders/${orderId}/shipping`, data);
    return response.data;
  },

  getShippingInfo: async (orderId: string): Promise<OrderShippingInfo | null> => {
    const response = await apiClient.get<OrderShippingInfo | null>(`/orders/${orderId}/shipping`);
    return response.data;
  },
};
