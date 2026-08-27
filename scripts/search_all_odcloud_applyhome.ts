import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

async function searchAll() {
  if (!apiKey) return;

  const endpoints = [
    // Category 1: APT
    'getAPTLttotPblancDetail',
    // Category 2: 오피스텔/도시형/민간임대
    'getUrbntyOfclstLttotPblancDetail',
    'getUrbntyOfclstPblancDetail',
    'getUrbntyOfclstDetail',
    'getUrbntyOfclstLttotDetail',
    'getUrbntyOftestLttotPblancDetail',
    'getUrbntyMnpblLttotPblancDetail',
    'getUrbntyLttotPblancDetail',
    'getUrbntyOfclstPblancInfoDetail',
    'getUrbntyPblancDetail',
    // Category 3: APT 잔여세대 (무순위 줍줍)
    'getRemndrLttotPblancDetail',
    // Category 4: 민간사전청약
    'getPrvtSbjctPblancDetail',
    'getPrivateSbjctPblancDetail',
    'getPrvtLttotPblancDetail',
    'getPrvtSbjctDetail',
    'getCanclePblancDetail',
  ];

  for (const ep of endpoints) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${ep}?page=1&perPage=2&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        console.log(`✅ [200 SUCCESS]: ApplyhomeInfoDetailSvc/v1/${ep} -> ${json.data?.length || 0}건`);
      } else {
        // try without Detail
        const url2 = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${ep.replace('Detail', '')}?page=1&perPage=2&serviceKey=${encodeURIComponent(apiKey)}`;
        const res2 = await fetch(url2, { headers: { Accept: 'application/json' } });
        if (res2.ok) {
          const json2 = await res2.json();
          console.log(`✅ [200 SUCCESS]: ApplyhomeInfoDetailSvc/v1/${ep.replace('Detail', '')} -> ${json2.data?.length || 0}건`);
        }
      }
    } catch (err) {}
  }
}

searchAll();
