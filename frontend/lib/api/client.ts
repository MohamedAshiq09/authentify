import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/session/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        } else {
          // No refresh token, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

// Generic API methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.get(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.post(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.put(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.delete(url, config),
};

export default apiClient;