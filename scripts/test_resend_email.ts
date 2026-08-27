import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sendWelcomeEmail } from '../src/lib/mailer';

async function testEmail() {
  const testTargetEmail = process.argv[2] || 'rapkuma@naver.com';
  console.log(`📧 [이메일 테스트] ${testTargetEmail} 주소로 발송 시도...`);
  console.log(`   └ 현재 RESEND_API_KEY: "${process.env.RESEND_API_KEY}"`);
  console.log(`   └ 현재 EMAIL_FROM: "${process.env.EMAIL_FROM}"`);

  const result = await sendWelcomeEmail(testTargetEmail, '서울');
  console.log('📬 [발송 결과]:', result);
}

testEmail();
