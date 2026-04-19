const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

type InternalRequestInit = RequestInit & { _retry?: boolean };

class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const url = `${this.baseURL}/auth/refresh`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.dispatchEvent(new Event('auth:logout'));
          return null;
        }

        const data = await response.json();
        if (data?.access_token) localStorage.setItem('access_token', data.access_token);
        if (data?.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        window.dispatchEvent(new Event('auth:token'));
        return data?.access_token || null;
      })().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: InternalRequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (response.status === 401 && typeof window !== 'undefined' && !options._retry) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.request<T>(endpoint, { ...options, _retry: true });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // FastAPI returns errors as { detail: "..." }
        const message = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
        throw new ApiError(message, response.status, errorData);
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        throw new ApiError(error.message, 500);
      }
      
      throw new ApiError('Unknown error occurred', 500);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ) : undefined;
    const url = cleanParams && Object.keys(cleanParams).length > 0
      ? `${endpoint}?${new URLSearchParams(cleanParams)}`
      : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /** For OAuth2PasswordRequestForm — sends application/x-www-form-urlencoded */
  async postForm<T>(endpoint: string, data: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();
export { ApiError };
