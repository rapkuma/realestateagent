const { fetchAndSyncApartments } = require('../src/lib/applyhome');
const { generateApartmentPost } = require('../src/lib/summarizer');
const { downloadAndParsePdf } = require('../src/lib/pdfDownloader');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runTodayCollection() {
  console.log('🚀 [오늘 청약 물건 수집 및 분석 시작]');
  
  const apartments = await fetchAndSyncApartments();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayApartments = apartments.filter(apt => apt.apply_date === todayStr);

  console.log(`📌 오늘(${todayStr}) 청약 접수 물건: ${todayApartments.length}건`);

  for (const apt of todayApartments) {
    console.log(`🤖 AI 심층 분석 수행 중: ${apt.apt_name}`);
    let pdfText = '';
    if (apt.house_manage_no && apt.pblanc_no) {
      console.log(`📑 모집공고문 PDF 다운로드 시도: ${apt.house_manage_no}`);
      const extracted = await downloadAndParsePdf(apt.house_manage_no, apt.pblanc_no);
      if (extracted) pdfText = extracted;
    }
    const post = await generateApartmentPost(apt, pdfText);

    // DB에 동기화
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
      console.log(`✅ [오늘 청약물건 저장 완료] "${saved.title}" (ID: ${saved.id})`);
    }
  }
}

runTodayCollection();
