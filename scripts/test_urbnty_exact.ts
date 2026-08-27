import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

async function testExact() {
  if (!apiKey) return;

  const list = [
    'getUrbntyMnpblLttotPblancDetail',
    'getUrbntyMnpblPblancDetail',
    'getUrbntyPblancDetail',
    'getUrbntyLttotPblancDetail',
    'getUrbntyMnpblPblancInfo',
    'getUrbntyLttotPblancMst',
    'getUrbntyLttotMnpblPblancDetail',
  ];

  for (const name of list) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${name}?page=1&perPage=5&serviceKey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    console.log(`[${res.status}]: ${name}`);
  }
}

testExact();
