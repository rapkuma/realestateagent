import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function discoverWebRoutes() {
  const base = 'https://www.applyhome.co.kr';
  const routes = [
    '/',
    '/co/coa/selectMainView.do',
    '/ai/aia/selectRemndrLttotPblancListView.do',
    '/ai/aab/selectAptLttotPblancList.do',
    '/co/cob/selectAptLttotPblancList.do',
    '/co/coa/selectAptLttotPblancList.do',
    '/ai/aia/selectAptLttotPblancListView.do',
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  for (const r of routes) {
    try {
      const res = await fetch(`${base}${r}`, { headers });
      console.log(`[HTTP ${res.status}]: ${base}${r}`);
    } catch {}
  }
}

discoverWebRoutes();
