import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 3500,
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const raw = localStorage.getItem('sandata-store');
  if (raw) {
    const { state } = JSON.parse(raw);
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
  }
  return config;
});

export default api;
