import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach the Bearer token
api.interceptors.request.use(
  (config) => {
    // Reading directly from localStorage where Zustand persist saves the state
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('wefixit-auth');
        if (authData) {
          const { state } = JSON.parse(authData);
          if (state.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        }
      } catch (error) {
        console.error('Failed to parse auth token', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
