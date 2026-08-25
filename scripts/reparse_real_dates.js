const { fetchAndSyncApartments } = require('../src/lib/applyhome');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixDates() {
  console.log('🔄 [실제 청약 접수일 정밀 업데이트 중...]');
  const realList = await fetchAndSyncApartments();

  for (const item of realList) {
    const { data: records } = await supabase
      .from('newsletters')
      .select('id, title, content_html')
      .ilike('title', `%${item.apt_name}%`);

    if (records && records.length > 0) {
      for (const rec of records) {
        // If content_html has false today date, replace with real item.apply_date
        const updatedHtml = rec.content_html
          .replace(/📍 청약일정: 접수 2026-08-25/g, `📍 청약일정: 접수 ${item.apply_date}`)
          .replace(/접수 2026-08-25/g, `접수 ${item.apply_date}`);

        if (updatedHtml !== rec.content_html) {
          await supabase.from('newsletters').update({ content_html: updatedHtml }).eq('id', rec.id);
          console.log(`✅ [날짜 교정 완료] ${item.apt_name} -> 실제 접수일: ${item.apply_date}`);
        }
      }
    }
  }
  console.log('🎉 [교정 완료]');
}

fixDates();
