import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function findJsCalls() {
  const url = 'https://www.applyhome.co.kr/co/coa/selectMainView.do';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  const res = await fetch(url, { headers });
  const html = await res.text();

  const fnIndex = html.indexOf('fn_selectSchdulListNewMain');
  if (fnIndex !== -1) {
    console.log('📌 fn_selectSchdulListNewMain 주변 500자:');
    console.log(html.substring(fnIndex, fnIndex + 500));
  }
}

findJsCalls();
