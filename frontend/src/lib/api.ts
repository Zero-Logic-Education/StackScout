import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
