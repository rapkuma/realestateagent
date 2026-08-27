import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { format } from 'date-fns';

const apiKey = process.env.APPLYHOME_API_KEY;

async function fetchTodayAnnouncements() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCompact = format(new Date(), 'yyyyMMdd');

  console.log(`📅 [오늘 기준 모집공고일 수집]: ${todayStr} (${todayCompact})\n`);

  if (!apiKey) {
    console.error('❌ API Key 없음');
    return;
  }

  const endpoints = [
    { name: 'APT 분양 상세', url: 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=200' },
    { name: '무순위/줍줍 상세', url: 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=200' },
    { name: '오피스텔/도시형', url: 'https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getUrbntyLttotPblancDetail?page=1&perPage=200' },
  ];

  let totalMatched = 0;

  for (const ep of endpoints) {
    const fullUrl = `${ep.url}&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(fullUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;
      const json = await res.json();
      const items = json.data || [];

      console.log(`🔎 ${ep.name}: 총 ${items.length}건 검색 중...`);

      const todayAnnouncements = items.filter((item: any) => {
        const pblancDe = item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de || item.PBLANC_DE || item.pblanc_de || '';
        const formatted = pblancDe.toString().replace(/[^0-9]/g, '');
        return formatted === todayCompact || pblancDe === todayStr;
      });

      if (todayAnnouncements.length > 0) {
        console.log(`✨ [${ep.name}] 오늘자(${todayStr}) 모집공고 단지 (${todayAnnouncements.length}건):`);
        todayAnnouncements.forEach((item: any, idx: number) => {
          totalMatched++;
          console.log(`  ${idx + 1}. [단지명]: ${item.HOUSE_NM || item.house_nm}`);
          console.log(`     - 위치: ${item.HSSPLY_ADRES || item.hssply_adres}`);
          console.log(`     - 모집공고일: ${item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de}`);
          console.log(`     - 청약접수일: ${item.RCEPT_BGNDE || item.subscrpt_rcept_bgnde || item.SUBSCRPT_RCEPT_BGNDE}`);
          console.log(`     - 공급규모: ${item.TOT_SUPLY_HSHLDCO || item.tot_suply_hshldco}세대`);
          console.log('---');
        });
      } else {
        console.log(`   (오늘자 ${todayStr} 모집공고 물건 0건)\n`);
      }
    } catch (err) {
      console.error(`❌ ${ep.name} 호출 에러:`, err);
    }
  }

  console.log(`========================================`);
  console.log(`🎉 오늘자(${todayStr}) 모집공고일 물건 총 ${totalMatched}건 수집 완료!`);
}

fetchTodayAnnouncements();
