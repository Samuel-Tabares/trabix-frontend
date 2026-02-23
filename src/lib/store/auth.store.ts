'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfo, AuthResponse } from '@/types/auth.types';

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  // refreshToken eliminado — ahora se almacena en HttpOnly cookie (no accesible desde JS)
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  login: (response: AuthResponse) => void;
  logout: () => void;
  updateTokens: (accessToken: string) => void;
  updateUser: (partial: Partial<UserInfo>) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,

      login: (response: AuthResponse) =>
        set({
          user: response.user,
          accessToken: response.accessToken,
          // refreshToken viene en cookie HttpOnly — el browser lo guarda automáticamente
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      updateTokens: (accessToken: string) => set({ accessToken }),

      updateUser: (partial: Partial<UserInfo>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'trabix-auth',
      partialize: (state) => ({
        user: state.user,
        // refreshToken ya no se persiste en localStorage — está en HttpOnly cookie
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
