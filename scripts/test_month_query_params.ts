import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { format, addMonths } from 'date-fns';

const apiKey = process.env.APPLYHOME_API_KEY;

async function testMonthParams() {
  if (!apiKey) return;

  const currentMonth = format(new Date(), 'yyyyMM');
  const nextMonth = format(addMonths(new Date(), 1), 'yyyyMM');

  console.log(`🔍 [월별 검색 매개변수 연동 테스트] (${currentMonth} ~ ${nextMonth})\n`);

  const paramVariants = [
    `page=1&perPage=200`,
    `page=1&perPage=200&startmonth=${currentMonth}&endmonth=${nextMonth}`,
    `page=1&perPage=200&searchMonth=${currentMonth}`,
    `page=1&perPage=200&cond[SUBSCRPT_RCEPT_BGNDE::gte]=2026-08-01`,
    `page=1&perPage=200&cond[RCRIT_PBLANC_DE::gte]=2026-08-01`,
  ];

  for (const pv of paramVariants) {
    const remndrUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?${pv}&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(remndrUrl, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        const items = json.data || [];
        console.log(`📌 [파라미터: ${pv}] -> 총 ${items.length}건 수신`);
        const foundTarget = items.find((i: any) => (i.HOUSE_NM || '').includes('여의도') || (i.HOUSE_NM || '').includes('장위') || (i.HOUSE_NM || '').includes('에피트'));
        if (foundTarget) {
          console.log(`   ✨ [타겟 단지 발견!!]: ${foundTarget.HOUSE_NM} (모집공고일: ${foundTarget.PBLANC_NO || foundTarget.RCRIT_PBLANC_DE})`);
        } else if (items.length > 0) {
          console.log(`   - 샘플 3개: ${items.slice(0, 3).map((i: any) => i.HOUSE_NM).join(', ')}`);
        }
      } else {
        console.log(`❌ [파라미터: ${pv}] HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.error(e.message);
    }
    console.log('----------------------------------------------------');
  }
}

testMonthParams();
