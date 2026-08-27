import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

const endpoints = [
  'getAPTLttotPblancDetail',
  'getAPTLttotPblancMny',
  'getRemndrLttotPblancDetail',
  'getRemndrLttotPblancMny',
  'getUrbntyOftestLttotPblancMny',
  'getUrbntyOftestLttotPblancMnyDetail',
  'getUrbntyOftestPblancMny',
];

async function testAll() {
  if (!apiKey) return;
  for (const ep of endpoints) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${ep}?page=1&perPage=5&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        console.log(`✅ [200 SUCCESS]: ${ep} -> ${json.data?.length || 0}건 수신`);
        if (json.data && json.data.length > 0) {
          console.log(`   샘플: ${json.data[0].HOUSE_NM || json.data[0].house_nm}`);
        }
      } else {
        console.log(`❌ [${res.status}]: ${ep}`);
      }
    } catch (e: any) {
      console.log(`❌ [ERR]: ${ep}`);
    }
  }
}

testAll();
