import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

async function discover() {
  if (!apiKey) return;

  const services = [
    'ApplyhomeInfoDetailSvc',
    'ApplyhomeInfoPblancDetailSvc',
    'ApplyhomePblancInfoService',
    'ApplyhomeInfoSvc',
  ];

  const operations = [
    'getAPTLttotPblancDetail',
    'getRemndrLttotPblancDetail',
    'getUrbntyOfclLttotPblancDetail',
    'getUrbntyOfclDetail',
    'getOfclLttotPblancDetail',
    'getUrbntyPblancDetail',
    'getPrivateSbjctPblancDetail',
    'getPrvtSbjctPblancDetail',
    'getPrvtLttotPblancDetail',
    'getCanclePblancDetail',
  ];

  for (const svc of services) {
    for (const op of operations) {
      const url = `https://api.odcloud.kr/api/${svc}/v1/${op}?page=1&perPage=2&serviceKey=${encodeURIComponent(apiKey)}`;
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const json = await res.json();
          console.log(`🎉 [발견 200 SUCCESS]: ${svc}/v1/${op} (${json.data?.length || 0}건)`);
        }
      } catch {}
    }
  }
}

discover();
