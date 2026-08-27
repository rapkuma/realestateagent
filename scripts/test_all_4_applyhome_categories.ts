import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { format } from 'date-fns';

const apiKey = process.env.APPLYHOME_API_KEY;

async function testAll4Categories() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  console.log(`🔍 [청약홈 4대 공식 카테고리 OpenAPI 연동 테스트] (기준일: ${todayStr})\n`);

  if (!apiKey) {
    console.error('❌ APPLYHOME_API_KEY 없음');
    return;
  }

  // 청약홈 4대 공식 분류 OpenAPI 엔드포인트 목록
  const categories = [
    {
      name: '1. APT (일반분양주택)',
      url: `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`,
    },
    {
      name: '2. 오피스텔/생활숙박시설/도시형/(공공지원)민간임대',
      url: `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getUrbntyLttotPblancDetail?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`,
    },
    {
      name: '3. APT 잔여세대 (무순위/줍줍/취소재공급)',
      url: `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`,
    },
    {
      name: '4. 민간사전청약 / 취소주택',
      url: `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getPblancNoList?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`,
    },
  ];

  for (const cat of categories) {
    try {
      const res = await fetch(cat.url, { headers: { Accept: 'application/json' } });
      console.log(`📡 [${cat.name}] 응답 상태 코드: ${res.status}`);
      if (res.ok) {
        const json = await res.json();
        const items = json.data || [];
        console.log(`   └ 총 ${items.length}건 데이터 조회됨.`);
        if (items.length > 0) {
          console.log(`   └ 샘플 단지 1: ${items[0].HOUSE_NM || items[0].house_nm || items[0].PBLANC_TITLE || '단지명'}`);
          console.log(`   └ 샘플 위치: ${items[0].HSSPLY_ADRES || items[0].hssply_adres || '위치'}`);
        }
      } else {
        console.log(`   └ 호출 실패: ${res.statusText}`);
      }
    } catch (err: any) {
      console.error(`❌ [${cat.name}] 예외 발생:`, err.message);
    }
    console.log('----------------------------------------------------');
  }
}

testAll4Categories();
