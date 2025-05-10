// src/stores/auth.ts
import { defineStore } from 'pinia';
import type { User } from '@/types'; // プロジェクトの User 型定義
import { api } from '@/api';

interface AuthState {
  user: User | null;
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token'),
  }),
  actions: {
    async register(email: string, password: string) {
      try {
        const res = await api.post<{ token: string }>('/auth/register', { email, password });
        this.token = res.data.token;
        localStorage.setItem('token', this.token);
        await this.fetchProfile();
      } catch (e: any) {
        console.error('register error(auth.ts):', e);
        throw new Error(e.response?.data?.error || '登録に失敗しました');
      }
    },
    async login(email: string, password: string) {
      try {
        const res = await api.post<{ token: string }>('/auth/login', { email, password });
        this.token = res.data.token;
        localStorage.setItem('token', this.token);
        await this.fetchProfile();
      } catch (e: any) {
        throw new Error(e.response?.data?.error || 'ログインに失敗しました');
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },
    // optional: プロフィール取得
    async fetchProfile() {
      const res = await api.get<User>('/auth/profile');
      this.user = res.data;
    }
  }
});
