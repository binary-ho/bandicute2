import { supabase } from '../supabase/client';
import type { Study } from '@/types';

interface UpdateStudyParams {
  id: string;
  github_repo: string;
  branch: string;
  directory: string;
}

export class StudyService {
  async updateStudy({ id, github_repo, branch, directory }: UpdateStudyParams): Promise<Study> {
    try {
      const { data: study, error } = await supabase
        .from('studies')
        .update({
          github_repo,
          branch,
          directory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return study;
    } catch (error) {
      console.error('Error updating study:', error);
      throw error;
    }
  }

  async validateStudyLeader(studyId: string, memberId: string): Promise<boolean> {
    try {
      const { data: studyMember, error } = await supabase
        .from('study_members')
        .select('is_leader')
        .eq('study_id', studyId)
        .eq('member_id', memberId)
        .single();

      if (error) throw error;
      return studyMember?.is_leader || false;
    } catch (error) {
      console.error('Error validating study leader:', error);
      throw error;
    }
  }
}
