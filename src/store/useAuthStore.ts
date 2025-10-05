// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: string;
  isAdmin: boolean;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: true,
      
      login: (user: User) => set({ user, isLoggedIn: true, isLoading: false }),
      
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isLoggedIn: false, isLoading: false });
        }
      },
      
      setUser: (user: User) => set({ user }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          if (data.user) {
            set({ user: data.user, isLoggedIn: true, isLoading: false });
          } else {
            set({ user: null, isLoggedIn: false, isLoading: false });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          set({ user: null, isLoggedIn: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn 
      }),
    }
  )
);