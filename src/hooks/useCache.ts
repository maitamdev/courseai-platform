import { useState, useEffect, useCallback } from 'react';

type CacheOptions = {
  key: string;
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
};

export function useCache<T>(options: CacheOptions) {
  const { key, ttl = 5 * 60 * 1000 } = options;
  const [data, setData] = useState<T | null>(() => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    try {
      const { value, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - timestamp < ttl) {
        return value;
      }
      
      // Cache expired, remove it
      localStorage.removeItem(key);
      return null;
    } catch {
      return null;
    }
  });

  const setCache = useCallback((value: T) => {
    setData(value);
    localStorage.setItem(
      key,
      JSON.stringify({
        value,
        timestamp: Date.now(),
      })
    );
  }, [key]);

  const clearCache = useCallback(() => {
    setData(null);
    localStorage.removeItem(key);
  }, [key]);

  const isExpired = useCallback(() => {
    const cached = localStorage.getItem(key);
    if (!cached) return true;

    try {
      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp >= ttl;
    } catch {
      return true;
    }
  }, [key, ttl]);

  return {
    data,
    setCache,
    clearCache,
    isExpired,
  };
}
