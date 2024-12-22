import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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

    const { studyId, memberId } = await request.json();

    if (!studyId) {
      return NextResponse.json(
        { error: '스터디 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 현재 사용자의 member_id 조회
    const { data: authAccount, error: authError } = await supabase
      .from('auth_accounts')
      .select('member_id')
      .eq('provider_id', user.id)
      .single();

    if (authError || !authAccount) {
      return NextResponse.json(
        { error: '회원 정보를 찾을 수 없습니다.' },
        { status: 403 }
      );
    }

    // 2. 스터디 멤버 확인
    const { data: studyMember, error: memberError } = await supabase
      .from('study_members')
      .select('member_id')
      .eq('study_id', studyId)
      .eq('member_id', authAccount.member_id)
      .single();

    if (memberError || !studyMember) {
      return NextResponse.json(
        { error: '스터디 멤버만 이 작업을 수행할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 3. 체크할 멤버 목록 조회
    let targetMembers;
    
    // Study 정보 조회
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select('*')
      .eq('id', studyId)
      .single();

    if (studyError || !study) {
      return NextResponse.json(
        { error: '스터디 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (memberId) {
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError || !member) {
        return NextResponse.json(
          { error: '체크할 멤버 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      targetMembers = [member];
    } else {
      // 스터디의 모든 멤버 조회
      const { data: studyMembers, error: studyMembersError } = await supabase
        .from('study_members')
        .select('member_id')
        .eq('study_id', studyId);

      if (studyMembersError || !studyMembers?.length) {
        return NextResponse.json(
          { error: '멤버 목록을 조회할 수 없습니다.' },
          { status: 500 }
        );
      }

      // 멤버 정보 조회
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .in('id', studyMembers.map(sm => sm.member_id));

      if (membersError) {
        return NextResponse.json(
          { error: '멤버 정보를 조회할 수 없습니다.' },
          { status: 500 }
        );
      }

      targetMembers = members || [];
    }

    // 4. 블로그 체크 실행
    const githubPRService = new GitHubPRService();
    const openAIService = new OpenAIService();
    const blogSummaryService = new BlogSummaryService(githubPRService, openAIService);

    const results = await Promise.all(
      targetMembers.map(async (member) => {
        if (!member.tistory_blog) {
          return {
            memberId: member.id,
            success: false,
            error: '등록된 블로그가 없습니다.',
          };
        }

        try {
          const post = await blogSummaryService.processNewBlogPost(member.tistory_blog, member, study);
          return {
            memberId: member.id,
            success: true,
            post,
          };
        } catch (error) {
          console.error(`Error checking blog for member ${member.id}:`, error);
          return {
            memberId: member.id,
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Check blogs error:', error);
    return NextResponse.json(
      { error: '블로그 체크 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
