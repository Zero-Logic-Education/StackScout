import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: "USER" | "ADMIN";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  previousPage: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  setPreviousPage: (page: string) => void;
  getPreviousPage: () => string | null;
  clearPreviousPage: () => void;
}

// Функция для парсинга JWT и извлечения роли
const parseJWT = (token: string): { role?: string } => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT", error);
    return {};
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      previousPage: null,

      login: async (username, password) => {
        try {
          const response = await authApi.login({ username, password });
          const token = response.data.token;
          const decoded = parseJWT(token);

          // Сохраняем токен в cookie для middleware проверки
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${token}; path=/; max-age=86400`;
          }

          set({
            user: {
              id: "current-user",
              email: "",
              name: username,
              role: (decoded.role as "USER" | "ADMIN") || "USER",
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
            },
            isAuthenticated: true,
            token,
          });
        } catch (error) {
          console.error("Login failed", error);
          throw error;
        }
      },

      register: async (username, email, password) => {
        try {
          const response = await authApi.register({
            username,
            email,
            password,
          });
          const token = response.data.token;
          const decoded = parseJWT(token);

          // Сохраняем токен в cookie для middleware проверки
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${token}; path=/; max-age=86400`;
          }

          set({
            user: {
              id: "current-user",
              email: email,
              name: username,
              role: (decoded.role as "USER" | "ADMIN") || "USER",
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
            },
            isAuthenticated: true,
            token,
          });
        } catch (error) {
          console.error("Register failed", error);
          throw error;
        }
      },

      logout: () => {
        // Удаляем токен из cookie при выходе
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
        }
        set({ user: null, isAuthenticated: false, token: null, previousPage: null });
      },

      isAdmin: () => {
        const state = get();
        return state.user?.role === "ADMIN";
      },

      setPreviousPage: (page: string) => {
        set({ previousPage: page });
      },

      getPreviousPage: () => {
        const state = get();
        return state.previousPage;
      },

      clearPreviousPage: () => {
        set({ previousPage: null });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
