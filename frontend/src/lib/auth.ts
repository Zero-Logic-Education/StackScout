import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "./api";

interface User {
  id: string;
  email: string; // Может быть пустым при логине по username, если сервер не вернул профиль
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (username, password) => {
        // Выполняем реальный запрос к API
        try {
          const response = await authApi.login({ username, password });
          const token = response.data.token;

          // Так как /login возвращает только токен, мы пока используем введенный username как имя
          // В будущем можно добавить запрос /me для получения профиля
          set({
            user: {
              id: "current-user",
              email: "", // Мы не знаем email после логина по username без доп запроса
              name: username,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
            },
            isAuthenticated: true,
            token,
          });
        } catch (error) {
          console.error("Login failed", error);
          throw error; // Пробрасываем ошибку чтобы UI мог показать alert
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

          set({
            user: {
              id: "current-user",
              email: email,
              name: username,
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

      logout: () => set({ user: null, isAuthenticated: false, token: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
