import { Payment, ChargeInitiateResponse, PaymentStatusResponse } from '@/types/api';
import { apiClient } from '@/lib/api';

export const paymentsApi = {
  initiateCharge: async (orderId: string): Promise<ChargeInitiateResponse> => {
    const response = await apiClient.post<ChargeInitiateResponse>(`/payments/orders/${orderId}/charge`);
    return response.data;
  },

  getPaymentStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    const response = await apiClient.get<PaymentStatusResponse>(`/payments/orders/${orderId}/status`);
    return response.data;
  },

  verifyPayment: async (orderId: string): Promise<PaymentStatusResponse> => {
    const response = await apiClient.post<PaymentStatusResponse>(`/payments/orders/${orderId}/verify`);
    return response.data;
  },

  getUserPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/payments/my-payments');
    return response.data;
  },

  getAllPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/payments/admin/all-payments');
    return response.data;
  },

  getPaymentDetails: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/payments/admin/${paymentId}`);
    return response.data;
  }
};
