import { apiClient } from "@/lib/api"
import type { SupportMessage, SupportTicket } from "@/types/api"

export const supportApi = {
  createTicket: async (data: { subject: string; message: string }): Promise<SupportTicket> => {
    const response = await apiClient.post<SupportTicket>("/support/tickets", data)
    return response.data
  },

  myTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get<SupportTicket[]>("/support/tickets/my")
    return response.data
  },

  getTicket: async (ticketId: string): Promise<SupportTicket> => {
    const response = await apiClient.get<SupportTicket>(`/support/tickets/${ticketId}`)
    return response.data
  },

  addMessage: async (ticketId: string, message: string): Promise<SupportMessage> => {
    const response = await apiClient.post<SupportMessage>(`/support/tickets/${ticketId}/messages`, { message })
    return response.data
  },

  // admin
  allTickets: async (): Promise<SupportTicket[]> => {
    const response = await apiClient.get<SupportTicket[]>("/support/tickets")
    return response.data
  },

  updateTicket: async (ticketId: string, data: { status?: string }): Promise<SupportTicket> => {
    const response = await apiClient.patch<SupportTicket>(`/support/tickets/${ticketId}`, data)
    return response.data
  },
}

