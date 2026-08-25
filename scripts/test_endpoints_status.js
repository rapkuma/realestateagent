const apiKey = process.env.APPLYHOME_API_KEY;

const testList = [
  'getUrbntyOftestLttotPblancDetail',
  'getUrbntyOftestLttotPblancMny',
  'getUrbntyOftestLttotPblancMnyDetail',
  'getUrbntyOftestPblancDetail',
  'getUrbntyOftestPblancInfoDetail',
  'getAPTLttotPblancDetail',
  'getRemndrLttotPblancDetail'
];

async function run() {
  for (const name of testList) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${name}?page=1&perPage=5&serviceKey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    console.log(`${name}: HTTP ${res.status}`);
  }
}

run();
