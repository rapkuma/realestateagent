import { Resend } from 'resend';
import { supabase } from '@/lib/supabaseClient';
import { NewsletterEmail } from '@/emails/NewsletterEmail';
import * as React from 'react';

export interface SendResult {
  totalSubscribers: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export async function sendNewsletterToSubscribers(
  title: string,
  summaryText: string,
  contentHtml: string
): Promise<SendResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  // 1. Supabase에서 활성 구독자 목록 조회
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('email')
    .eq('is_active', true);

  if (error) {
    console.error('❌ [Supabase] 구독자 목록 조회 실패:', error);
    throw new Error(`구독자 목록을 조회할 수 없습니다: ${error.message}`);
  }

  const emailList = (subscribers || []).map((s) => s.email).filter(Boolean);
  console.log(`📋 [Mailer] 총 ${emailList.length}명의 활성 구독자 대상 발송 시작`);

  if (emailList.length === 0) {
    return {
      totalSubscribers: 0,
      successCount: 0,
      failureCount: 0,
      errors: [],
    };
  }

  // Resend API Key가 유효하지 않은 경우 시뮬레이션 모드
  if (!resendApiKey || resendApiKey === 're_your_resend_api_key_here') {
    console.log(
      `ℹ️ [Mailer] RESEND_API_KEY가 설정되지 않아 발송 시뮬레이션(Mock)으로 ${emailList.length}건 처리합니다.`
    );
    return {
      totalSubscribers: emailList.length,
      successCount: emailList.length,
      failureCount: 0,
      errors: [],
    };
  }

  const resend = new Resend(resendApiKey);
  let successCount = 0;
  let failureCount = 0;
  const errors: string[] = [];

  // 2. 구독자에게 개별 / 일괄 발송 (수신자 보호를 위해 개별 발송 또는 BCC 권장)
  for (const toEmail of emailList) {
    try {
      const { data, error: sendError } = await resend.emails.send({
        from: `청약 헬퍼 <${fromEmail}>`,
        to: [toEmail],
        subject: title,
        react: React.createElement(NewsletterEmail, {
          title,
          summaryText,
          contentHtml,
          dateStr: new Date().toLocaleDateString('ko-KR'),
        }),
      });

      if (sendError) {
        console.error(`❌ [Mailer] ${toEmail} 발송 실패:`, sendError);
        failureCount++;
        errors.push(`${toEmail}: ${sendError.message}`);
      } else {
        console.log(`✅ [Mailer] ${toEmail} 발송 성공 (ID: ${data?.id})`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ [Mailer] ${toEmail} 발송 중 예외:`, err);
      failureCount++;
      errors.push(`${toEmail}: ${err.message || '알 수 없는 오류'}`);
    }
  }

  return {
    totalSubscribers: emailList.length,
    successCount,
    failureCount,
    errors,
  };
}

export async function sendWelcomeEmail(
  toEmail: string,
  targetRegion: string = '전국'
): Promise<{ success: boolean; message: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (!resendApiKey || resendApiKey === 're_your_resend_api_key_here') {
    console.log(
      `ℹ️ [Mailer] RESEND_API_KEY가 설정되지 않아 환영 이메일 시뮬레이션(Mock)으로 ${toEmail} (${targetRegion}) 처리합니다.`
    );
    return { success: true, message: '시뮬레이션 완료 (RESEND_API_KEY 미설정)' };
  }

  try {
    const resend = new Resend(resendApiKey);
    const { data, error: sendError } = await resend.emails.send({
      from: `집모아 <${fromEmail}>`,
      to: [toEmail],
      subject: `[집모아] ${targetRegion} 희망 지역 청약 & 줍줍 알림 구독을 환영합니다! 🏠`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-b: 1px solid #f1f5f9;">
            <h1 style="color: #2563eb; font-size: 22px; font-weight: 800; margin: 0;">🏠 집모아 (ZipMoa)</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">전국 아파트 & 줍줍 실시간 청약 서비스</p>
          </div>
          
          <div style="padding: 24px 0;">
            <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">청약 알림 구독이 완료되었습니다! 🎉</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              안녕하세요! 집모아 희망 청약 알림 서비스를 신청해 주셔서 대단히 감사합니다.
            </p>
            
            <div style="margin: 20px 0; padding: 16px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px;">
              <span style="font-size: 13px; color: #1e40af; font-weight: bold;">📍 선택하신 수신 희망 지역:</span>
              <span style="font-size: 15px; color: #1e3a8a; font-weight: 900; margin-left: 6px;">${targetRegion}</span>
            </div>
            
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              한국부동산원 청약홈 공공데이터 및 실시간 파이프라인을 통해 <strong>${targetRegion}</strong> 지역의 신규 무순위(줍줍) 및 1순위 청약 공고문이 올라오는 즉시 실시간 리포트를 전달해 드리겠습니다.
            </p>
          </div>

          <div style="border-t: 1px solid #f1f5f9; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0;">© ${new Date().getFullYear()} 집모아 (ZipMoa) - AI 부동산 분양 정보 자동화</p>
          </div>
        </div>
      `,
    });

    if (sendError) {
      console.error(`❌ [Mailer] ${toEmail} 환영 이메일 발송 실패:`, sendError);
      return { success: false, message: sendError.message };
    }

    console.log(`✅ [Mailer] ${toEmail} 환영 이메일 발송 성공 (ID: ${data?.id})`);
    return { success: true, message: '환영 메일 발송 완료' };
  } catch (err: any) {
    console.error(`❌ [Mailer] ${toEmail} 환영 이메일 예외:`, err);
    return { success: false, message: err.message || '발송 실패' };
  }
}
