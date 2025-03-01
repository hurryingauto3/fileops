import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { environment } from '@/config/environment';
import { handleApiError } from '@/utils/error-handling';

export class ApiService {
  protected api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: environment.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(environment.auth.tokenKey);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem(environment.auth.refreshTokenKey);
            const response = await this.api.post('/auth/refresh', { refreshToken });
            const { token } = response.data;
            
            localStorage.setItem(environment.auth.tokenKey, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            return this.api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem(environment.auth.tokenKey);
            localStorage.removeItem(environment.auth.refreshTokenKey);
            window.location.href = '/signin';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(handleApiError(error));
      }
    );
  }
} 