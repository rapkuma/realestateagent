import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testSchdul() {
  const url = 'https://www.applyhome.co.kr/co/coa/selectSchdulListNewMain.do';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    const res = await fetch(url, { method: 'POST', headers, body: 'searchMonth=202608' });
    console.log(`[HTTP ${res.status}]: ${url}`);
    if (res.ok) {
      const html = await res.text();
      console.log(`   └ 수신 길이: ${html.length}자`);
      const trs = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
      console.log(`   └ <tr> 태그 수: ${trs.length}개`);
    }
  } catch (e: any) {
    console.error(e.message);
  }
}

testSchdul();
