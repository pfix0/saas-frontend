'use client';

/**
 * ساس — Auth Provider
 * يغلف التطبيق ويجلب بيانات المستخدم عند أول تحميل
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchProfile = useAuthStore(state => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return <>{children}</>;
}
