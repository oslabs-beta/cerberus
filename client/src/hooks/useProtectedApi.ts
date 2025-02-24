import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export const useProtectedApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const fetchProtectedData = useCallback(
    async (endpoint: string, options: FetchOptions = {}) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/user/${endpoint}`, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for sending cookies
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Handle unauthorized - redirect to login
            window.location.href = '/login';
            throw new Error('Session expired');
          }
          throw new Error(`Request failed with status: ${response.status}`);
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          data: {
            ...prev.data, // Preserve existing data
            ...data, // Merge new data
          },
          isLoading: false,
        }));

        return data; // Return data for immediate use if needed
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error : new Error('An error occurred'),
          isLoading: false,
        }));
        throw error; // Re-throw to allow error handling in components
      }
    },
    []
  ); // Empty dependency array since this function doesn't depend on any external values

  return {
    ...state,
    fetchProtectedData,
  };
};
