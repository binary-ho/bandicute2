export interface Member {
  id: string;
  name: string;
  email: string;
  tistory_blog: string | null;
  created_at: string;
  updated_at: string;
}

export interface Study {
  id: string;
  title: string;
  description: string | null;
  github_repo: string;
  branch: string;
  directory: string;
  created_at: string;
  updated_at: string;
}

export interface StudyMember {
  id: string;
  study_id: string;
  member_id: string;
  folder_path: string;
  is_leader: boolean;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface BlogPost {
  id: string;
  member_id: string;
  title: string;
  url: string;
  content: string;
  summary: string | null;
  pr_url: string | null;
  published_at: string;
  guid: string;
  created_at: string;
  updated_at: string;
  member?: Member;
}
