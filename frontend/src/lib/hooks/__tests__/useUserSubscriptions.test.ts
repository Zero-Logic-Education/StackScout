/**
 * Модульные тесты для хука useUserSubscriptions
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserSubscriptions } from '@/lib/hooks/useUserSubscriptions';
import { subscriptionApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  subscriptionApi: {
    getUserSubscriptions: jest.fn(),
  },
}));

describe('useUserSubscriptions', () => {
  const mockSubscriptions = [
    {
      id: 1,
      userId: 1,
      libraryId: 1,
      libraryName: 'React',
      librarySource: 'npm',
      subscribedAt: '2024-01-01T00:00:00Z',
      notificationsEnabled: true,
    },
    {
      id: 2,
      userId: 1,
      libraryId: 2,
      libraryName: 'Vue',
      librarySource: 'npm',
      subscribedAt: '2024-01-02T00:00:00Z',
      notificationsEnabled: false,
    },
  ];

  const mockResponse = {
    content: mockSubscriptions,
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен инициализироваться с начальными значениями', () => {
    const { result } = renderHook(() => useUserSubscriptions());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.subscriptions).toEqual([]);
    expect(result.current.pagination.totalElements).toBe(0);
  });

  it('должен загрузить подписки пользователя', async () => {
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const { result } = renderHook(() => useUserSubscriptions());

    await act(async () => {
      await result.current.fetchSubscriptions(0, 20);
    });

    await waitFor(() => {
      expect(result.current.subscriptions).toEqual(mockSubscriptions);
      expect(result.current.pagination.totalElements).toBe(2);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('должен проверять подписку на конкретную библиотеку', async () => {
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const { result } = renderHook(() => useUserSubscriptions());

    await act(async () => {
      await result.current.fetchSubscriptions();
    });

    await waitFor(() => {
      expect(result.current.isSubscribedTo(1)).toBe(true);
      expect(result.current.isSubscribedTo(2)).toBe(true);
      expect(result.current.isSubscribedTo(999)).toBe(false);
    });
  });

  it('должен автоматически загружать подписки при autoFetch=true', async () => {
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    renderHook(() => useUserSubscriptions({ autoFetch: true }));

    await waitFor(() => {
      expect(subscriptionApi.getUserSubscriptions).toHaveBeenCalled();
    });
  });

  it('должен обработать ошибку при загрузке подписок', async () => {
    const errorMessage = 'Failed to fetch subscriptions';
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useUserSubscriptions());

    await act(async () => {
      await result.current.fetchSubscriptions();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('должен поддерживать сортировку и пагинацию', async () => {
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const { result } = renderHook(() => useUserSubscriptions());

    await act(async () => {
      await result.current.fetchSubscriptions(1, 10, 'libraryName', 'ASC');
    });

    await waitFor(() => {
      expect(subscriptionApi.getUserSubscriptions).toHaveBeenCalledWith(
        1,
        10,
        'libraryName',
        'ASC'
      );
    });
  });
});
