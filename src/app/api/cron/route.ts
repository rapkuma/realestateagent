import { NextRequest, NextResponse } from 'next/server';
import { fetchAndSyncApartments } from '@/lib/applyhome';
import { generateApartmentPost, generateNewsletterSummary } from '@/lib/summarizer';
import { sendNewsletterToSubscribers } from '@/lib/mailer';
import { supabase } from '@/lib/supabaseClient';

// Vercel Serverless Function 실행 시간 설정 (최대 60초)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleCronJob(request);
}

export async function POST(request: NextRequest) {
  return handleCronJob(request);
}

async function handleCronJob(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 [Cron Pipeline] 부동산 청약 물건별 자동화 파이프라인 가동 시작');

  // 1. Cron Secret 보안 검증 (설정된 경우에만 검사)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const urlKey = request.nextUrl.searchParams.get('key');

  if (cronSecret && cronSecret !== 'your_cron_secret_key_here') {
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` || urlKey === cronSecret;
    if (!isAuthorized) {
      console.warn('⛔ [Cron Pipeline] 인증되지 않은 크론 요청 차단');
      return NextResponse.json({ error: '인증 실패 (Unauthorized)' }, { status: 401 });
    }
  }

  try {
    // ----------------------------------------------------
    // Step 0: 오늘 일자의 동기화가 이미 완료되었는지 확인
    // ----------------------------------------------------
    const todayYmd = new Date().toISOString().split('T')[0];
    const { data: todayLogs } = await supabase
      .from('newsletters')
      .select('id, created_at')
      .gte('created_at', `${todayYmd}T00:00:00.000Z`)
      .limit(1);

    // ----------------------------------------------------
    // Step 1: 한국부동산원 청약홈 API 데이터 수집 & apartments 저장
    // ----------------------------------------------------
    console.log(`📦 [Step 1] 청약홈 공고 데이터 수집 시도 (기준일: ${todayYmd})...`);
    const apartments = await fetchAndSyncApartments();
    console.log(`✅ [Step 1 완료] 총 ${apartments.length}개의 유효 공고 확보`);

    // ----------------------------------------------------
    // Step 2 & 3: 아파트 물건별로 독립된 심층 분석 블로그 생성 및 newsletters 저장
    // ----------------------------------------------------
    console.log('📝 [Step 2 & 3] 아파트 물건별 독립 심층 분석 블로그 생성 및 아카이빙...');
    const savedPosts = [];

    for (const apt of apartments) {
      try {
        // ----------------------------------------------------
        // 중복 방지 (Deduplication) 검사: 이미 분석된 물건인지 확인
        // ----------------------------------------------------
        const { data: existing } = await supabase
          .from('newsletters')
          .select('id, title')
          .ilike('title', `%${apt.apt_name}%`)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`⏩ [Deduplication] 이미 분석이 완료된 아파트 물건으로 스킵합니다: "${apt.apt_name}" (기존 ID: ${existing[0].id})`);
          continue;
        }

        console.log(`🤖 [AI 분석 진행] 신규 청약 물건 분석 시작: "${apt.apt_name}"`);
        const aptPost = await generateApartmentPost(apt);
        const { data: saved, error: insertError } = await supabase
          .from('newsletters')
          .insert([
            {
              title: aptPost.title,
              content_html: aptPost.content_html,
              sent_at: new Date().toISOString(),
            },
          ])
          .select('id, title')
          .single();

        if (insertError) {
          console.warn(`⚠️ [Step 3] ${apt.apt_name} 저장 실패:`, insertError.message);
        } else if (saved) {
          console.log(`✅ [Step 3] 신규 아파트 물건 분석 및 등록 완료: "${saved.title}" (ID: ${saved.id})`);
          savedPosts.push(saved);
        }
      } catch (postErr) {
        console.error(`❌ [Step 3] ${apt.apt_name} 처리 예외:`, postErr);
      }
    }

    // ----------------------------------------------------
    // Step 4: 종합 브리핑 이메일 생성 및 구독자 대상 발송
    // ----------------------------------------------------
    console.log('📧 [Step 4] 구독자 종합 브리핑 이메일 발송 시작...');
    const summaryNewsletter = await generateNewsletterSummary(apartments);
    const mailResult = await sendNewsletterToSubscribers(
      summaryNewsletter.title,
      summaryNewsletter.summary_text,
      summaryNewsletter.content_html
    );
    console.log(`✅ [Step 4 완료] 이메일 발송 결과: 성공 ${mailResult.successCount}건 / 실패 ${mailResult.failureCount}건`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 [Cron Pipeline 완료] 총 소요 시간: ${duration}초`);

    return NextResponse.json(
      {
        success: true,
        message: '아파트 물건별 심층 분석 및 뉴스레터 발송이 성공적으로 완료되었습니다.',
        executionTime: `${duration}s`,
        data: {
          apartmentsCount: apartments.length,
          savedArticlesCount: savedPosts.length,
          savedPosts,
          emailDelivery: mailResult,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('💥 [Cron Pipeline] 파이프라인 실행 중 심각한 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '파이프라인 실행 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
