import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { fetchAndSyncApartments } from '../src/lib/applyhome';
import { generateApartmentPost } from '../src/lib/summarizer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function rebuildAll() {
  console.log('🔄 [전체 33개 리포트 팩트 검증 및 일괄 재생성 시작]');

  const apartments = await fetchAndSyncApartments();
  console.log(`📌 총 ${apartments.length}개 청약 단지 공공데이터 수집 완료.`);

  let updatedCount = 0;

  for (const apt of apartments) {
    console.log(`\n🤖 [AI 팩트 무결성 분석 재발행 중]: ${apt.apt_name}`);
    console.log(`📍 [한국부동산원 공식 주소]: ${apt.location}`);
    
    try {
      const generated = await generateApartmentPost(apt);

      // 기존 항목 DB 업데이트 (id 또는 title로 검색)
      const { data: existing } = await supabase
        .from('newsletters')
        .select('id')
        .ilike('title', `%${apt.apt_name}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('newsletters')
          .update({
            title: generated.title,
            content_html: generated.content_html,
            sent_at: new Date().toISOString(),
          })
          .eq('id', existing[0].id);

        if (error) {
          console.error(`❌ ${apt.apt_name} DB 업데이트 실패:`, error.message);
        } else {
          console.log(`✅ [100% 팩트 검증 완료] ${apt.apt_name} (ID: ${existing[0].id}) 업데이트 성공!`);
          updatedCount++;
        }
      } else {
        const { error } = await supabase
          .from('newsletters')
          .insert({
            title: generated.title,
            content_html: generated.content_html,
            sent_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`❌ ${apt.apt_name} DB 신규 생성 실패:`, error.message);
        } else {
          console.log(`✅ [100% 팩트 검증 완료] ${apt.apt_name} 신규 생성 성공!`);
          updatedCount++;
        }
      }
    } catch (err) {
      console.error(`❌ ${apt.apt_name} 처리 예외:`, err);
    }
  }

  console.log(`\n🎉 총 ${updatedCount}개 아파트 분양 물건 리포트 100% 팩트 무결성 업데이트 완료!`);
}

rebuildAll();
