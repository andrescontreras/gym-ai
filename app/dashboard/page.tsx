'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { profile, loading, error } = useProfile();

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2">Welcome, {profile?.name || user?.email}!</p>
      <p className="text-sm text-gray-600 mb-4">
        Experience Level: {profile?.experience_level}
      </p>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}
