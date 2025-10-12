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
  updateProfile: (userData: { username: string; email: string; phoneNumber: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false, // Start as false
      
      login: (user: User) => set({ user, isLoggedIn: true, isLoading: false }),
      
      logout: async () => {
        try {
          set({ isLoading: true });
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
          set({ isLoading: true });
          const response = await fetch('/api/auth/me', {
            credentials: 'include', // Ensure cookies are sent
          });
          
          if (!response.ok) {
            console.error('Auth check failed with status:', response.status);
            set({ user: null, isLoggedIn: false, isLoading: false });
            return;
          }
          
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

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true });
          
          const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies are sent
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
          }

          const data = await response.json();
          set({ 
            user: data.user, 
            isLoading: false 
          });
          
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
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