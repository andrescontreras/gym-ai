'use client';

import { useEffect, useState } from 'react';
import type { UserProfile } from '@/types';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/profile');

      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}
