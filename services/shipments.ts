import { apiClient } from "@/lib/api"
import type { Shipment } from "@/types/api"

export const shipmentsApi = {
  getOrderShipments: async (orderId: string): Promise<Shipment[]> => {
    const response = await apiClient.get<Shipment[]>(`/shipments/order/${orderId}`)
    return response.data
  },

  // admin
  createShipment: async (data: {
    order_id: string
    carrier?: string
    tracking_number?: string
    status?: string
  }): Promise<Shipment> => {
    const response = await apiClient.post<Shipment>("/shipments/", data)
    return response.data
  },
}

