import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { sendWelcomeEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { email, region } = await request.json();

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해 주세요.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const targetRegion = region || '전국';

    // Supabase subscribers 테이블에 이메일 및 희망 지역 저장 (또는 갱신)
    const { error } = await supabase
      .from('subscribers')
      .upsert(
        [{ email: trimmedEmail, region: targetRegion, is_active: true }],
        { onConflict: 'email' }
      );

    if (error) {
      console.error('🔴 [Supabase Insert/Upsert Error]:', error);

      // fallback: region 컬럼이 아직 DB 스키마에 업로드되지 않은 경우 email만 저장
      const { error: fallbackError } = await supabase
        .from('subscribers')
        .upsert([{ email: trimmedEmail, is_active: true }], { onConflict: 'email' });

      if (fallbackError) {
        return NextResponse.json(
          { error: `구독 저장 실패: ${fallbackError.message}` },
          { status: 500 }
        );
      }
    }

    // 📧 신규 구독 환영 메일 즉시 발송 파이프라인
    try {
      await sendWelcomeEmail(trimmedEmail, targetRegion);
    } catch (mErr) {
      console.warn('⚠️ [Subscribe API] 환영 메일 발송 경고:', mErr);
    }

    return NextResponse.json(
      { message: `[${targetRegion}] 지역 희망 청약 알림 구독이 신청되었습니다! 환영 메일을 발송했습니다.` },
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
