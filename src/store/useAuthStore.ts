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
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
  updateProfile: (userData: {
    username: string;
    email: string;
    phoneNumber: string;
  }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,

      // Login sets user state and marks as logged in
      login: (user: User) => set({ user, isLoggedIn: true, isLoading: false }),

      // Logout API + local clear
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

      // Set user manually
      setUser: (user: User) => set({ user }),

      // Set loading state manually
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      // Check user session
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch('/api/auth/me', {
            credentials: 'include', // include cookies
          });

          if (!response.ok) {
            console.error('Auth check failed:', response.status);
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

      // Update user profile
      updateProfile: async (userData) => {
        try {
          set({ isLoading: true });

          const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
          }

          const data = await response.json();
          set({ user: data.user, isLoading: false });
        } catch (error) {
          console.error('Profile update error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

     // stores/useAuthStore.ts 
deleteAccount: async (password: string) => {
  try {
    set({ isLoading: true });
    
    const response = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete account');
    }

    // Clear all auth state and persisted data
    set({ user: null, isLoggedIn: false, isLoading: false });
    
    // Clear persisted storage
    localStorage.removeItem('auth-storage');
    
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
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
