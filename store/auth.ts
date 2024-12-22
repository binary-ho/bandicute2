import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { AuthState } from '@/types/auth';

export const useAuth = create<AuthState>((set) => ({
  user: null,
  member: null,
  loading: true,
  error: null,
  initialized: false,

  fetchUser: async () => {
    // 이미 초기화되었고 로딩 중이 아닌 경우에도 강제로 새로고침
    // if (state.initialized && !state.loading) return;

    try {
      set({ loading: true, error: null });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ 
          user: null, 
          member: null, 
          loading: false,
          initialized: true 
        });
        return;
      }

      // 세션이 있으면 먼저 user 정보 설정
      set({ 
        user: session.user,
        loading: true,
        initialized: true
      });

      try {
        // members 테이블에서 직접 조회
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (memberError && memberError.code !== 'PGRST116') {
          throw memberError;
        }

        // member가 없으면 생성
        if (!member) {
          const { data: newMember, error: createError } = await supabase
            .from('members')
            .insert({
              email: session.user.email,
              name: session.user.email?.split('@')[0] || 'Anonymous',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) throw createError;

          // auth_accounts에 매핑 추가
          const { error: mappingError } = await supabase
            .from('auth_accounts')
            .insert({
              provider: 'supabase',
              provider_id: session.user.id,
              member_id: newMember.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (mappingError) throw mappingError;

          set({ 
            member: newMember,
            loading: false
          });
        } else {
          set({ 
            member,
            loading: false
          });
        }
      } catch (error) {
        console.error('Member fetch/create error:', error);
        set({ 
          loading: false,
          error: error instanceof Error ? error : new Error('회원 정보를 가져오는데 실패했습니다')
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      set({ 
        user: null,
        member: null,
        loading: false,
        initialized: true,
        error: error instanceof Error ? error : new Error('인증 오류가 발생했습니다')
      });
    }
  },

  reset: () => {
    set({
      user: null,
      member: null,
      loading: false,
      error: null,
      initialized: true
    });
  }
}));
