import { ApiService } from './base';
import { User } from '@/types';
import { environment } from '@/config/environment';

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export class AuthService extends ApiService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/login', {
      email,
      password
    });

    localStorage.setItem(environment.auth.tokenKey, data.token);
    localStorage.setItem(environment.auth.refreshTokenKey, data.refreshToken);

    return data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem(environment.auth.tokenKey);
    localStorage.removeItem(environment.auth.refreshTokenKey);
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.api.get<User>('/auth/me');
    return data;
  }
}

export const authService = new AuthService(); 