import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserSubscriptions } from '@/lib/hooks/useUserSubscriptions';
import { subscriptionApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  subscriptionApi: {
    getUserSubscriptions: jest.fn(),
  },
}));

describe('useUserSubscriptions', () => {
  const mockSubscriptions = {
    content: [
      {
        id: 1,
        userId: 1,
        libraryId: 1,
        libraryName: 'requests',
        librarySource: 'pypi',
        subscribedAt: '2024-01-01T00:00:00Z',
        notificationsEnabled: true,
      },
      {
        id: 2,
        userId: 1,
        libraryId: 2,
        libraryName: 'flask',
        librarySource: 'pypi',
        subscribedAt: '2024-01-02T00:00:00Z',
        notificationsEnabled: false,
      },
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useUserSubscriptions());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.subscriptions).toHaveLength(0);
    expect(result.current.pagination).toEqual({
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 20,
    });
  });

  it('should fetch user subscriptions successfully', async () => {
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockResolvedValue({
      data: mockSubscriptions,
    });

    const { result } = renderHook(() => useUserSubscriptions());

    await act(async () => {
      await result.current.fetchSubscriptions(0, 20);
    });

    await waitFor(() => {
      expect(result.current.subscriptions).toEqual(mockSubscriptions.content);
      expect(result.current.pagination.totalPages).toBe(1);
      expect(result.current.pagination.totalElements).toBe(2);
    });

    expect(subscriptionApi.getUserSubscriptions).toHaveBeenCalledWith(0, 20, 'subscribedAt', 'DESC');
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch subscriptions';
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useUserSubscriptions());

    await act(async () => {
      const res = await result.current.fetchSubscriptions(0, 20);
      expect(res).toBeNull();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should check if subscribed to specific library', async () => {
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockResolvedValue({
      data: mockSubscriptions,
    });

    const { result } = renderHook(() => useUserSubscriptions());

    await act(async () => {
      await result.current.fetchSubscriptions();
    });

    await waitFor(() => {
      expect(result.current.subscriptions).toHaveLength(2);
    });

    expect(result.current.isSubscribedTo(1)).toBe(true);
    expect(result.current.isSubscribedTo(2)).toBe(true);
    expect(result.current.isSubscribedTo(99)).toBe(false);
  });

  it('should auto-fetch when autoFetch is true', async () => {
    (subscriptionApi.getUserSubscriptions as jest.Mock).mockResolvedValue({
      data: mockSubscriptions,
    });

    renderHook(() => useUserSubscriptions({ autoFetch: true, page: 0, size: 20 }));

    await waitFor(() => {
      expect(subscriptionApi.getUserSubscriptions).toHaveBeenCalledWith(0, 20, 'subscribedAt', 'DESC');
    });
  });
});
