import { apiClient } from '@/lib/api';
import type {
  PaymentLink,
  PaymentLinkCreate,
  PaymentLinkUpdate,
  PaymentLinkPublic,
  PaymentLinkCheckoutRequest,
  PaymentLinkCheckoutResponse,
  ChargeInitiateResponse,
  PaymentStatusResponse,
  Order,
  User,
} from '@/types/api';

export const paymentLinksApi = {
  // Admin
  list: async (): Promise<PaymentLink[]> => {
    const response = await apiClient.get<PaymentLink[]>('/payment-links/admin');
    return response.data;
  },

  create: async (data: PaymentLinkCreate): Promise<PaymentLink> => {
    const response = await apiClient.post<PaymentLink>('/payment-links/admin', data);
    return response.data;
  },

  get: async (id: string): Promise<PaymentLink> => {
    const response = await apiClient.get<PaymentLink>(`/payment-links/admin/${id}`);
    return response.data;
  },

  update: async (id: string, data: PaymentLinkUpdate): Promise<PaymentLink> => {
    const response = await apiClient.patch<PaymentLink>(`/payment-links/admin/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/payment-links/admin/${id}`);
  },

  sessions: async (id: string): Promise<(Order & { user?: User })[]> => {
    const response = await apiClient.get<(Order & { user?: User })[]>(`/payment-links/admin/${id}/sessions`);
    return response.data;
  },

  // Public
  getPublic: async (slug: string): Promise<PaymentLinkPublic> => {
    const response = await apiClient.get<PaymentLinkPublic>(`/payment-links/${slug}`);
    return response.data;
  },

  checkout: async (slug: string, data: PaymentLinkCheckoutRequest): Promise<PaymentLinkCheckoutResponse> => {
    const response = await apiClient.post<PaymentLinkCheckoutResponse>(`/payment-links/${slug}/checkout`, data);
    return response.data;
  },

  sessionOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/payment-links/sessions/${orderId}`);
    return response.data;
  },

  sessionCharge: async (orderId: string): Promise<ChargeInitiateResponse> => {
    const response = await apiClient.post<ChargeInitiateResponse>(`/payment-links/sessions/${orderId}/charge`);
    return response.data;
  },

  sessionStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    const response = await apiClient.get<PaymentStatusResponse>(`/payment-links/sessions/${orderId}/status`);
    return response.data;
  },

  sessionVerify: async (orderId: string): Promise<PaymentStatusResponse> => {
    const response = await apiClient.post<PaymentStatusResponse>(`/payment-links/sessions/${orderId}/verify`);
    return response.data;
  },
};
