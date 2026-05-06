import axiosClient from './axiosClient';
import type { LoginRequest, RegisterRequest, TokenResponse, UserResponse } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosClient.post<TokenResponse>('/api/v1/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    axiosClient.post<UserResponse>('/api/v1/auth/register', data).then((r) => r.data),

  me: () =>
    axiosClient.get<UserResponse>('/api/v1/auth/me').then((r) => r.data),

  logout: (refreshToken: string) =>
    axiosClient.post('/api/v1/auth/logout', { refresh_token: refreshToken }),
};
