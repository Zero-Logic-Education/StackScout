"use client";

import { useState, useCallback, useEffect } from "react";
import { libraryUpdateApi, LibraryUpdate, UpdateStats } from "@/lib/api";
import { AxiosError } from "axios";

interface UseLibraryUpdatesOptions {
  autoFetch?: boolean;
  page?: number;
  size?: number;
}

/**
 * Хук для получения обновлений библиотек, на которые подписан пользователь
 */
export function useLibraryUpdates(options: UseLibraryUpdatesOptions = {}) {
  const { autoFetch = false, page = 0, size = 20 } = options;
  
  const [updates, setUpdates] = useState<LibraryUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: page,
    size: size,
  });

  // Получить обновления для пользователя
  const fetchUpdates = useCallback(async (pageNum = 0, pageSize = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await libraryUpdateApi.getUpdatesForUser(pageNum, pageSize);
      setUpdates(response.data.content);
      setPagination({
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        size: response.data.size,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to fetch updates";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получить последние обновления за N дней
  const fetchRecentUpdates = useCallback(async (days = 7) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await libraryUpdateApi.getRecentUpdates(days);
      setUpdates(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to fetch recent updates";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Автоматически загрузить обновления при монтировании
  useEffect(() => {
    if (autoFetch) {
      fetchUpdates(page, size);
    }
  }, [autoFetch, page, size, fetchUpdates]);

  return {
    updates,
    isLoading,
    error,
    pagination,
    fetchUpdates,
    fetchRecentUpdates,
  };
}

/**
 * Хук для получения обновлений конкретной библиотеки
 */
export function useLibraryUpdateHistory(libraryId: number, options: UseLibraryUpdatesOptions = {}) {
  const { autoFetch = false, page = 0, size = 20 } = options;
  
  const [updates, setUpdates] = useState<LibraryUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: page,
    size: size,
  });

  // Получить историю обновлений библиотеки
  const fetchLibraryUpdates = useCallback(async (pageNum = 0, pageSize = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await libraryUpdateApi.getLibraryUpdates(libraryId, pageNum, pageSize);
      setUpdates(response.data.content);
      setPagination({
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        size: response.data.size,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to fetch library updates";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [libraryId]);

  // Получить последнее обновление
  const fetchLatestUpdate = useCallback(async () => {
    try {
      const response = await libraryUpdateApi.getLatestUpdate(libraryId);
      return response.data;
    } catch {
      // Если обновлений нет, это норма
      return null;
    }
  }, [libraryId]);

  // Автоматически загрузить историю при монтировании
  useEffect(() => {
    if (autoFetch && libraryId) {
      fetchLibraryUpdates(page, size);
    }
  }, [autoFetch, libraryId, page, size, fetchLibraryUpdates]);

  return {
    updates,
    isLoading,
    error,
    pagination,
    fetchLibraryUpdates,
    fetchLatestUpdate,
  };
}

/**
 * Хук для получения статистики обновлений
 */
export function useUpdateStats() {
  const [stats, setStats] = useState<UpdateStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await libraryUpdateApi.getUpdateStats();
      setStats(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to fetch update stats";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}
