import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function findFunctionBody() {
  const url = 'https://www.applyhome.co.kr/co/coa/selectMainView.do';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  const res = await fetch(url, { headers });
  const html = await res.text();

  const fnIndex = html.indexOf('function fn_selectSchdulListNewMain');
  if (fnIndex !== -1) {
    console.log('📌 function fn_selectSchdulListNewMain 함수 본문:');
    console.log(html.substring(fnIndex, fnIndex + 800));
  } else {
    console.log('❌ 함수 본문을 HTML 내부에서 못 찾음. 외부 JS 파일 참조 확인.');
    const jsFiles = html.match(/src=["']([^"']+\.js)["']/g) || [];
    jsFiles.forEach(js => console.log(`   - JS: ${js}`));
  }
}

findFunctionBody();
