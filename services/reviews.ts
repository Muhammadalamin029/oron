import { apiClient } from "@/lib/api"
import type { Review } from "@/types/api"

export const reviewsApi = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>(`/reviews/product/${productId}`)
    return response.data
  },

  createReview: async (data: {
    product_id: string
    rating: number
    title?: string
    comment?: string
  }): Promise<Review> => {
    const response = await apiClient.post<Review>("/reviews/", data)
    return response.data
  },

  // admin
  getAllReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>("/reviews/")
    return response.data
  },

  setApproval: async (reviewId: string, approved: boolean): Promise<Review> => {
    const response = await apiClient.patch<Review>(`/reviews/${reviewId}/approve?approved=${approved}`)
    return response.data
  },
}
