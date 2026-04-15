import { renderHook, act, waitFor } from '@testing-library/react';
import { useLibraryUpdates, useUpdateStats } from '@/lib/hooks/useLibraryUpdates';
import { libraryUpdateApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  libraryUpdateApi: {
    getUpdatesForUser: jest.fn(),
    getRecentUpdates: jest.fn(),
    getUpdateStats: jest.fn(),
  },
}));

describe('useLibraryUpdates', () => {
  const mockUpdates = {
    content: [
      {
        id: 1,
        libraryId: 1,
        libraryName: 'requests',
        librarySource: 'pypi',
        oldVersion: '2.30.0',
        newVersion: '2.31.0',
        updateType: 'MINOR' as const,
        updateDate: '2024-01-15T10:00:00Z',
      },
      {
        id: 2,
        libraryId: 2,
        libraryName: 'flask',
        librarySource: 'pypi',
        oldVersion: '2.9.0',
        newVersion: '3.0.0',
        updateType: 'MAJOR' as const,
        updateDate: '2024-01-14T08:00:00Z',
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
    const { result } = renderHook(() => useLibraryUpdates());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.updates).toHaveLength(0);
    expect(result.current.pagination).toEqual({
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 20,
    });
  });

  it('should fetch updates successfully', async () => {
    (libraryUpdateApi.getUpdatesForUser as jest.Mock).mockResolvedValue({
      data: mockUpdates,
    });

    const { result } = renderHook(() => useLibraryUpdates());

    await act(async () => {
      await result.current.fetchUpdates(0, 20);
    });

    await waitFor(() => {
      expect(result.current.updates).toEqual(mockUpdates.content);
      expect(result.current.pagination.totalPages).toBe(1);
      expect(result.current.pagination.totalElements).toBe(2);
    });

    expect(libraryUpdateApi.getUpdatesForUser).toHaveBeenCalledWith(0, 20);
  });

  it('should fetch recent updates', async () => {
    const recentUpdates = mockUpdates.content.slice(0, 1);
    (libraryUpdateApi.getRecentUpdates as jest.Mock).mockResolvedValue({
      data: recentUpdates,
    });

    const { result } = renderHook(() => useLibraryUpdates());

    await act(async () => {
      await result.current.fetchRecentUpdates(7);
    });

    await waitFor(() => {
      expect(result.current.updates).toEqual(recentUpdates);
    });

    expect(libraryUpdateApi.getRecentUpdates).toHaveBeenCalledWith(7);
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch updates';
    (libraryUpdateApi.getUpdatesForUser as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useLibraryUpdates());

    await act(async () => {
      const res = await result.current.fetchUpdates(0, 20);
      expect(res).toBeNull();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should auto-fetch when autoFetch is true', async () => {
    (libraryUpdateApi.getUpdatesForUser as jest.Mock).mockResolvedValue({
      data: mockUpdates,
    });

    renderHook(() => useLibraryUpdates({ autoFetch: true, page: 0, size: 20 }));

    await waitFor(() => {
      expect(libraryUpdateApi.getUpdatesForUser).toHaveBeenCalledWith(0, 20);
    });
  });
});

describe('useUpdateStats', () => {
  const mockStats = {
    last7Days: 5,
    last30Days: 20,
    recentUpdates: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch stats successfully', async () => {
    (libraryUpdateApi.getUpdateStats as jest.Mock).mockResolvedValue({
      data: mockStats,
    });

    const { result } = renderHook(() => useUpdateStats());

    await act(async () => {
      await result.current.fetchStats();
    });

    await waitFor(() => {
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.isLoading).toBe(false);
    });

    expect(libraryUpdateApi.getUpdateStats).toHaveBeenCalled();
  });

  it('should handle stats fetch error', async () => {
    const errorMessage = 'Failed to fetch stats';
    (libraryUpdateApi.getUpdateStats as jest.Mock).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useUpdateStats());

    await act(async () => {
      const res = await result.current.fetchStats();
      expect(res).toBeNull();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });
});
