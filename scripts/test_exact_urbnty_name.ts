import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

async function testUrbntyExact() {
  if (!apiKey) return;

  const names = [
    'getUrbntyOfclstLttotPblancDetail',
    'getUrbntyOftestLttotPblancDetail',
    'getUrbntyOfclLttotPblancDetail',
    'getUrbntyLttotPblancDetail',
    'getPrivateSbjctPblancDetail',
    'getPrvtSbjctPblancDetail',
    'getPrvtSbjctLttotPblancDetail',
    'getPrivateSbjctLttotPblancDetail',
  ];

  for (const n of names) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${n}?page=1&perPage=5&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        console.log(`🎯 [FOUND! 200 SUCCESS]: ${n} -> ${json.data?.length || 0}건`);
      } else {
        console.log(`❌ [${res.status}]: ${n}`);
      }
    } catch (e: any) {
      console.log(`❌ [ERR]: ${n}`);
    }
  }
}

testUrbntyExact();
