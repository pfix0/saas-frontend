/**
 * ساس — API Client
 * Calls the Railway backend from the Vercel frontend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('saas_access_token');
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, token, headers: extraHeaders } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };

    // Add auth token
    const authToken = token || this.getToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle token expiry
      if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request
          return this.request(endpoint, options);
        }
      }
      throw new ApiError(data.error || 'حدث خطأ', response.status);
    }

    return data;
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('saas_refresh_token');
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        this.clearAuth();
        return false;
      }

      const data = await res.json();
      localStorage.setItem('saas_access_token', data.data.tokens.accessToken);
      localStorage.setItem('saas_refresh_token', data.data.tokens.refreshToken);
      return true;
    } catch {
      this.clearAuth();
      return false;
    }
  }

  setAuth(accessToken: string, refreshToken: string) {
    localStorage.setItem('saas_access_token', accessToken);
    localStorage.setItem('saas_refresh_token', refreshToken);
  }

  clearAuth() {
    localStorage.removeItem('saas_access_token');
    localStorage.removeItem('saas_refresh_token');
  }

  // ═══ Shorthand methods ═══

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  post<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Error class
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Singleton instance
export const api = new ApiClient(API_URL);
export default api;
