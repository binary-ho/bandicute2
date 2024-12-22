import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(
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

    // 스터디 리더인지 확인
    const { data: studyMember } = await supabase
      .from('study_members')
      .select('is_leader')
      .eq('study_id', params.id)
      .eq('member_id', user.id)
      .single();

    if (!studyMember?.is_leader) {
      return NextResponse.json(
        { error: '스터디 리더만 멤버를 초대할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { email, folderPath } = await request.json();

    // 이메일로 멤버 찾기
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single();

    if (memberError) {
      return NextResponse.json(
        { error: '해당 이메일의 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 스터디 멤버인지 확인
    const { data: existingMember } = await supabase
      .from('study_members')
      .select('id')
      .eq('study_id', params.id)
      .eq('member_id', member.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: '이미 스터디 멤버입니다.' },
        { status: 400 }
      );
    }

    // 스터디 멤버로 추가
    const { error: insertError } = await supabase
      .from('study_members')
      .insert({
        study_id: params.id,
        member_id: member.id,
        folder_path: folderPath || null,
        is_leader: false,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: '멤버 초대 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
