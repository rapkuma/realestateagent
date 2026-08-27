const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const { format } = require('date-fns');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function checkDateStatus(contentHtml, title) {
  if (!contentHtml && !title) return { status: 'ENDED' };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const fullText = (title || '') + ' ' + (contentHtml || '');

  // 1. 청약 접수일 패턴: HTML 태그를 넘어 exact date(202X-XX-XX) 매칭
  const applyMatch = fullText.match(/(?:청약\s*접수일|청약접수일|접수일)[\s\S]{0,150}?(202[4-9][-.]\d{2}[-.]\d{2})/i) ||
                     fullText.match(/RCEPT_BGNDE[\s\S]{0,50}?(202[4-9][-.]\d{2}[-.]\d{2})/i);

  if (applyMatch) {
    const applyDate = applyMatch[1].replace(/\./g, '-');
    console.log('✅ Found exact applyDate:', applyDate, 'vs todayStr:', todayStr);
    if (applyDate === todayStr) {
      return { status: 'TODAY', applyDateStr: applyDate };
    } else if (applyDate < todayStr) {
      return { status: 'ENDED', applyDateStr: applyDate };
    } else {
      return { status: 'UPCOMING', applyDateStr: applyDate };
    }
  }

  // 2. 제목에 (오늘 접수) 또는 (오늘 접수중) 포함 시
  if (title && (title.includes('오늘 접수') || title.includes('오늘 접수중'))) {
    return { status: 'TODAY', applyDateStr: todayStr };
  }

  // 3. Fallback: 본문의 날짜들 중 접수일이 명시되지 않았으면 마지막 수신일/접수일 추정
  // ⚠️ 절대로 2026-08-25(당첨자발표일/생성일)가 포함되어있다고 해서 TODAY로 판정하지 않음!
  return { status: 'ENDED' };
}

async function test() {
  const { data } = await supabase
    .from('newsletters')
    .select('id, title, content_html')
    .ilike('title', '%드파인%');

  if (data && data[0]) {
    const res = checkDateStatus(data[0].content_html, data[0].title);
    console.log('🎉 Fixed Result for 드파인 아르티아:', res);
  }
}

test();
