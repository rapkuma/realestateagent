import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testWebUrls() {
  const urls = [
    'https://www.applyhome.co.kr/ai/aia/selectRemndrLttotPblancListView.do',
    'https://www.applyhome.co.kr/ai/aia/selectAptLttotPblancListView.do',
    'https://www.applyhome.co.kr/co/coa/selectAptLttotPblancList.do',
    'https://www.applyhome.co.kr/ai/aab/selectAptLttotPblancList.do',
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      console.log(`[HTTP ${res.status}]: ${url}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`   └ 수신 길이: ${text.length}자`);
        if (text.includes('여의도') || text.includes('장위') || text.includes('서수원') || text.includes('임의공급')) {
          console.log(`   ✨ [타겟 단지 텍스트 감지 성공!]`);
        }
      }
    } catch (e: any) {
      console.log(`❌ [ERR]: ${url}`);
    }
  }
}

testWebUrls();
