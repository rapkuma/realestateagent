import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function parseMainView() {
  const url = 'https://www.applyhome.co.kr/co/coa/selectMainView.do';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  const res = await fetch(url, { headers });
  const html = await res.text();

  console.log(`📄 MainView 수신 길이: ${html.length}자`);

  // href / onclick 추출
  const matches = html.match(/(?:href|onclick)=["']([^"']+)["']/g) || [];
  console.log(`🔍 발견된 링크 수: ${matches.length}개`);
  
  const uniqueLinks = Array.from(new Set(matches));
  uniqueLinks.filter(l => l.includes('Pblanc') || l.includes('List') || l.includes('select')).slice(0, 20).forEach(l => {
    console.log(`   - ${l}`);
  });
}

parseMainView();
