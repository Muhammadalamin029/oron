import { apiClient } from '@/lib/api';

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaymentVerifyResponse {
  reference: string;
  status: string;
  amount: number;
  order_id: string;
  order_status: string;
}

export const paymentsApi = {
  initializePayment: async (data: { order_id: string }): Promise<PaystackInitResponse> => {
    const response = await apiClient.post<PaystackInitResponse>('/payments/initialize', data);
    return response.data;
  },
  
  verifyPayment: async (reference: string): Promise<PaymentVerifyResponse> => {
    const response = await apiClient.get<PaymentVerifyResponse>(`/payments/verify/${reference}`);
    return response.data;
  }
};
