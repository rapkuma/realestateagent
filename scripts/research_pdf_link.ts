import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function researchPdfLink() {
  const houseManageNo = '2026000372';
  const pblancNo = '2026000372';
  
  // 청약홈 단지 기본정보 모달/페이지 URL (추정)
  // Let's try the common detail page URL format
  const detailUrl = `https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do`;
  
  try {
    const res = await fetch(detailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: `houseManageNo=${houseManageNo}&pblancNo=${pblancNo}`
    });
    
    if (!res.ok) {
      console.log(`Failed to fetch detail page: ${res.status}`);
      return;
    }
    
    const html = await res.text();
    console.log(`Fetched HTML length: ${html.length}`);
    
    // Search for atchmnfl
    const atchmnflMatches = html.match(/atchmnfl/gi);
    console.log(`Matches for 'atchmnfl': ${atchmnflMatches?.length || 0}`);
    
    // Extract surrounding text for matches
    if (atchmnflMatches) {
        const regex = /.{0,100}atchmnfl.{0,100}/gi;
        const matches = html.match(regex);
        if (matches) {
            matches.forEach((m, i) => console.log(`Match ${i+1}: ${m}`));
        }
    }
    
    // Look for pdf
    const pdfMatches = html.match(/.{0,100}\.pdf.{0,100}/gi);
    console.log(`\nMatches for '.pdf': ${pdfMatches?.length || 0}`);
    if (pdfMatches) {
        pdfMatches.forEach((m, i) => console.log(`PDF Match ${i+1}: ${m}`));
    }
    
  } catch (e) {
    console.error(e);
  }
}

researchPdfLink();
