export interface Member {
  id: string;
  email: string;
  name: string;
  blog_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Study {
  id: string;
  title: string;
  description: string;
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
  is_leader: boolean;
  folder_path?: string;
  created_at: string;
  updated_at: string;
  members?: Member;
}

export interface BlogPost {
  title: string;
  url: string;
  content: string;
  publishedAt: string;
}

export interface AuthAccount {
  id: string;
  provider: string;
  provider_id: string;
  member_id: string;
  created_at: string;
  updated_at: string;
}
