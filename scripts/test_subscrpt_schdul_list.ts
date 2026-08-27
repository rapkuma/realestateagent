import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testSubscrptSchdulList() {
  const url = 'https://www.applyhome.co.kr/co/coa/selectSubscrptSchdulList.do';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  try {
    const res = await fetch(url, { headers });
    console.log(`[HTTP ${res.status}]: ${url}`);
    if (res.ok) {
      const html = await res.text();
      console.log(`   └ HTML 길이: ${html.length}자`);
      const trs = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
      console.log(`   └ <tr> 개수: ${trs.length}개`);
      
      const keywords = ['여의도', '서수원', '에피트', '강동 센텀', '장위', '창원 한신더휴', '해링턴'];
      keywords.forEach(k => {
        if (html.includes(k)) {
          console.log(`   ✨ [타겟 단지 텍스트 감지 성공!]: "${k}"`);
        }
      });
    }
  } catch (e: any) {
    console.error(e.message);
  }
}

testSubscrptSchdulList();
