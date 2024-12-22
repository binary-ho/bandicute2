import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 테스트용 데이터
const testMember = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'binary-ho',
  email: 'dfghcvb11@naver.com',
  tistory_blog: 'https://dwaejinho.tistory.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // 테스트 멤버 추가
    const { data, error } = await supabase
      .from('members')
      .upsert(testMember)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Setup failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
