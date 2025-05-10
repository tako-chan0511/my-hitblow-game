// src/api/index.ts
import axios from 'axios';

// APIインスタンス作成
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// JWTトークンを自動付与
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

/**
 * 完了ゲーム履歴を取得
 * GET /api/history/completed
 */
export function fetchCompletedHistory() {
  return api.get<{
    id: number;
    digitCount: number;
    attempts: number;
    finishedAt: string;
  }[]>('/history/completed');
}

/**
 * 完了ゲーム履歴を登録
 * POST /api/history/completed
 */
export function postCompletedHistory(
  digitCount: number,
  attempts: number
) {
  return api.post<{
    id: number;
    digitCount: number;
    attempts: number;
    finishedAt: string;
  }>('/history/completed', { digitCount, attempts });
}
