import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'admin' | 'technician';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'wefixit-auth', // localStorage key
    }
  )
);
