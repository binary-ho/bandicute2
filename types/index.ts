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
  published_at: string;
  guid: string;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface PostSummary {
  id: string;
  blog_post_id: string;
  summary: string;
  is_summarized: boolean;
  created_at: string;
  updated_at: string;
}

export interface PullRequest {
  id: string;
  blog_post_id: string;
  study_id: string;
  is_opened: boolean;
  pr_url: string | null;
  created_at: string;
  updated_at: string;
}
