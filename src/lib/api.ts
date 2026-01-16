import axios, { AxiosError, AxiosInstance } from "axios";
import Cookies from "js-cookie";
import type {
  User,
  AuthResponse,
  KaspiKey,
  Product,
  Review,
  DashboardStats,
  DashboardOverview,
  ApiError,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          Cookies.remove("token");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    language?: string;
  }): Promise<AuthResponse> {
    const { data: response } = await this.client.post<AuthResponse>("/auth/register", data);
    Cookies.set("token", response.token, { expires: 7 });
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    Cookies.set("token", data.token, { expires: 7 });
    return data;
  }

  async getMe(): Promise<User> {
    const { data } = await this.client.get<User>("/auth/me");
    return data;
  }

  logout(): void {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // User
  async getProfile(): Promise<User> {
    const { data } = await this.client.get<User>("/user/profile");
    return data;
  }

  async updateSettings(settings: Partial<Pick<User, "auto_reply_enabled" | "auto_dumping_enabled" | "language_code">>): Promise<User> {
    const { data } = await this.client.patch<User>("/user/settings", settings);
    return data;
  }

  // Kaspi Key
  async getKaspiKey(): Promise<KaspiKey | null> {
    try {
      const { data } = await this.client.get<KaspiKey>("/kaspi-key");
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async saveKaspiKey(apiKey: string, merchantId: string): Promise<KaspiKey> {
    const { data } = await this.client.post<KaspiKey>("/kaspi-key", {
      api_key: apiKey,
      merchant_id: merchantId,
    });
    return data;
  }

  async deleteKaspiKey(): Promise<void> {
    await this.client.delete("/kaspi-key");
  }

  // Products
  async getProducts(): Promise<{ products: Product[]; count: number }> {
    const { data } = await this.client.get<{ products: Product[]; count: number }>("/products");
    return data;
  }

  async getProduct(id: string): Promise<Product> {
    const { data } = await this.client.get<Product>(`/products/${id}`);
    return data;
  }

  async getLowStockProducts(): Promise<{ products: Product[]; count: number }> {
    const { data } = await this.client.get<{ products: Product[]; count: number }>("/products/low-stock");
    return data;
  }

  async getDumpingProducts(): Promise<{ products: Product[]; count: number }> {
    const { data } = await this.client.get<{ products: Product[]; count: number }>("/products/dumping");
    return data;
  }

  async enableDumping(productId: string, minPrice: number): Promise<Product> {
    const { data } = await this.client.post<Product>(`/products/${productId}/dumping/enable`, {
      min_price: minPrice,
    });
    return data;
  }

  async disableDumping(productId: string): Promise<Product> {
    const { data } = await this.client.post<Product>(`/products/${productId}/dumping/disable`);
    return data;
  }

  // Reviews
  async getReviews(limit: number = 50): Promise<{ reviews: Review[]; count: number }> {
    const { data } = await this.client.get<{ reviews: Review[]; count: number }>(`/reviews?limit=${limit}`);
    return data;
  }

  async getReview(id: string): Promise<Review> {
    const { data } = await this.client.get<Review>(`/reviews/${id}`);
    return data;
  }

  async getPendingReviews(): Promise<{ reviews: Review[]; count: number }> {
    const { data } = await this.client.get<{ reviews: Review[]; count: number }>("/reviews/pending");
    return data;
  }

  async generateAiReply(reviewId: string, language: "ru" | "kk" = "ru"): Promise<{ message: string; review: Review; ai_response: string }> {
    const { data } = await this.client.post<{ message: string; review: Review; ai_response: string }>(`/reviews/${reviewId}/generate-reply`, {
      language,
    });
    return data;
  }

  async updateReply(reviewId: string, aiResponse: string): Promise<Review> {
    const { data } = await this.client.patch<Review>(`/reviews/${reviewId}/reply`, {
      ai_response: aiResponse,
    });
    return data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await this.client.get<DashboardStats>("/dashboard/stats");
    return data;
  }

  async getDashboardOverview(): Promise<DashboardOverview> {
    const { data } = await this.client.get<DashboardOverview>("/dashboard/overview");
    return data;
  }

  // Health
  async healthCheck(): Promise<{ status: string }> {
    const { data } = await this.client.get<{ status: string }>("/health");
    return data;
  }
}

export const api = new ApiClient();
