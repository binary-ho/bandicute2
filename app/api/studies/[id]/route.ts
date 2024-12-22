import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
