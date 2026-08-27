import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testSchdulDates() {
  const dates = ['20260827', '20260828', '20260831', '20260901', '20260903'];
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  for (const d of dates) {
    const url = `https://www.applyhome.co.kr/co/coa/selectSubscrptSchdulList.do?searchDate=${d}`;
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const html = await res.text();
        console.log(`[${d}] HTML 길이: ${html.length}자`);
        // 단지명 추출 (a태그 data-pbno)
        const matches = html.match(/<a[^>]*data-pbno[^>]*>([\s\S]*?)<\/a>/gi) || [];
        console.log(`   └ 발견된 단지 링크 수: ${matches.length}개`);
        matches.forEach(m => {
          const clean = m.replace(/<[^>]*>?/gm, '').trim();
          console.log(`      - ${clean}`);
        });
      }
    } catch (e: any) {
      console.error(d, e.message);
    }
  }
}

testSchdulDates();
