import { useState, useCallback } from 'react';

interface UseLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export function useLoading(initialState = false): UseLoadingReturn {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await promise;
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}

// Hook for managing multiple loading states by key
interface UseLoadingMapReturn {
  isLoading: (key: string) => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  withLoading: <T>(key: string, promise: Promise<T>) => Promise<T>;
}

export function useLoadingMap(): UseLoadingMapReturn {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const isLoading = useCallback((key: string): boolean => {
    return loadingMap[key] || false;
  }, [loadingMap]);

  const startLoading = useCallback((key: string) => {
    setLoadingMap(prev => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingMap(prev => ({ ...prev, [key]: false }));
  }, []);

  const withLoading = useCallback(async <T,>(key: string, promise: Promise<T>): Promise<T> => {
    setLoadingMap(prev => ({ ...prev, [key]: true }));
    try {
      const result = await promise;
      return result;
    } finally {
      setLoadingMap(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}
