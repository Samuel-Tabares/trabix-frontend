'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfo, AuthResponse } from '@/types/auth.types';

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  login: (response: AuthResponse) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (partial: Partial<UserInfo>) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      login: (response: AuthResponse) =>
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateTokens: (accessToken: string, refreshToken: string) =>
        set({ accessToken, refreshToken }),

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
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
