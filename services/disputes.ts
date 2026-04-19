import { apiClient } from "@/lib/api"
import type { Dispute } from "@/types/api"

export const disputesApi = {
  getMyDisputes: async (): Promise<Dispute[]> => {
    const response = await apiClient.get<Dispute[]>("/disputes/my")
    return response.data
  },

  createDispute: async (data: {
    order_id: string
    reason: string
    description?: string
  }): Promise<Dispute> => {
    const response = await apiClient.post<Dispute>("/disputes/", data)
    return response.data
  },

  // admin
  getAllDisputes: async (): Promise<Dispute[]> => {
    const response = await apiClient.get<Dispute[]>("/disputes/")
    return response.data
  },

  updateDispute: async (
    disputeId: string,
    data: { status?: string; resolution_note?: string }
  ): Promise<Dispute> => {
    const response = await apiClient.patch<Dispute>(`/disputes/${disputeId}`, data)
    return response.data
  },
}

