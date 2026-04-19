import { apiClient } from "@/lib/api"
import type { Address } from "@/types/api"

export const addressesApi = {
  list: async (): Promise<Address[]> => {
    const response = await apiClient.get<Address[]>("/addresses/")
    return response.data
  },

  create: async (data: {
    label?: string
    phone?: string
    line1: string
    line2?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
    is_default?: boolean
  }): Promise<Address> => {
    const response = await apiClient.post<Address>("/addresses/", data)
    return response.data
  },

  update: async (id: string, data: Partial<Address>): Promise<Address> => {
    const response = await apiClient.patch<Address>(`/addresses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`)
  },
}
