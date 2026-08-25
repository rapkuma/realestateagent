const apiKey = process.env.APPLYHOME_API_KEY;

const candidates = [
  'getUrbntyOftestLttotPblancDetail',
  'getUrbntyOftestLttotPblancInfoDetail',
  'getUrbntyOftestPblancDetail',
  'getUrbntyLttotPblancDetail',
  'getOftestLttotPblancDetail',
  'getAPTLttotPblancDetail',
  'getRemndrLttotPblancDetail'
];

async function search() {
  for (const c of candidates) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${c}?page=1&perPage=10&serviceKey=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      console.log(`${c} -> ${res.status}`);
      if (res.ok) {
        const json = await res.json();
        console.log(`   Found ${json.data ? json.data.length : 0} items!`);
      }
    } catch (e) {
      console.error(c, e.message);
    }
  }
}

search();
