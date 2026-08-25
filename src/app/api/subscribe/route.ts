import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Supabase subscribers 테이블에 이메일 추가
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email: trimmedEmail, is_active: true }]);

    if (error) {
      console.error('🔴 [Supabase Insert Error]:', error);

      // 1. 중복 이메일 가입
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 뉴스레터를 구독 중인 이메일입니다.' },
          { status: 409 }
        );
      }

      // 2. 테이블이 없는 경우
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
        return NextResponse.json(
          { error: 'Supabase에 subscribers 테이블이 없습니다. SQL Editor에서 테이블 생성 스크립트를 먼저 실행해 주세요.' },
          { status: 500 }
        );
      }

      // 3. RLS(Row Level Security) 권한 차단인 경우
      if (error.code === '42501' || error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
        return NextResponse.json(
          { error: 'Supabase RLS(Row Level Security) 권한 오류입니다. subscribers 테이블의 RLS를 비활성화하거나 정책을 추가해 주세요.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Supabase 오류: ${error.message} (${error.code || '알 수 없는 코드'})` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '구독 신청이 완료되었습니다! 매주 청약 소식을 전해드릴게요.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('🔴 [Subscription API Error]:', error);
    return NextResponse.json(
      { error: error.message || '서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 }
    );
  }
}
