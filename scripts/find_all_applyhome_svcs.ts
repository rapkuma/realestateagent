import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

async function findSvcs() {
  if (!apiKey) return;

  const svcs = [
    'ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail',
    'ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyMnpblPblancDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyMnpblDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyPblancInfoDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyLttotPblancMstDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyLttotPblancDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyPblancDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyLttotDetail',
    'ApplyhomeInfoDetailSvc/v1/getUrbntyInfoDetail',
    'ApplyhomeInfoDetailSvc/v1/getPrvtSbjctPblancDetail',
    'ApplyhomeInfoDetailSvc/v1/getPrvtPblancDetail',
    'ApplyhomeInfoDetailSvc/v1/getPrvtSbjctDetail',
    'ApplyhomeInfoDetailSvc/v1/getPblancNoList',
  ];

  for (const s of svcs) {
    const url = `https://api.odcloud.kr/api/${s}?page=1&perPage=5&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        console.log(`✅ [성공 200]: ${s} -> ${json.data?.length || 0}건`);
      }
    } catch {}
  }
}

findSvcs();
