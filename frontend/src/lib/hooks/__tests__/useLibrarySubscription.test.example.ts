/**
 * Модульные тесты для хука useLibrarySubscription
 * 
 * Для запуска тестов необходимо установить:
 * npm install --save-dev @testing-library/react @testing-library/react-hooks @testing-library/jest-dom jest jest-environment-jsdom
 * 
 * И добавить в package.json:
 * "scripts": {
 *   "test": "jest",
 *   "test:watch": "jest --watch"
 * }
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLibrarySubscription } from '@/lib/hooks/useLibrarySubscription';
import { subscriptionApi } from '@/lib/api';

// Мокируем API
jest.mock('@/lib/api', () => ({
  subscriptionApi: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    getSubscriptionStatus: jest.fn(),
    updateNotifications: jest.fn(),
  },
}));

describe('useLibrarySubscription', () => {
  const libraryId = 1;
  const mockSubscription = {
    id: 1,
    userId: 1,
    libraryId: 1,
    libraryName: 'Test Library',
    librarySource: 'npm',
    subscribedAt: '2024-01-01T00:00:00Z',
    notificationsEnabled: true,
  };

  const mockStatus = {
    isSubscribed: false,
    subscribersCount: 10,
    notificationsEnabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен инициализироваться с начальными значениями', () => {
    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.subscription).toBeNull();
    expect(result.current.status).toBeNull();
  });

  it('должен успешно подписаться на библиотеку', async () => {
    (subscriptionApi.subscribe as jest.Mock).mockResolvedValue({
      data: { subscription: mockSubscription },
    });
    (subscriptionApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
      data: { ...mockStatus, isSubscribed: true },
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      await result.current.subscribe();
    });

    await waitFor(() => {
      expect(result.current.subscription).toEqual(mockSubscription);
      expect(result.current.isLoading).toBe(false);
      expect(subscriptionApi.subscribe).toHaveBeenCalledWith(libraryId);
    });
  });

  it('должен успешно отписаться от библиотеки', async () => {
    (subscriptionApi.unsubscribe as jest.Mock).mockResolvedValue({});
    (subscriptionApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
      data: { ...mockStatus, isSubscribed: false },
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      await result.current.unsubscribe();
    });

    await waitFor(() => {
      expect(result.current.subscription).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(subscriptionApi.unsubscribe).toHaveBeenCalledWith(libraryId);
    });
  });

  it('должен получить статус подписки', async () => {
    (subscriptionApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
      data: mockStatus,
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      await result.current.fetchSubscriptionStatus();
    });

    await waitFor(() => {
      expect(result.current.status).toEqual(mockStatus);
      expect(subscriptionApi.getSubscriptionStatus).toHaveBeenCalledWith(libraryId);
    });
  });

  it('должен переключать уведомления', async () => {
    const updatedSubscription = { ...mockSubscription, notificationsEnabled: false };
    (subscriptionApi.updateNotifications as jest.Mock).mockResolvedValue({
      data: updatedSubscription,
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      await result.current.toggleNotifications(false);
    });

    await waitFor(() => {
      expect(result.current.subscription).toEqual(updatedSubscription);
      expect(result.current.isLoading).toBe(false);
      expect(subscriptionApi.updateNotifications).toHaveBeenCalledWith(libraryId, false);
    });
  });

  it('должен обработать ошибку при подписке', async () => {
    const errorMessage = 'Failed to subscribe';
    (subscriptionApi.subscribe as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      try {
        await result.current.subscribe();
      } catch (error) {
        // Ожидаем ошибку
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
