export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  language_code: "ru" | "kk";
  auto_reply_enabled: boolean;
  auto_dumping_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface KaspiKey {
  id: string;
  merchant_id: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  days_of_stock: number;
  category: string;
  image_url?: string;
  dumping_enabled: boolean;
  min_price?: number;
  competitor_price?: number;
  last_price_update?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  author: string;
  rating: number;
  text: string;
  ai_response?: string;
  replied: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_products: number;
  low_stock_count: number;
  dumping_enabled_count: number;
  total_reviews: number;
  pending_replies: number;
  average_rating: number;
  total_inventory_value: number;
}

export interface DashboardOverview {
  total_products: number;
  low_stock: Product[];
  dumping_products: Product[];
  recent_reviews: Review[];
  pending_reviews: Review[];
  low_stock_count: number;
  dumping_count: number;
  pending_count: number;
}

export interface ApiError {
  error: string;
  details?: string;
}
