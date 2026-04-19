// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  is_active: boolean;
  category_id: string;
  created_at: string;
  updated_at?: string;
  category: Category;
}

export interface ProductCreate {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  stock: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category_id?: string;
  stock?: number;
  is_active?: boolean;
}

// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  shipping_info?: OrderShippingInfo | null;
  shipments?: Shipment[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface OrderCreate {
  items: {
    product_id: string;
    quantity: number;
  }[];
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Common query parameters
export interface QueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Reviews
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at?: string;
  user?: User;
}

// Disputes
export interface Dispute {
  id: string;
  user_id: string;
  order_id: string;
  reason: string;
  description: string;
  status: string;
  resolution_note?: string;
  created_at: string;
  updated_at?: string;
}

// Addresses
export interface Address {
  id: string;
  user_id: string;
  label?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  is_default?: boolean;
  created_at: string;
  updated_at?: string;
}

// Shipping/Fulfillment
export interface OrderShippingInfo {
  id: string;
  order_id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  created_at: string;
  updated_at?: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  carrier?: string;
  tracking_number?: string;
  status: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string;
}

// Support
export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender: string;
  message: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id?: string | null;
  email?: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at?: string;
  messages?: SupportMessage[];
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
