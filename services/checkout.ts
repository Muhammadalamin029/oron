import { apiClient } from '@/lib/api';
import { GuestCheckoutRequest, GuestCheckoutResponse } from '@/types/api';

export const checkoutApi = {
  guestCheckout: async (data: GuestCheckoutRequest): Promise<GuestCheckoutResponse> => {
    const response = await apiClient.post<GuestCheckoutResponse>('/checkout/guest', data);
    return response.data;
  },
};
