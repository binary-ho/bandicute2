import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { StudyService } from '@/lib/study/service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 스터디 정보 조회
    const { data: study, error: studyError } = await supabase
      .from('studies')
      .select(`
        *,
        study_members!inner (
          member_id,
          is_leader,
          folder_path,
          members (
            id,
            name,
            email,
            profile_image_url
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (studyError) {
      console.error('Error fetching study:', studyError);
      return NextResponse.json(
        { error: '스터디 정보를 가져오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!study) {
      return NextResponse.json(
        { error: '스터디를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 접근 권한 확인 (스터디 멤버인지)
    const isMember = study.study_members.some(
      (member: { member_id: string; }) => member.member_id === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    return NextResponse.json(study);
  } catch (error) {
    console.error('Error in study detail API:', error);
    return NextResponse.json(
      { error: '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
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

    const studyService = new StudyService();

    // 2. 스터디 리더 권한 확인
    const isLeader = await studyService.validateStudyLeader(params.id, authAccount.member_id);
    if (!isLeader) {
      return NextResponse.json(
        { error: '스터디 리더만 정보를 수정할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 3. 요청 데이터 검증
    const { github_repo, branch, directory } = await request.json();

    if (!github_repo || !branch || !directory) {
      return NextResponse.json(
        { error: 'GitHub 저장소와 브랜치, directory 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 4. 스터디 정보 업데이트
    const updatedStudy = await studyService.updateStudy({
      id: params.id,
      github_repo,
      branch,
      directory,
    });

    return NextResponse.json(updatedStudy);
  } catch (error) {
    console.error('Error updating study:', error);
    return NextResponse.json(
      { error: '스터디 정보 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
