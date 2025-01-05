import { User } from '@supabase/supabase-js';

export interface Member {
  id: string;
  email: string;
  name: string;
  blog_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthAccount {
  provider: string;
  provider_id: string;
  member_id: string;
  email: string;
  created_at: string;
  updated_at: string;
  members?: Member;
}

export interface AuthState {
  user: User | null;
  member: Member | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  fetchUser: () => Promise<void>;
  reset: () => void;
}
