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

async function debugMissing() {
  if (!apiKey) return;

  const targets = [
    '여의도',
    '서수원',
    '에피트',
    '강동 센텀',
    '장위',
    '푸르지오 마크원',
    '창원 한신더휴',
    '해링턴',
  ];

  console.log('🔍 [8월 27일자 모집공고 미분석 5개 단지 OpenAPI 필드 정밀 디버깅]\n');

  let allRemndr: any[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=${page}&perPage=100&serviceKey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const json = await res.json();
      allRemndr.push(...(json.data || []));
    }
  }

  targets.forEach((keyword) => {
    const matched = allRemndr.filter((i) => (i.HOUSE_NM || '').includes(keyword));
    console.log(`📌 Key: "${keyword}" -> ${matched.length}건 검색됨`);
    matched.forEach((m) => {
      console.log(`   - HOUSE_NM: "${m.HOUSE_NM}"`);
      console.log(`     PBLANC_NO: ${m.PBLANC_NO} | RCRIT_PBLANC_DE: ${m.RCRIT_PBLANC_DE}`);
      console.log(`     SUBSCRPT_RCEPT_BGNDE: ${m.SUBSCRPT_RCEPT_BGNDE} | RCEPT_BGNDE: ${m.RCEPT_BGNDE}`);
      console.log(`     HSSPLY_ADRES: ${m.HSSPLY_ADRES}`);
    });
    console.log('----------------------------------------------------');
  });
}

debugMissing();
