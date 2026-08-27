import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

async function testEndpoints() {
  if (!apiKey) return;

  const testList = [
    // 1. APT
    'getAPTLttotPblancDetail',
    // 2. 오피스텔/도시형/민간임대
    'getUrbntyLttotPblancDetail',
    'getUrbntyLttotPblancInfo',
    'getUrbntyPblancDetail',
    // 3. APT 잔여세대 (무순위)
    'getRemndrLttotPblancDetail',
    // 4. 민간사전청약
    'getPrvtSbjctPblancDetail',
    'getPrvtLttotPblancDetail',
    'getCanclePblancDetail',
    'getPblancNoList',
  ];

  for (const name of testList) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${name}?page=1&perPage=5&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        console.log(`✅ [성공 200]: ${name} -> ${json.data?.length || 0}건 수신`);
      } else {
        console.log(`❌ [실패 ${res.status}]: ${name}`);
      }
    } catch (err: any) {
      console.log(`❌ [에러]: ${name}`);
    }
  }
}

testEndpoints();
