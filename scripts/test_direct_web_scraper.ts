import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { ApartmentData } from '../src/lib/applyhome';
import { format } from 'date-fns';

export async function fetchApplyHomeWebScraper(): Promise<ApartmentData[]> {
  console.log('🌐 [Direct Web Scraper] 청약홈 공식 웹사이트 실시간 0초 스크레이퍼 가동...');

  const results: ApartmentData[] = [];
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // 청약홈 잔여세대/무순위 직접 조회 URL
  const remndrWebUrl = 'https://www.applyhome.co.kr/co/coa/selectRemndrLttotPblancList.do';
  const aptWebUrl = 'https://www.applyhome.co.kr/co/coa/selectAptLttotPblancList.do';

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    const res = await fetch(remndrWebUrl, { headers });
    if (!res.ok) {
      console.warn(`⚠️ 웹 스크레이퍼 HTTP 상태: ${res.status}`);
      return [];
    }

    const html = await res.text();
    console.log(`📡 [ApplyHome Web] 수신된 HTML 길이: ${html.length}자`);

    // HTML 테이블 행 (tr) 파싱
    const trMatches = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    console.log(`🔍 파싱된 <tr> 행 수: ${trMatches.length}개`);

    trMatches.forEach((tr) => {
      // <td> 태그 추출
      const tdMatches = tr.match(/<td[\s\S]*?<\/td>/gi) || [];
      if (tdMatches.length >= 6) {
        const textTd = tdMatches.map((td) => td.replace(/<[^>]*>?/gm, '').trim());

        const region = textTd[0] || '';
        const supplyType = textTd[1] || '';
        const rawName = textTd[2] || '';
        const builder = textTd[3] || '';
        const announcementDate = textTd[4] || '';
        const periodStr = textTd[5] || '';
        const winnerDate = textTd[6] || '';

        // 이름 추출 (New 아이콘 제거 등)
        const aptName = rawName.replace(/N\s*$/g, '').trim();

        // 청약 기간에서 시작일 YYYY-MM-DD 추출
        const dateMatch = periodStr.match(/(202[4-9][-.]\d{2}[-.]\d{2})/);
        const applyDate = dateMatch ? dateMatch[1].replace(/\./g, '-') : '';

        if (aptName && (applyDate >= todayStr || announcementDate === todayStr)) {
          results.push({
            apt_name: aptName,
            location: `${region} 지역 공고`,
            price_info: '분양가 공고문 참조',
            apply_date: applyDate || todayStr,
            announcement_date: announcementDate,
            winner_date: winnerDate,
            supply_scale: '무순위/임의공급',
            supply_type: supplyType || '무순위 (줍줍)',
            builder: builder || '시행/시공사 공고문 참조',
          });
        }
      }
    });

    console.log(`✅ [ApplyHome Web Scraper 완료] 당일/유효 신규 물건 ${results.length}건 직접 파싱 성공!`);
  } catch (err: any) {
    console.error('❌ [ApplyHome Web Scraper] 예외 발생:', err.message);
  }

  return results;
}

fetchApplyHomeWebScraper();
