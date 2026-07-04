import axios from 'axios';
import { env } from '../env';

export const apiClient = axios.create({
  baseURL: env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use((response) => {
  const body = response.data;
  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success === false) {
      const msg = body.error?.message ?? 'Backend error';
      return Promise.reject(new Error(msg));
    }
    response.data = body.data;
  }
  return response;
});
