import { renderHook, act, waitFor } from '@testing-library/react';
import { useLibrarySubscription } from '@/lib/hooks/useLibrarySubscription';
import { subscriptionApi } from '@/lib/api';

// Mock the API module
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
    librarySource: 'pypi',
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

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.subscription).toBeNull();
    expect(result.current.status).toBeNull();
  });

  it('should successfully subscribe to a library', async () => {
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
      expect(subscriptionApi.subscribe).toHaveBeenCalledWith(libraryId);
    });
  });

  it('should successfully unsubscribe from a library', async () => {
    (subscriptionApi.unsubscribe as jest.Mock).mockResolvedValue({ data: { success: true } });
    (subscriptionApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
      data: { ...mockStatus, isSubscribed: false },
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      await result.current.unsubscribe();
    });

    await waitFor(() => {
      expect(subscriptionApi.unsubscribe).toHaveBeenCalledWith(libraryId);
    });
  });

  it('should fetch subscription status', async () => {
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

  it('should toggle notifications', async () => {
    const updatedSubscription = { ...mockSubscription, notificationsEnabled: false };
    (subscriptionApi.updateNotifications as jest.Mock).mockResolvedValue({
      data: updatedSubscription,
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      await result.current.toggleNotifications(false);
    });

    await waitFor(() => {
      expect(subscriptionApi.updateNotifications).toHaveBeenCalledWith(libraryId, false);
    });
  });

  it('should handle subscription error', async () => {
    const errorMessage = 'Failed to subscribe';
    (subscriptionApi.subscribe as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useLibrarySubscription(libraryId));

    await act(async () => {
      try {
        await result.current.subscribe();
      } catch {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
