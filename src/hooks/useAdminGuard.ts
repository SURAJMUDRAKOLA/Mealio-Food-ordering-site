import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * useAdminGuard — Protects admin routes.
 *
 * Redirects to '/' if:
 *  - The user is not logged in
 *  - The user's role is not 'admin'
 *
 * Returns the profile so pages don't need to re-select it.
 *
 * Usage:
 *  const { profile } = useAdminGuard();
 *  if (!profile) return null; // guard is still checking
 */
export function useAdminGuard() {
  const { profile, initialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to initialize before deciding
    if (!initialized) return;
    if (!profile || profile.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [profile, initialized, navigate]);

  const isAdmin = initialized && profile?.role === 'admin';

  return { profile: isAdmin ? profile : null, isAdmin };
}
