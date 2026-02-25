/**
 * Модульные тесты для хука useLibraryUpdates
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLibraryUpdates, useLibraryUpdateHistory } from '@/lib/hooks/useLibraryUpdates';
import { libraryUpdateApi } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  libraryUpdateApi: {
    getUpdatesForUser: jest.fn(),
    getLibraryUpdates: jest.fn(),
    getRecentUpdates: jest.fn(),
    getLatestUpdate: jest.fn(),
  },
}));

describe('useLibraryUpdates', () => {
  const mockUpdates = [
    {
      id: 1,
      libraryId: 1,
      libraryName: 'Test Library',
      librarySource: 'npm',
      oldVersion: '1.0.0',
      newVersion: '1.1.0',
      updateType: 'MINOR' as const,
      changeLog: 'Added new features',
      oldHealthScore: 80,
      newHealthScore: 85,
      updateDate: '2024-01-01T00:00:00Z',
    },
  ];

  const mockResponse = {
    content: mockUpdates,
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен инициализироваться с начальными значениями', () => {
    const { result } = renderHook(() => useLibraryUpdates());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.updates).toEqual([]);
    expect(result.current.pagination.totalElements).toBe(0);
  });

  it('должен загрузить обновления для пользователя', async () => {
    (libraryUpdateApi.getUpdatesForUser as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const { result } = renderHook(() => useLibraryUpdates());

    await act(async () => {
      await result.current.fetchUpdates(0, 20);
    });

    await waitFor(() => {
      expect(result.current.updates).toEqual(mockUpdates);
      expect(result.current.pagination.totalElements).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('должен загрузить последние обновления за N дней', async () => {
    (libraryUpdateApi.getRecentUpdates as jest.Mock).mockResolvedValue({
      data: mockUpdates,
    });

    const { result } = renderHook(() => useLibraryUpdates());

    await act(async () => {
      await result.current.fetchRecentUpdates(7);
    });

    await waitFor(() => {
      expect(result.current.updates).toEqual(mockUpdates);
      expect(libraryUpdateApi.getRecentUpdates).toHaveBeenCalledWith(7);
    });
  });

  it('должен автоматически загружать обновления при autoFetch=true', async () => {
    (libraryUpdateApi.getUpdatesForUser as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    renderHook(() => useLibraryUpdates({ autoFetch: true }));

    await waitFor(() => {
      expect(libraryUpdateApi.getUpdatesForUser).toHaveBeenCalled();
    });
  });
});

describe('useLibraryUpdateHistory', () => {
  const libraryId = 1;
  const mockUpdates = [
    {
      id: 1,
      libraryId: 1,
      libraryName: 'Test Library',
      librarySource: 'npm',
      oldVersion: '1.0.0',
      newVersion: '1.1.0',
      updateType: 'MINOR' as const,
      changeLog: 'Bug fixes',
      oldHealthScore: 80,
      newHealthScore: 82,
      updateDate: '2024-01-01T00:00:00Z',
    },
  ];

  const mockResponse = {
    content: mockUpdates,
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен загрузить историю обновлений библиотеки', async () => {
    (libraryUpdateApi.getLibraryUpdates as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const { result } = renderHook(() => useLibraryUpdateHistory(libraryId));

    await act(async () => {
      await result.current.fetchLibraryUpdates(0, 20);
    });

    await waitFor(() => {
      expect(result.current.updates).toEqual(mockUpdates);
      expect(libraryUpdateApi.getLibraryUpdates).toHaveBeenCalledWith(libraryId, 0, 20);
    });
  });

  it('должен получить последнее обновление', async () => {
    (libraryUpdateApi.getLatestUpdate as jest.Mock).mockResolvedValue({
      data: mockUpdates[0],
    });

    const { result } = renderHook(() => useLibraryUpdateHistory(libraryId));

    let latestUpdate;
    await act(async () => {
      latestUpdate = await result.current.fetchLatestUpdate();
    });

    expect(latestUpdate).toEqual(mockUpdates[0]);
    expect(libraryUpdateApi.getLatestUpdate).toHaveBeenCalledWith(libraryId);
  });
});
