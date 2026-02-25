"use client";

import { useState, useCallback } from "react";
import { subscriptionApi, LibrarySubscription, SubscriptionStatus } from "@/lib/api";
import { AxiosError } from "axios";

/**
 * Хук для управления подписками на библиотеки
 */
export function useLibrarySubscription(libraryId: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<LibrarySubscription | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);

  // Получить статус подписки
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const response = await subscriptionApi.getSubscriptionStatus(libraryId);
      setStatus(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to fetch subscription status";
      setError(errorMessage);
      return null;
    }
  }, [libraryId]);

  // Подписаться на библиотеку
  const subscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await subscriptionApi.subscribe(libraryId);
      setSubscription(response.data.subscription);
      // Обновляем статус после подписки
      await fetchSubscriptionStatus();
      return response.data.subscription;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to subscribe";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [libraryId, fetchSubscriptionStatus]);

  // Отписаться от библиотеки
  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await subscriptionApi.unsubscribe(libraryId);
      setSubscription(null);
      // Обновляем статус после отписки
      await fetchSubscriptionStatus();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to unsubscribe";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [libraryId, fetchSubscriptionStatus]);

  // Включить/выключить уведомления
  const toggleNotifications = useCallback(async (enabled: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await subscriptionApi.updateNotifications(libraryId, enabled);
      setSubscription(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to update notifications";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [libraryId]);

  return {
    isLoading,
    error,
    subscription,
    status,
    subscribe,
    unsubscribe,
    fetchSubscriptionStatus,
    toggleNotifications,
  };
}
