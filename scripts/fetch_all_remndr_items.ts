import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { format } from 'date-fns';

const apiKey = process.env.APPLYHOME_API_KEY;

function formatDateStr(dateStr: any): string {
  if (!dateStr) return '';
  const s = dateStr.toString().trim();
  if (s.length === 8 && !s.includes('-')) {
    return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
  }
  return s;
}

async function fetchAllRemndr() {
  if (!apiKey) return;
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  let allRemndr: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 5) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=${page}&perPage=100&serviceKey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) break;
    const json = await res.json();
    const data = json.data || [];
    if (data.length === 0) {
      hasMore = false;
    } else {
      allRemndr.push(...data);
      if (data.length < 100) hasMore = false;
      else page++;
    }
  }

  console.log(`📦 [잔여세대/무순위 OpenAPI 전수 수집]: 총 ${allRemndr.length}건 수신 완료! (페이지 ${page}개 사용)\n`);

  console.log(`✨ [사용자 첨부 스크린샷 8월 27일 오늘 고시 물건 매칭 현황]:\n`);

  const screenshotItems = [
    '여의도',
    '에피트',
    '강동 센텀',
    '장위 푸르지오',
    '창원 한신더휴',
    '해링턴플레이스 노원',
    '호반써밋 풍무',
  ];

  screenshotItems.forEach((keyword) => {
    const matched = allRemndr.filter((item: any) => (item.HOUSE_NM || item.house_nm || '').includes(keyword));
    if (matched.length > 0) {
      matched.forEach((m: any) => {
        const applyDate = formatDateStr(m.SUBSCRPT_RCEPT_BGNDE || m.RCEPT_BGNDE);
        const pblancDate = formatDateStr(m.PBLANC_NO || m.RCRIT_PBLANC_DE);
        console.log(`✅ [발견]: ${m.HOUSE_NM || m.house_nm}`);
        console.log(`   - 위치: ${m.HSSPLY_ADRES || m.hssply_adres}`);
        console.log(`   - 모집공고일: ${pblancDate} | 청약접수일: ${applyDate} | 세대수: ${m.TOT_SUPLY_HSHLDCO}세대`);
      });
    } else {
      console.log(`❌ [미발견]: ${keyword}`);
    }
    console.log('----------------------------------------------------');
  });
}

fetchAllRemndr();
