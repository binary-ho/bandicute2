import { supabase } from '../supabase/client';
import type { Member, Study, StudyMember } from '@/types';

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export async function getCurrentUser(): Promise<Member | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function canViewStudy(studyId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from('study_members')
    .select('id')
    .eq('study_id', studyId)
    .eq('member_id', user.id)
    .single();

  return !!data;
}

export async function canManageStudy(studyId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from('study_members')
    .select('is_leader')
    .eq('study_id', studyId)
    .eq('member_id', user.id)
    .eq('is_leader', true)
    .single();

  return !!data;
}

export async function canManageMembers(studyId: string): Promise<boolean> {
  return canManageStudy(studyId);
}

export async function canUpdateProfile(memberId: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.id === memberId;
}

export async function validateStudyAccess(studyId: string): Promise<void> {
  const hasAccess = await canViewStudy(studyId);
  if (!hasAccess) {
    throw new AuthorizationError('스터디에 접근할 권한이 없습니다.');
  }
}

export async function validateStudyManagement(studyId: string): Promise<void> {
  const hasAccess = await canManageStudy(studyId);
  if (!hasAccess) {
    throw new AuthorizationError('스터디를 관리할 권한이 없습니다.');
  }
}

export async function validateMemberManagement(studyId: string): Promise<void> {
  const hasAccess = await canManageMembers(studyId);
  if (!hasAccess) {
    throw new AuthorizationError('멤버를 관리할 권한이 없습니다.');
  }
}

export async function validateProfileUpdate(memberId: string): Promise<void> {
  const hasAccess = await canUpdateProfile(memberId);
  if (!hasAccess) {
    throw new AuthorizationError('프로필을 수정할 권한이 없습니다.');
  }
}
