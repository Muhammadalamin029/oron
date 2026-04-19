import { apiClient } from '@/lib/api';
import { Product, ProductCreate, ProductUpdate, QueryParams } from '@/types/api';

export const productsApi = {
  // Get all products with optional filtering
  getProducts: async (params?: QueryParams): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/', params);
    return response.data;
  },

  // Get a single product by ID
  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Create a new product
  createProduct: async (product: ProductCreate): Promise<Product> => {
    const response = await apiClient.post<Product>('/products/', product);
    return response.data;
  },

  // Update an existing product
  updateProduct: async (id: string, product: ProductUpdate): Promise<Product> => {
    const response = await apiClient.patch<Product>(`/products/${id}`, product);
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Get products by category
  getProductsByCategory: async (category: string, params?: QueryParams): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/', { ...params, category });
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, params?: QueryParams): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products/', { ...params, search: query });
    return response.data;
  },
};
