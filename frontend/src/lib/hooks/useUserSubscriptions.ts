"use client";

import { useState, useCallback, useEffect } from "react";
import { subscriptionApi, LibrarySubscription } from "@/lib/api";
import { AxiosError } from "axios";

interface UseUserSubscriptionsOptions {
  autoFetch?: boolean;
  page?: number;
  size?: number;
}

/**
 * Хук для получения всех подписок пользователя
 */
export function useUserSubscriptions(options: UseUserSubscriptionsOptions = {}) {
  const { autoFetch = false, page = 0, size = 20 } = options;
  
  const [subscriptions, setSubscriptions] = useState<LibrarySubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: page,
    size: size,
  });

  // Получить все подписки пользователя
  const fetchSubscriptions = useCallback(
    async (pageNum = 0, pageSize = 20, sortBy = "subscribedAt", sortDirection = "DESC") => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await subscriptionApi.getUserSubscriptions(
          pageNum,
          pageSize,
          sortBy,
          sortDirection
        );
        setSubscriptions(response.data.content);
        setPagination({
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages,
          currentPage: response.data.number,
          size: response.data.size,
        });
        return response.data;
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        const errorMessage = error.response?.data?.message || "Failed to fetch subscriptions";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Проверить подписку на конкретную библиотеку
  const isSubscribedTo = useCallback(
    (libraryId: number) => {
      return subscriptions.some((sub) => sub.libraryId === libraryId);
    },
    [subscriptions]
  );

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (autoFetch) {
      fetchSubscriptions(page, size);
    }
  }, [autoFetch, page, size, fetchSubscriptions]);

  return {
    subscriptions,
    isLoading,
    error,
    pagination,
    fetchSubscriptions,
    isSubscribedTo,
  };
}
