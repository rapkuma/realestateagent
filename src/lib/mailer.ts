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
