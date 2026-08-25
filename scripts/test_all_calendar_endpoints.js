const apiKey = process.env.APPLYHOME_API_KEY;

const endpoints = [
  'getAPTLttotPblancDetail',           // 1. APT 분양 상세
  'getRemndrLttotPblancDetail',        // 2. APT 무순위/잔여세대 (줍줍)
  'getUrbntyOftestLttotPblancMny',     // 3. 오피스텔/도시형/민간임대 
  'getAPTLttotPblancMny',              // 4. APT 달력 정보
  'getRemndrLttotPblancMny',           // 5. 무순위 달력 정보
];

async function testAllEndpoints() {
  console.log('📡 [청약홈 전수 API 테스트 시작]');
  for (const ep of endpoints) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${ep}?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        const items = json.data || [];
        console.log(`✅ [${ep}] 호출 성공: ${items.length}건 수신`);
        if (items.length > 0) {
          const sample = items[0];
          console.log(`   샘플 필드:`, Object.keys(sample).slice(0, 8).join(', '));
          console.log(`   샘플 단지명:`, sample.HOUSE_NM || sample.house_nm);
        }
      } else {
        console.log(`⚠️ [${ep}] Status: ${res.status}`);
      }
    } catch (e) {
      console.error(`❌ [${ep}] Exception:`, e.message);
    }
  }
}

testAllEndpoints();
