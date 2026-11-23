import { create } from 'zustand';
import { UserProfileOut, UserRole } from '../types/auth';
import {
  saveAccessToken,
  getAccessToken,
  saveUserData,
  getUserData,
  clearSecureStorage,
} from '../utils/secureStore';
import { setOnUnauthorizedCallback } from '../api/client';
import { usersApi } from '../api/users';

interface AuthState {
  user: UserProfileOut | null;
  token: string | null;
  activeRole: 'passenger' | 'driver';
  isLoading: boolean;
  isAuthenticated: boolean;
  initAuth: () => Promise<void>;
  setAuth: (token: string, user: UserProfileOut, defaultRole?: UserRole) => Promise<void>;
  updateUser: (user: Partial<UserProfileOut>) => Promise<void>;
  switchRole: (role: 'passenger' | 'driver') => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Bind 401 callback to logout
  setOnUnauthorizedCallback(() => {
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  });

  return {
    user: null,
    token: null,
    activeRole: 'passenger',
    isLoading: true,
    isAuthenticated: false,

    initAuth: async () => {
      try {
        const token = await getAccessToken();
        const savedUser = await getUserData<UserProfileOut>();

        if (token) {
          // Determine initial active role
          const role = savedUser?.role === 'driver' || savedUser?.is_driver ? 'driver' : 'passenger';
          set({
            token,
            user: savedUser,
            isAuthenticated: true,
            activeRole: role,
            isLoading: false,
          });

          // Fetch fresh profile in the background
          try {
            const freshUser = await usersApi.getMyProfile();
            await saveUserData(freshUser);
            set({ user: freshUser });
          } catch {
            // keep cached profile
          }
        } else {
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    },

    setAuth: async (token: string, user: UserProfileOut, defaultRole?: UserRole) => {
      await saveAccessToken(token);
      await saveUserData(user);
      const activeRole = defaultRole === 'driver' || user.is_driver ? 'driver' : 'passenger';
      set({
        token,
        user,
        activeRole,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    updateUser: async (partialUser: Partial<UserProfileOut>) => {
      const current = get().user;
      if (!current) return;
      const updated = { ...current, ...partialUser };
      await saveUserData(updated);
      set({ user: updated });
    },

    switchRole: (role: 'passenger' | 'driver') => {
      set({ activeRole: role });
    },

    logout: async () => {
      await clearSecureStorage();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        activeRole: 'passenger',
      });
    },
  };
});
