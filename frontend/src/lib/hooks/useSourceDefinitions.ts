"use client";

import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { sourceApi, type SourceDefinition } from "@/lib/api";

interface UseSourceDefinitionsOptions {
  autoFetch?: boolean;
}

export function useSourceDefinitions(options: UseSourceDefinitionsOptions = {}) {
  const { autoFetch = true } = options;
  const [sources, setSources] = useState<SourceDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sourceApi.getSources();
      setSources(response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const errorMessage = error.response?.data?.message || "Failed to fetch source registry";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchSources();
    }
  }, [autoFetch, fetchSources]);

  return {
    sources,
    isLoading,
    error,
    fetchSources,
  };
}
