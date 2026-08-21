'use client';

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook for accessing authentication state and methods.
 * Must be used within AuthProvider.
 */
export function useAuth() {
  return useAuthContext();
}
