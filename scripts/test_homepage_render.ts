import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

function checkDateStatus(contentHtml: string, title?: string) {
  const todayStr = '2026-08-27';
  const fullText = (title || '') + ' ' + (contentHtml || '');

  const applyMatch = fullText.match(/(?:청약\s*접수일|청약접수일|접수일)[\s\S]{0,150}?(202[4-9][-.]\d{2}[-.]\d{2})/i) ||
                     fullText.match(/RCEPT_BGNDE[\s\S]{0,50}?(202[4-9][-.]\d{2}[-.]\d{2})/i);

  if (applyMatch) {
    const applyDate = applyMatch[1].replace(/\./g, '-');
    if (applyDate === todayStr) {
      return { status: 'TODAY', applyDateStr: applyDate };
    } else if (applyDate < todayStr) {
      return { status: 'ENDED', applyDateStr: applyDate };
    } else {
      return { status: 'UPCOMING', applyDateStr: applyDate };
    }
  }

  return { status: 'ENDED' };
}

async function testHomepage() {
  const { data } = await supabase.from('newsletters').select('id, title, content_html, created_at').order('created_at', { ascending: false });
  if (!data) return;

  console.log(`📋 홈페이지 랜더링 분류 결과 (총 ${data.length}건):\n`);

  let todayCount = 0;
  let upcomingCount = 0;
  let endedCount = 0;

  data.forEach((item) => {
    const { status, applyDateStr } = checkDateStatus(item.content_html, item.title);
    if (status === 'TODAY') todayCount++;
    if (status === 'UPCOMING') upcomingCount++;
    if (status === 'ENDED') endedCount++;

    if (status === 'TODAY' || status === 'UPCOMING') {
      console.log(`✨ [${status}] [접수일: ${applyDateStr}] ${item.title}`);
    }
  });

  console.log(`\n📊 집계: TODAY ${todayCount}건 / UPCOMING ${upcomingCount}건 / ENDED ${endedCount}건 / TOTAL ${data.length}건`);
}

testHomepage();
