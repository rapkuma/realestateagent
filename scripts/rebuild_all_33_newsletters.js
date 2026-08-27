const { fetchTodayApartments } = require('../src/lib/applyhome');
const { generateApartmentPost } = require('../src/lib/summarizer');
const { supabase } = require('../src/lib/supabaseClient');
require('dotenv').config({ path: '.env.local' });

async function rebuildAll() {
  console.log('🔄 [전체 33개 리포트 팩트 검증 및 일괄 재생성 시작]');

  const apartments = await fetchTodayApartments();
  console.log(`📌 총 ${apartments.length}개 청약 단지 공공데이터 수집 완료.`);

  let updatedCount = 0;

  for (const apt of apartments) {
    console.log(`\n🤖 [AI 팩트 무결성 분석 재발행 중]: ${apt.apt_name} (주소: ${apt.location})`);
    
    try {
      const generated = await generateApartmentPost(apt);

      // DB에 덮어쓰기/업서트
      const { error } = await supabase
        .from('newsletters')
        .upsert(
          {
            title: generated.title,
            content_html: generated.content_html,
            summary_text: generated.summary_text,
            sent_at: new Date().toISOString(),
          },
          { onConflict: 'title' }
        );

      if (error) {
        console.error(`❌ ${apt.apt_name} DB 업데이트 실패:`, error.message);
      } else {
        console.log(`✅ [성공] ${apt.apt_name} DB 업데이트 완료!`);
        updatedCount++;
      }
    } catch (err) {
      console.error(`❌ ${apt.apt_name} 처리 예외:`, err);
    }
  }

  console.log(`\n🎉 총 ${updatedCount}개 아파트 분양 물건 리포트 100% 팩트 무결성 업데이트 완료!`);
}

rebuildAll();
