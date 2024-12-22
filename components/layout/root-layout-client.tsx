'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/store/auth';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuth(state => state.fetchUser);

  useEffect(() => {
    // 앱 시작시 한 번만 인증 상태 체크
    fetchUser();

    // 초기 사용자 정보 로드
    // fetchUser();

    // Auth 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        // reset();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  return children;
}
