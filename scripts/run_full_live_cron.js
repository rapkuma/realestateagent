const { fetchAndSyncApartments } = require('../src/lib/applyhome');
const { generateApartmentPost } = require('../src/lib/summarizer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runFullCron() {
  console.log('🚀 [실시간 데이터 전수 분석 및 아카이빙 시작]');
  const apartments = await fetchAndSyncApartments();
  console.log(`📌 수집된 유효 청약 공고: 총 ${apartments.length}건`);

  let count = 0;
  for (const apt of apartments) {
    // Deduplication check
    const { data: existing } = await supabase
      .from('newsletters')
      .select('id, title')
      .ilike('title', `%${apt.apt_name}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`⏩ [스킵] 이미 등록된 공고: "${apt.apt_name}"`);
      continue;
    }

    console.log(`🤖 AI 분석 진행 중: "${apt.apt_name}" (${apt.location})`);
    try {
      const post = await generateApartmentPost(apt);
      const { data: saved, error } = await supabase.from('newsletters').insert([
        {
          title: post.title,
          content_html: post.content_html,
          sent_at: new Date().toISOString()
        }
      ]).select('id, title').single();

      if (error) {
        console.error('❌ 저장 실패:', error.message);
      } else {
        console.log(`✅ [신규 아카이빙 완료] "${saved.title}" (ID: ${saved.id})`);
        count++;
      }
    } catch (err) {
      console.error('❌ 분석 오류:', err.message);
    }
  }

  console.log(`🎉 [완료] 총 ${count}개의 신규 실시간 청약 공고 분석 및 아카이빙 완료!`);
}

runFullCron();
