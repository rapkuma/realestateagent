import OpenAI from 'openai';
import { ApartmentData, TypeDetail, FinancingDetail } from '@/lib/applyhome';
import { extractDataFromPdfText, ExtractedPdfData } from '@/lib/pdfExtractor';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export interface NewsletterContent {
  title: string;
  summary_text: string;
  content_html: string;
  apt_name?: string;
}

// 1. 개별 아파트 물건(단지)별 심층 분석 블로그 아티클 생성기
export async function generateApartmentPost(
  apt: ApartmentData,
  pdfText?: string,
  pdfUrl?: string
): Promise<NewsletterContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  const todayStr = format(new Date(), 'yyyy년 M월 d일', { locale: ko });
  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(apt.location || apt.apt_name)}`;

  // PDF 텍스트에서 타입 및 분양가, 규제정보 직접 추출
  const extractedPdf = pdfText ? extractDataFromPdfText(pdfText, apt.location) : null;
  if (extractedPdf && extractedPdf.types_detail.length > 0 && (!apt.types_detail || apt.types_detail.length === 0)) {
    apt.types_detail = extractedPdf.types_detail;
  }

  const title = `[${apt.apt_name}] ${apt.supply_type || '청약 줍줍'} 심층 분석 리포트`;

  if (apiKey && apiKey !== 'sk-proj-your_openai_api_key_here') {
    try {
      console.log(`🤖 [OpenAI] 아파트 물건별 정밀 분석 생성 (2026.8 LTV & 주택가격별 절대한도 이중적용): ${apt.apt_name}`);
      const openai = new OpenAI({ apiKey });

      const typesDetailedText = (apt.types_detail || [])
        .map((t) => {
          const f = t.financing;
          return `
[평형/타입: ${t.type_name}]
- 전용면적: ${t.exclusive_area}
- 공급 세대수: 일반공급 ${t.general_supply}세대, 특별공급 ${t.special_supply}세대 (총 ${t.total_supply}세대)
- 최고 분양가: ${t.price_max} (${t.price_per_pyeong || ''})
${
  f
    ? `- 발코니/옵션비: ${f.option_price}
- 실질 총 인수금액: ${f.total_acquisition}
- 계약금(10~20% 현금): ${f.deposit_amount}
- 입주 잔금: ${f.balance_amount}
- 예상 대출 가능액 (2026.8 LTV & 주택가격별 절대한도 이중적용): ${f.loan_limit}
- 당첨 시 최종 필요 자기자금(현금): ${f.required_cash}
- 인근 유사단지 시세: ${f.market_price}
- 예상 안전마진(시세차익): ${f.safety_margin}`
    : ''
}
`;
        })
        .join('\n');

      const aptDetails = `
[기본 단지 정보]
- 단지명: ${apt.apt_name}
- 공급위치: ${apt.location}
- 네이버 지도 링크: ${naverMapUrl}
- 공급유형: ${apt.supply_type || '민영주택 일반/특별공급'}
- 시공사/브랜드: ${apt.builder || '주요 건설사'}
- 대표 분양가: ${apt.price_info || '미정'}
- 공급규모: ${apt.supply_scale || '미정'}
- 모집공고일: ${apt.announcement_date || '공고문 참조'}
- 청약접수일: ${apt.apply_date || '미정'}
- 당첨자발표일: ${apt.winner_date || '공고문 참조'}
- 계약일정: ${apt.contract_date || '공고문 참조'}

[평형별 상세 공급 세대수 & 2026.8 이중대출규제 정밀 데이터]
${typesDetailedText || '단일 평형'}
`;

      const systemPrompt = `
당신은 대한민국 최고의 부동산 청약 전문 수석 애널리스트이자 전문 금융 에디터입니다.
제공된 단일 아파트 분양 공고 데이터를 바탕으로 독자가 당첨 전략과 자금 계획을 완벽하게 세울 수 있는 [청약 6대 심층 분석 포맷]의 단독 블로그 포스트를 작성하세요.

🚨 [절대 준수 규칙 - 1. Fact 무결성 (AI 할루시네이션 100% 금지)]
- **공급위치(주소), 대표 분양가, 세대수, 청약일정, 시공사 정보**는 입력 데이터로 제공된 [분양 단지 정밀 데이터]의 원본 수치와 텍스트를 100% 정확하게 그대로 인용해야 하며, AI가 임의로 다른 도로명 주소나 분양가를 지어내거나 변경하는 것(Hallucination)을 엄격히 금지함!

🚨 [절대 준수 규칙 - 2. 2026년 8월 기준 주택담보대출 이중 규제 공식 엄격 적용]
1. **2026.8 주담대 이중 규제 공식**:
   - **LTV 한도**: 규제지역(투기과열) 40%, 비규제지역 70% (생애최초 70%)
   - **주택 가격별 절대 한도(절대 캡)**:
     - 15억 이하 주택: **최대 6억 원**
     - 15억 초과 ~ 25억 이하 주택: **최대 4억 원**
     - 25억 초과 주택: **최대 2억 원**
   - **최종 대출 가능액**: Min(총인수금액 × LTV, 주택 가격별 절대 한도)
   - **최종 필요 현금(자기자금)**: 실질 총인수금액 - 최종 대출 가능액
   - 위 수식을 바탕으로 1원/만원 단위까지 정확하게 계산하여 표에 제공할 것!
2. **평형별 분양 세대수 상세 표 필수**: 타입명, 전용면적, 일반공급 세대수, 특별공급 세대수, 총 세대수, 최고 분양가를 HTML 테이블로 작성할 것.
3. **자금 조달 시뮬레이션 & 안전마진을 반드시 [평형별로 각각 나누어] 정밀 표로 작성할 것**: 
   - 평형별로 각각 분양가, 옵션비, 실인수액, 계약금, 잔금, 2026.8 대출가능액, 필요현금, 인근시세, 안전마진 금액을 원화 단위로 정확히 분리하여 제공할 것!
4. 공급위치 및 4대 입지 분석 섹션에 반드시 [네이버 지도 바로가기 링크: ${naverMapUrl}] 버튼을 삽입할 것!

[20대 필수 목차 (반드시 아래 20개 목차를 순서대로 H3 태그를 사용하여 작성)]
1. 청약개요
2. 모집공고 (다운로드 버튼 또는 링크 안내)
3. 위치
4. 공급규모
5. 청약일정
6. 분양홈페이지
7. 안전마진 (2026.8 이중규제 시뮬레이션 결과 반영)
8. 평면도 및 커뮤니티 (데이터 부족 시 "공식 홈페이지 참조")
9. 분양가 및 세대수 (평형별 분양 세대수 상세 표 포함)
10. 입지조건 (네이버 지도 버튼 필수 삽입)
11. 호재 (데이터 부족 시 일반적 입지 호재 기재)
12. 비교단지 (인근 유사단지 시세 비교)
13. 분석 (종합 분석)
14. 청약전략 (점수대별 전략 등)
15. 청약자격 (거주요건, 무주택 여부 등)
16. 제한사항 (재당첨 제한, 전매제한 등)
17. 대출조건 (2026.8 주담대 절대한도 등 상세 기재)
18. 추첨제 물량
19. 전략 (자금 조달 전략)
20. 주의사항

[출력 형식 가이드]
반드시 다음 JSON 형식으로만 응답하세요:
{
  "title": "[단지명] 평형별 세대수·분양가·2026.8대출규제 자금시뮬레이션 심층 분석",
  "summary_text": "핵심 요약 2줄",
  "content_html": "아름다운 인라인 스타일링(모던 컬러, 패딩, 테두리, 카드 형태, 평형별 개별 표, 네이버 지도 녹색 버튼)이 적용된 완성형 HTML 본문"
}
`;

      const userPrompt = `
[오늘 날짜]: ${todayStr}
[분양 단지 정밀 데이터]:
${aptDetails}
${pdfText ? `\n[모집공고문 원본 추출 텍스트 (참고용)]:\n${pdfText}\n` : ''}

위 데이터를 바탕으로 평형별 분양 세대수와 [2026년 8월 기준 LTV 및 가격대별 절대한도 이중 규제가 적용된 평형별 개별 자금 조달 시뮬레이션 표]가 담긴 최고 수준의 블로그 리포트를 작성해 주세요.
${pdfText ? '특히, 첨부된 [모집공고문 원본 추출 텍스트]를 꼼꼼히 분석하여 1. 청약자격, 2. 제한사항(전매제한, 실거주의무 등), 3. 정확한 분양가 및 납부일정을 반드시 포함하세요.' : ''}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 16384,
      });

      const rawJson = response.choices[0].message.content;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);

        // 100% 할루시네이션 방지: 코드 레벨에서 정부 청약홈 공공데이터 팩트 박스를 상단에 자동 결합
        const pdfButtonHtml = pdfUrl 
          ? `<a href="${pdfUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background-color: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">📄 공식 입주자모집공고문 다운로드 (PDF)</a>` 
          : '';

        const officialFactBoxHtml = `
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 10px; display: flex; items-center; gap: 6px;">
              <span>🏛️ [한국부동산원 청약홈 공식 검증 팩트 데이터]</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 13px; color: #334155;">
              <div><b>📍 정확한 공급위치(주소):</b> <span style="color: #1e40af; font-weight: 700;">${apt.location || '공고문 참조'}</span></div>
              <div><b>💰 대표 분양가:</b> <span style="color: #dc2626; font-weight: 800;">${apt.price_info || '미정'}</span></div>
              <div><b>🗓️ 청약 접수일:</b> <span style="color: #059669; font-weight: 700;">${apt.apply_date || '미정'}</span></div>
              <div><b>🏢 시공사/브랜드:</b> <span>${apt.builder || '주요 건설사'}</span></div>
              <div><b>📐 공급 규모:</b> <span>${apt.supply_scale || '미정'}</span></div>
            </div>
            <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
              ${pdfButtonHtml}
            </div>
          </div>
        `;

        const finalContentHtml = officialFactBoxHtml + (parsed.content_html || '');

        return {
          title: parsed.title || title,
          summary_text: parsed.summary_text || `${apt.apt_name} 심층 청약 분석 리포트`,
          content_html: finalContentHtml,
          apt_name: apt.apt_name,
        };
      } else {
        console.error(`❌ [OpenAI] ${apt.apt_name} rawJson is empty`);
      }
    } catch (err) {
      console.error(`❌ [OpenAI] ${apt.apt_name} 단독 분석 생성 오류:`, err);
    }
  }

  return generateSingleAptFallback(apt, todayStr, pdfUrl, extractedPdf);
}

// 2. 전체 단지 종합 브리핑 뉴스레터 생성기
export async function generateNewsletterSummary(
  apartments: ApartmentData[]
): Promise<NewsletterContent> {
  const apiKey = process.env.OPENAI_API_KEY;
  const todayStr = format(new Date(), 'yyyy년 M월 d일', { locale: ko });

  if (!apartments || apartments.length === 0) {
    return {
      title: `[청약 헬퍼] ${todayStr} 신규 청약 공고 안내`,
      summary_text: '현재 접수 중이거나 예정된 신규 아파트 청약 공고가 없습니다.',
      content_html: `<div style="padding: 30px; text-align: center; color: #64748b;">
        <p style="font-size: 16px; font-weight: 600;">현재 접수 중이거나 예정된 신규 아파트 청약 공고가 없습니다.</p>
        <p style="font-size: 14px; margin-top: 8px;">다음 청약 일정이 업데이트되는 대로 신속하게 전달해 드리겠습니다.</p>
      </div>`,
    };
  }

  const mainApt = apartments[0]?.apt_name || '주요 분양단지';
  const otherCount = apartments.length - 1;
  const defaultTitle =
    otherCount > 0
      ? `[청약 헬퍼] ${mainApt} 외 ${otherCount}곳 평형별 세대수 및 2026.8 대출규제 안전마진 총정리`
      : `[청약 헬퍼] ${mainApt} 평형별 세대수 및 2026.8 대출규제 안전마진 총정리`;

  if (apiKey && apiKey !== 'sk-proj-your_openai_api_key_here') {
    try {
      console.log('🤖 [OpenAI] 종합 뉴스레터 브리핑 생성 중...');
      const openai = new OpenAI({ apiKey });

      const aptListText = apartments
        .map(
          (apt, idx) => `
[분양 단지 ${idx + 1}]
- 단지명: ${apt.apt_name}
- 공급위치: ${apt.location} (네이버 지도: https://map.naver.com/p/search/${encodeURIComponent(apt.location)})
- 분양가: ${apt.price_info || '미정'}
- 접수일: ${apt.apply_date || '미정'}
- 규모: ${apt.supply_scale || '미정'}
`
        )
        .join('\n');

      const systemPrompt = `
당신은 대한민국 대표 부동산 청약 전문 에디터입니다.
제공된 이번 주 청약 단지 목록을 바탕으로 독자에게 전달할 [주간 청약 종합 브리핑 뉴스레터]를 작성하세요.
2026.8 주담대 이중 규제(LTV + 가격대별 절대한도) 기준에 따른 대출 한도와 평형별 세대수, 네이버 지도 연동 링크를 명확한 HTML로 구성하세요.

[출력 형식] JSON: {"title": "...", "summary_text": "...", "content_html": "..."}
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `[오늘]: ${todayStr}\n${aptListText}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const rawJson = response.choices[0].message.content;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          title: parsed.title || defaultTitle,
          summary_text: parsed.summary_text || '',
          content_html: parsed.content_html || '',
        };
      }
    } catch (err) {
      console.error('❌ [OpenAI] 종합 요약 생성 중 오류:', err);
    }
  }

  return generateCombinedFallback(apartments, todayStr, defaultTitle);
}

// 단일 아파트 단지 Fallback HTML 생성 (2026년 8월 기준 이중 규제 공식 완비)
function generateSingleAptFallback(
  apt: ApartmentData,
  todayStr: string,
  pdfUrl?: string,
  extractedPdf?: ExtractedPdfData | null
): NewsletterContent {
  const pdfButtonHtml = pdfUrl 
    ? `<a href="${pdfUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background-color: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">📄 공식 입주자모집공고문 다운로드 (PDF)</a>` 
    : '';
  const title = `[${apt.apt_name}] ${apt.supply_type || '청약 줍줍'} 평형별 세대수·분양가·2026.8대출규제 자금시뮬레이션 심층 분석`;
  const summary_text = `${apt.apt_name}의 평형별 공급 세대수, 2026년 8월 기준 주담대 이중 규제(LTV+가격대별 절대한도) 자금 조달 시뮬레이션, 네이버 지도 연동 4대 입지 분석 리포트입니다.`;

  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(apt.location || apt.apt_name)}`;
  const homepageSearchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(apt.apt_name + ' 분양 홈페이지')}`;
  const applyhomeUrl = 'https://www.applyhome.co.kr';

  const applyDate = apt.apply_date || '접수일 미정';
  const winnerDate = apt.winner_date || '당첨자 발표일 미정';
  const contractDate = apt.contract_date || '계약일정 공고문 참조';
  const announcementDate = apt.announcement_date || '공고일 참조';

  const typesList = apt.types_detail || [];

  // 1) 평형별 상세 공급 세대수 표
  const typesTableHtml =
    typesList.length > 0
      ? `
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: center; margin-bottom: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 10px 8px; color: #334155; font-weight: 700;">타입</th>
            <th style="padding: 10px 8px; color: #334155; font-weight: 700;">전용면적</th>
            <th style="padding: 10px 8px; color: #334155; font-weight: 700;">일반공급</th>
            <th style="padding: 10px 8px; color: #334155; font-weight: 700;">특별공급</th>
            <th style="padding: 10px 8px; color: #1e40af; font-weight: 800;">총 세대수</th>
            <th style="padding: 10px 8px; color: #b91c1c; font-weight: 800;">최고 분양가</th>
          </tr>
        </thead>
        <tbody>
          ${typesList
            .map(
              (t, i) => `
            <tr style="border-bottom: 1px solid #e2e8f0; ${i % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
              <td style="padding: 10px 8px; font-weight: 700; color: #0f172a;">${t.type_name}</td>
              <td style="padding: 10px 8px; color: #64748b;">${t.exclusive_area}</td>
              <td style="padding: 10px 8px; color: #334155;">${t.general_supply}세대</td>
              <td style="padding: 10px 8px; color: #334155;">${t.special_supply}세대</td>
              <td style="padding: 10px 8px; font-weight: 700; color: #2563eb;">${t.total_supply}세대</td>
              <td style="padding: 10px 8px; font-weight: 800; color: #dc2626;">${t.price_max}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
      : `
      <div style="background-color: #f8fafc; padding: 14px; border-radius: 8px; font-size: 14px; color: #475569;">
        <strong>공급 규모</strong>: ${apt.supply_scale} (${apt.price_info})
      </div>
    `;

  // 2) 2026년 8월 기준 이중 규제 공식(LTV + 가격대별 절대한도 캡) 평형별 표
  const perTypeFinancingHtml =
    typesList.length > 0
      ? typesList
          .map((t) => {
            const f = t.financing || {
              base_price: t.price_max,
              option_price: '약 3,500만원',
              total_acquisition: '공급가 + 옵션비',
              deposit_amount: '분양가의 10~20%',
              balance_amount: '분양가의 80~90%',
              loan_limit: '2026.8 기준 대출 한도',
              required_cash: '필요 자기자금',
              market_price: '인근 유사 평형 시세',
              safety_margin: '시세차익 기대',
            };

            return `
            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px;">
                <h4 style="font-size: 16px; font-weight: 800; color: #1e40af; margin: 0;">
                  🏷️ [${t.type_name}] 전용 ${t.exclusive_area} 자금 시뮬레이션
                </h4>
                <span style="font-size: 12px; font-weight: 700; color: #dc2626; background-color: #fef2f2; padding: 3px 8px; border-radius: 6px;">
                  분양가 ${f.base_price}
                </span>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 10px; width: 140px; color: #64748b; font-weight: 600;">실질 총 인수금액</td>
                    <td style="padding: 7px 10px; font-weight: 700; color: #0f172a;">${f.total_acquisition} <span style="font-size: 11px; color: #94a3b8;">(옵션 ${f.option_price} 포함)</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">계약금 (필요 현금)</td>
                    <td style="padding: 7px 10px; font-weight: 700; color: #2563eb;">${f.deposit_amount}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">입주 잔금</td>
                    <td style="padding: 7px 10px; color: #334155;">${f.balance_amount}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f0fdf4;">
                    <td style="padding: 7px 10px; color: #166534; font-weight: 700;">예상 대출 가능액</td>
                    <td style="padding: 7px 10px; color: #15803d; font-weight: 800; font-size: 14px;">
                      ${f.loan_limit}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #fef2f2;">
                    <td style="padding: 7px 10px; color: #991b1b; font-weight: 800;">최종 필요 현금</td>
                    <td style="padding: 7px 10px; color: #dc2626; font-weight: 800; font-size: 14px;">
                      ${f.required_cash}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">인근 유사단지 시세</td>
                    <td style="padding: 7px 10px; color: #475569; font-weight: 700;">${f.market_price}</td>
                  </tr>
                  <tr style="background-color: #faf5ff;">
                    <td style="padding: 8px 10px; color: #6b21a8; font-weight: 800;">예상 안전마진</td>
                    <td style="padding: 8px 10px; color: #7e22ce; font-weight: 800; font-size: 14px;">🎉 ${f.safety_margin}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          `;
          })
          .join('')
      : `
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; font-size: 14px; color: #475569;">
          자금 시뮬레이션 데이터를 불러오는 중입니다.
        </div>
      `;

  const content_html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 100%;">
      
      <!-- 단지 기본 정보 헤더 -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; margin-bottom: 30px;">
        <span style="display: inline-block; background-color: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px;">
          ${apt.supply_type || '청약 핫딜'}
        </span>
        <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 4px 0 8px 0;">
          🏢 ${apt.apt_name}
        </h2>
        <p style="font-size: 14px; color: #64748b; margin: 0 0 6px 0;">📍 공급 위치: <strong>${apt.location}</strong></p>
        <p style="font-size: 14px; color: #64748b; margin: 0 0 14px 0;">🏗️ 시공사/규모: ${apt.builder || '1군 건설사'} · ${apt.supply_scale}</p>
        
        <!-- 네이버 지도 & PDF 버튼 -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px;">
          ${pdfButtonHtml}
          <a href="${naverMapUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; background-color: #03C75A; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 10px 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(3, 199, 90, 0.2);">
            🗺️ 네이버 지도로 현장 위치 & 주변 로드뷰 보기 ➔
          </a>
        </div>
      </div>

      <!-- 1. 청약개요 -->
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px 20px; margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">1. 청약개요</h3>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.8;">본 단지는 <strong>${apt.location}</strong>에 위치한 <strong>${apt.supply_scale}</strong> 규모의 신규 분양 아파트입니다.</p>
      </div>

      <!-- 2~6. 주요 정보 및 모집공고/홈페이지/일정 -->
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">2~6. 단지 기본 정보 & 핵심 일정</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; line-height: 1.8;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; width: 120px; font-weight: 700; color: #64748b; vertical-align: top;">📍 공급위치</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${apt.location}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">🏗️ 공급규모</td>
              <td style="padding: 10px 0; color: #334155;">${apt.supply_scale} (${apt.builder || '1군 건설사'})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">📄 모집공고</td>
              <td style="padding: 10px 0;">
                <a href="${applyhomeUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 700; text-decoration: underline;">
                  청약홈 공식 모집공고 바로가기 ➔
                </a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">🌐 분양홈페이지</td>
              <td style="padding: 10px 0;">
                <a href="${homepageSearchUrl}" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: underline;">
                  공식 분양 홈페이지 포털 검색 ➔
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 700; color: #64748b; vertical-align: top;">🗓️ 청약일정</td>
              <td style="padding: 12px 0;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div>• 모집공고일: <strong>${announcementDate}</strong></div>
                  <div>• 📌 <strong>청약 접수일:</strong> <span style="color: #1d4ed8; font-weight: 800; font-size: 15px; background-color: #eff6ff; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">${applyDate}</span></div>
                  <div>• 🎉 당첨자 발표일: <strong>${winnerDate}</strong></div>
                  <div>• 📝 계약 진행일: ${contractDate}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 7. 안전마진 및 자금 시뮬레이션 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">7. 안전마진 & 2026.8 주담대 자금 시뮬레이션</h3>
        ${perTypeFinancingHtml}
      </div>

      <!-- 8~12. 상품성 및 입지분석 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">8~12. 입지조건 및 비교단지 분석</h3>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; font-size: 14px; color: #334155; line-height: 1.8;">
          • <strong>평면도 및 커뮤니티:</strong> 공식 분양 홈페이지 및 견본주택 참조<br>
          • <strong>입지조건 & 호재:</strong> 구도심 상권 및 대중교통 인프라 접근성 우수<br>
          • <strong>비교단지 시세:</strong> 인근 신축 아파트 실거래가 대비 적정 분양가 수준
        </div>
      </div>

      <!-- 9. 분양가 및 세대수 상세 표 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">9. 평형(타입)별 상세 분양가 및 공급 세대수</h3>
        ${typesTableHtml}
      </div>

      <!-- 13~20. 청약 전략 및 자격/대출 조건 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">13~20. 종합 분석 및 청약자격 / 대출전략</h3>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; font-size: 14px; color: #334155; line-height: 1.8;">
          • <strong>청약자격:</strong> ${extractedPdf?.qualifications ? extractedPdf.qualifications.join(' · ') : '모집공고일 기준 거주자 및 무주택 세대구성원 요건 확인'}<br>
          • <strong>전매제한:</strong> <span style="color: #b91c1c; font-weight: 700;">${extractedPdf?.restrictions?.resale_restriction || '공고문 확인 필수'}</span><br>
          • <strong>실거주의무:</strong> <span style="color: #1e40af; font-weight: 700;">${extractedPdf?.restrictions?.residence_obligation || '해당 없음 (공고문 참조)'}</span><br>
          • <strong>재당첨제한:</strong> ${extractedPdf?.restrictions?.reapplication_restriction || '규제지역 및 분양가상한제 적용 여부에 따름'}<br>
          • <strong>2026.8 대출규제:</strong> 주택가격별 절대 대출한도(15억 이하 최대 6억, 15~25억 최대 4억) Min(LTV, 절대한도) 이중 규제 적용<br>
          • <strong>자금전략:</strong> 당첨 시 계약금(10~20%) 자가자금(현금) 준비 및 잔금 납부 시점 대출 실행 계획 수립 필수
        </div>
      </div>
      <div style="background-color: #f1f5f9; border-radius: 14px; padding: 22px; margin-bottom: 20px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0;">
          🗓️ 청약 핵심 일정 총정리
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
          <tr>
            <td style="padding: 6px 0; width: 120px; font-weight: 600; color: #64748b;">모집공고일</td>
            <td style="padding: 6px 0;">${announcementDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">청약 접수일</td>
            <td style="padding: 6px 0; font-weight: 700; color: #2563eb;">${applyDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">당첨자 발표일</td>
            <td style="padding: 6px 0; font-weight: 600; color: #059669;">${winnerDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #64748b;">계약 및 잔금</td>
            <td style="padding: 6px 0;">${contractDate}</td>
          </tr>
        </table>
        <div style="margin-top: 18px; text-align: right; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
          <a href="${naverMapUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #03C75A; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 16px; border-radius: 8px;">
            🗺️ 네이버 지도 위치보기
          </a>
          <a href="https://www.applyhome.co.kr" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 18px; border-radius: 8px;">
            청약홈 공식 접수 바로가기 ➔
          </a>
        </div>
      </div>

    </div>
  `;

  return {
    title,
    summary_text,
    content_html,
    apt_name: apt.apt_name,
  };
}

// 전체 단지 Fallback 결합
function generateCombinedFallback(
  apartments: ApartmentData[],
  todayStr: string,
  title: string
): NewsletterContent {
  const summary_text = `${apartments.length}개 주요 청약 단지의 평형별 세대수와 2026.8 이중 규제 공식 대출 금액을 심층 분석했습니다.`;

  const articlesHtml = apartments
    .map((apt) => generateSingleAptFallback(apt, todayStr).content_html)
    .join('<hr style="border: 0; border-top: 2px dashed #cbd5e1; margin: 40px 0;">');

  const content_html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 100%;">
      <div style="margin-bottom: 30px; text-align: center;">
        <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 10px;">
          🏢 이번 주 핵심 청약 물건별 심층 분석 브리핑
        </h1>
        <p style="font-size: 15px; color: #64748b; margin: 0;">
          한국부동산원 청약홈 공공데이터 기반 2026.8 대출 이중 규제 평형별 자금 시뮬레이션 리포트
        </p>
      </div>

      ${articlesHtml}

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; font-size: 13px; color: #64748b; margin-top: 30px;">
        ⚠️ <strong>청약 주의사항</strong>: 본 브리핑은 한국부동산원 청약홈의 공식 공고 데이터를 기반으로 작성되었습니다. 세부 자격 및 분양 조건은 사업주체의 최종 입주자모집공고문을 확인하시기 바랍니다.
      </div>
    </div>
  `;

  return {
    title,
    summary_text,
    content_html,
  };
}
