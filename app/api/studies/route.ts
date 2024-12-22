import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GitHubRepositoryService } from '@/lib/github/repository-service';
import { BlogSummaryService } from '@/lib/blog-summary/service';
import { GitHubPRService } from '@/lib/github/pr-service';
import { OpenAIService } from '@/lib/openai/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { title, description, githubRepo, branch, directory = 'blog-posts' } = await request.json();

    // 필수 필드 검증
    if (!title || !description || !githubRepo || !branch) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // GitHub 저장소 유효성 검사
    const githubService = new GitHubRepositoryService();
    const isValidRepo = await githubService.validateRepository(githubRepo);
    if (!isValidRepo) {
      return NextResponse.json(
        { error: 'GitHub 저장소에 접근할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 브랜치 생성 (없는 경우)
    await githubService.createBranch(githubRepo, branch);

    // 스터디 생성
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .insert({
        title,
        description,
        github_repo: githubRepo,
        branch,
        directory,
        created_by: user.id,
      })
      .select()
      .single();

    if (studyError) throw studyError;

    // 생성자를 스터디 멤버로 추가 (스터디장으로)
    const { error: memberError } = await supabase
      .from('study_members')
      .insert({
        study_id: study.id,
        member_id: user.id,
        is_leader: true,
      });

    if (memberError) throw memberError;

    // 스터디 생성 후 블로그 체크 실행
    const githubPRService = new GitHubPRService();
    const openAIService = new OpenAIService();
    const blogSummaryService = new BlogSummaryService(githubPRService, openAIService);

    // 생성자의 블로그 정보 가져오기
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('id', user.id)
      .single();

    if (member?.tistory_blog) {
      try {
        await blogSummaryService.processNewBlogPost(member.tistory_blog, member, study);
      } catch (error) {
        console.error('Error processing blog post:', error);
        // 블로그 처리 실패해도 스터디 생성은 성공으로 처리
      }
    }

    return NextResponse.json(study);
  } catch (error) {
    console.error('Error creating study:', error);
    return NextResponse.json(
      { error: '스터디 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
