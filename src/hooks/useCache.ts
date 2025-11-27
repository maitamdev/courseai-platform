import { useState, useCallback, useMemo } from 'react';

type CacheOptions = {
  key: string;
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
};

type CacheData<T> = {
  value: T;
  timestamp: number;
};

export function useCache<T>(options: CacheOptions) {
  const { key, ttl = 5 * 60 * 1000 } = options;
  
  // Memoize initial data to prevent re-reading on every render
  const initialData = useMemo(() => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { value, timestamp } = JSON.parse(cached) as CacheData<T>;
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - timestamp < ttl) {
        return value;
      }
      
      // Cache expired, remove it
      localStorage.removeItem(key);
      return null;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }, [key, ttl]);

  const [data, setData] = useState<T | null>(initialData);

  const setCache = useCallback((value: T) => {
    try {
      const cacheData: CacheData<T> = {
        value,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      setData(value);
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(null);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, [key]);

  const isExpired = useCallback(() => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return true;

      const { timestamp } = JSON.parse(cached) as CacheData<T>;
      return Date.now() - timestamp >= ttl;
    } catch {
      return true;
    }
  }, [key, ttl]);

  const refreshIfExpired = useCallback(async (fetchFn: () => Promise<T>) => {
    if (!data || isExpired()) {
      const newData = await fetchFn();
      setCache(newData);
      return newData;
    }
    return data;
  }, [data, isExpired, setCache]);

  return {
    data,
    setCache,
    clearCache,
    isExpired,
    refreshIfExpired,
  };
}
