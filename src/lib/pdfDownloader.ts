const pdfParse = require('pdf-parse');

export async function downloadAndParsePdf(houseManageNo: string, pblancNo: string): Promise<{ text: string; url: string } | null> {
  try {
    const urlsToTry = [
      `https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do`,
      `https://www.applyhome.co.kr/ai/aia/selectAPTRemndrLttotPblancDetailView.do`,
      `https://www.applyhome.co.kr/ai/aia/selectAPTRemndrLttotPblancDetail.do`,
      `https://www.applyhome.co.kr/ai/aia/selectRemndrLttotPblancDetail.do`,
      `https://www.applyhome.co.kr/ai/aia/selectCnclLttotPblancDetail.do`,
      `https://www.applyhome.co.kr/ai/aia/selectUrbceLttotPblancDetail.do`,
      `https://www.applyhome.co.kr/ai/aia/selectNtnidPblancDetail.do`
    ];
    
    // 1. 상세 페이지 HTML을 가져와서 첨부파일 URL 추출
    let html = '';
    for (const detailUrl of urlsToTry) {
      const res = await fetch(detailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: `houseManageNo=${houseManageNo}&pblancNo=${pblancNo}`
      });
      
      if (res.ok) {
        html = await res.text();
        const testRegex = /getAtchmnfl\.do\?/gi;
        if (testRegex.test(html)) {
          break; // Found the attachment link, no need to check other endpoints
        }
      }
    }
    
    // getAtchmnfl.do 패턴 추출 (PDF 첨부파일)
    // href="https://static.applyhome.co.kr/ai/aia/getAtchmnfl.do?houseManageNo=2026000372&pblancNo=2026000372&atchmnflSeqNo=1944101&atchmnflSn=7"
    const regex = /https?:\/\/(?:www\.|static\.)?applyhome\.co\.kr\/ai\/aia\/getAtchmnfl\.do\?[^"']*/gi;
    const matches = html.match(regex);
    
    if (!matches || matches.length === 0) {
      console.warn(`[PDF Download] No attachment link found for ${houseManageNo}`);
      return null;
    }
    
    // 첫 번째 파일(보통 모집공고문 원본 PDF) 선택
    let pdfUrl = matches[0];
    
    // 'amp;' 가 포함된 경우 치환
    pdfUrl = pdfUrl.replace(/&amp;/g, '&');
    
    console.log(`[PDF Download] Found PDF URL: ${pdfUrl}`);
    
    // 2. PDF 파일 다운로드
    const pdfRes = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });
    
    if (!pdfRes.ok) {
      console.warn(`[PDF Download] Failed to download PDF HTTP ${pdfRes.status}`);
      return null;
    }
    
    const arrayBuffer = await pdfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`[PDF Download] Downloaded PDF size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    // 3. PDF 텍스트 파싱
    const parsedData = await pdfParse(buffer);
    const fullText = parsedData.text;
    
    console.log(`[PDF Parse] Parsed text length: ${fullText.length} chars, pages: ${parsedData.numpages}`);
    
    // 4. 텍스트 크롭(Crop) 최적화 (토큰 절약을 위해)
    // 핵심 키워드: 공급금액, 분양가, 청약일정, 공급대상, 당첨자발표
    // 너무 길면 OpenAI API에서 오류 발생 가능하므로 최대 15,000자로 제한 (필요시 크롭)
    const MAX_LENGTH = 15000;
    
    if (fullText.length > MAX_LENGTH) {
       console.log(`[PDF Parse] Text is too long (${fullText.length}), trying to crop intelligently...`);
       
       // '공급대상 및 공급금액' 또는 '공급금액' 이라는 단어를 찾아 그 근처를 우선적으로 추출
       let startIndex = fullText.indexOf('공급금액 및 납부일정');
       if (startIndex === -1) startIndex = fullText.indexOf('공급금액');
       if (startIndex === -1) startIndex = fullText.indexOf('분양가');
       if (startIndex === -1) startIndex = fullText.indexOf('공급규모');
       
       if (startIndex !== -1) {
         // 발견한 인덱스보다 1000자 앞부터 시작 (앞부분 맥락 포함)
         const cropStart = Math.max(0, startIndex - 1000);
         return { text: fullText.substring(cropStart, cropStart + MAX_LENGTH), url: pdfUrl };
       }
       
       // 못 찾으면 그냥 처음부터
       return { text: fullText.substring(0, MAX_LENGTH), url: pdfUrl };
    }
    
    return { text: fullText, url: pdfUrl };
    
  } catch (err: any) {
    console.error(`[PDF Download/Parse Error] ${err.message}`);
    return null;
  }
}
