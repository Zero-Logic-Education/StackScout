import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

// Типы для Auth
export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем интерцептор для JWT токена
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storage = localStorage.getItem("auth-storage");
    if (storage) {
      try {
        const { state } = JSON.parse(storage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        // Ошибка парсинга, игнорируем
      }
    }
  }
  return config;
});

export interface Library {
  id: number;
  name: string;
  source: string;
  version: string;
  healthScore: number;
  license: string;
  description: string;
  repositoryUrl?: string;
  downloads?: number;
  lastUpdate?: string;
  authors?: string[];
}

export interface LibrariesResponse {
  libraries: Library[];
  totalElements: number;
  currentPage: number;
  totalPages: number;
}

// Детальная информация о библиотеке
export interface LibraryDetail extends Library {
  dependencies?: Dependency[];
  vulnerabilities?: Vulnerability[];
  versions?: VersionInfo[];
}

export interface Dependency {
  id: number;
  name: string;
  version: string;
  source: string;
  mode: string;
}

export interface Vulnerability {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  cve?: string;
}

export interface VersionInfo {
  version: string;
  releaseDate: string;
  isLatest: boolean;
}

// Метрики здоровья
export interface HealthMetrics {
  actuality: MetricDetail;
  activity: MetricDetail;
  repository: MetricDetail;
  community: MetricDetail;
  overallScore: number;
}

export interface MetricDetail {
  score: number;
  label: string;
  description?: string;
  details?: Record<string, unknown>;
}

export const libraryApi = {
  getAll: (page = 0, size = 10) =>
    apiClient.get<LibrariesResponse>(`/libraries?page=${page}&size=${size}`),

  search: (query: string, source?: string, page = 0, size = 10) => {
    let url = `/libraries/search?query=${query}&page=${page}&size=${size}`;
    if (source) url += `&source=${source}`;
    return apiClient.get<LibrariesResponse>(url);
  },

  getById: (id: number) => apiClient.get<LibraryDetail>(`/libraries/${id}`),

  getHealth: (id: number) =>
    apiClient.get<HealthMetrics>(`/libraries/${id}/health`),
};

// Типы для подписок
export type UpdateType = "MAJOR" | "MINOR" | "PATCH";

export interface LibrarySubscription {
  id: number;
  userId: number;
  libraryId: number;
  libraryName: string;
  librarySource: string;
  subscribedAt: string;
  notificationsEnabled: boolean;
}

export interface LibraryUpdate {
  id: number;
  libraryId: number;
  libraryName: string;
  librarySource: string;
  oldVersion: string;
  newVersion: string;
  updateType: UpdateType;
  changeLog?: string;
  oldHealthScore?: number;
  newHealthScore?: number;
  updateDate: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscribersCount: number;
  notificationsEnabled: boolean;
}

export interface SubscriptionsResponse {
  content: LibrarySubscription[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UpdatesResponse {
  content: LibraryUpdate[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UpdateStats {
  last7Days: number;
  last30Days: number;
  recentUpdates: LibraryUpdate[];
}

// API методы для аутентификации
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", data),
};

// API методы для подписок
export const subscriptionApi = {
  subscribe: (libraryId: number) =>
    apiClient.post<{ success: boolean; subscription: LibrarySubscription }>(
      `/subscriptions/${libraryId}`
    ),

  unsubscribe: (libraryId: number) =>
    apiClient.delete<{ success: boolean; message: string }>(
      `/subscriptions/${libraryId}`
    ),

  getUserSubscriptions: (page = 0, size = 20, sortBy = "subscribedAt", sortDirection = "DESC") =>
    apiClient.get<SubscriptionsResponse>(
      `/subscriptions?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    ),

  getSubscriptionStatus: (libraryId: number) =>
    apiClient.get<SubscriptionStatus>(`/subscriptions/${libraryId}/status`),

  updateNotifications: (libraryId: number, enabled: boolean) =>
    apiClient.put<LibrarySubscription>(
      `/subscriptions/${libraryId}/notifications`,
      { notificationsEnabled: enabled }
    ),

  getSubscribersCount: (libraryId: number) =>
    apiClient.get<{ subscribersCount: number }>(`/subscriptions/count/${libraryId}`),
};

// API методы для обновлений библиотек
export const libraryUpdateApi = {
  getUpdatesForUser: (page = 0, size = 20) =>
    apiClient.get<UpdatesResponse>(
      `/library-updates?page=${page}&size=${size}`
    ),

  getLibraryUpdates: (libraryId: number, page = 0, size = 20) =>
    apiClient.get<UpdatesResponse>(
      `/library-updates/library/${libraryId}?page=${page}&size=${size}`
    ),

  getRecentUpdates: (days = 7) =>
    apiClient.get<LibraryUpdate[]>(`/library-updates/recent?days=${days}`),

  getUpdatesByType: (updateType: UpdateType, page = 0, size = 20) =>
    apiClient.get<UpdatesResponse>(
      `/library-updates/by-type?updateType=${updateType}&page=${page}&size=${size}`
    ),

  getLatestUpdate: (libraryId: number) =>
    apiClient.get<LibraryUpdate>(`/library-updates/library/${libraryId}/latest`),

  getUpdateStats: () =>
    apiClient.get<UpdateStats>(`/library-updates/stats`),
};
