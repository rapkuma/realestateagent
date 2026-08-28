import { TypeDetail, FinancingDetail } from './applyhome';

export interface ExtractedPdfData {
  types_detail: TypeDetail[];
  restrictions: {
    resale_restriction: string;
    residence_obligation: string;
    reapplication_restriction: string;
  };
  qualifications: string[];
}

function parseKoreanWon(valStr: string): number {
  if (!valStr) return 0;
  const clean = valStr.replace(/,/g, '').replace(/원/g, '').trim();
  const n = parseInt(clean, 10);
  return isNaN(n) ? 0 : n;
}

function formatKoreanWon(num: number): string {
  if (!num || isNaN(num)) return '공고문 참조';
  const eok = Math.floor(num / 100000000);
  const man = Math.floor((num % 100000000) / 10000);
  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${man.toLocaleString()}만원`;
}

function calculate2026Financing(priceNum: number, location: string = '비규제'): FinancingDetail {
  const isRegulated = location.includes('강남') || location.includes('서초') || location.includes('송파') || location.includes('용산');
  const ltvRate = isRegulated ? 0.4 : 0.7;

  // 2026.8 절대 한도 캡 (15억 이하 6억, 15~25억 4억, 25억 초과 2억)
  let absCap = 600000000;
  if (priceNum > 2500000000) {
    absCap = 200000000;
  } else if (priceNum > 1500000000) {
    absCap = 400000000;
  }

  const ltvAmount = Math.floor(priceNum * ltvRate);
  const maxLoan = Math.min(ltvAmount, absCap);
  const deposit = Math.floor(priceNum * 0.1); // 계약금 10%
  const balance = priceNum - deposit;
  const optionEst = Math.min(Math.floor(priceNum * 0.05), 35000000); // 약 3,500만 또는 5%
  const totalAcquisition = priceNum + optionEst;
  const reqCash = totalAcquisition - maxLoan;
  const estMarketPrice = Math.floor(priceNum * 1.15); // 약 15% 시세차익 추정
  const safetyMargin = estMarketPrice - priceNum;

  return {
    base_price: formatKoreanWon(priceNum),
    option_price: formatKoreanWon(optionEst),
    total_acquisition: formatKoreanWon(totalAcquisition),
    deposit_amount: formatKoreanWon(deposit),
    balance_amount: formatKoreanWon(balance),
    loan_limit: formatKoreanWon(maxLoan) + ` (${isRegulated ? '투기과열 40%' : '비규제 70%'} & 2026.8 절대캡 적용)`,
    required_cash: formatKoreanWon(reqCash) + ' (최소 자기자금)',
    market_price: formatKoreanWon(estMarketPrice) + ' (인근 유사 신축 시세)',
    safety_margin: formatKoreanWon(safetyMargin) + ' 예상 프리미엄',
  };
}

export function extractDataFromPdfText(pdfText: string, location: string = ''): ExtractedPdfData {
  const result: ExtractedPdfData = {
    types_detail: [],
    restrictions: {
      resale_restriction: '최초 입주자모집공고일 또는 당첨자발표일로부터 1년~3년 (공고문 참조)',
      residence_obligation: '해당 없음 (또는 공고문 참조)',
      reapplication_restriction: '과거 당첨 이력 및 규제지역 여부에 따라 제한 (공고문 참조)',
    },
    qualifications: [
      '입주자모집공고일 현재 해당 주택건설지역에 거주하는 성년자',
      '무주택세대구성원 요건 (무순위 줍줍은 공고별 상이)',
      '청약통장 가입 및 예치금 충족 요건 공고문 최종 확인 필수'
    ]
  };

  if (!pdfText) return result;

  // 1. 전매제한 추출
  const resaleMatch = pdfText.match(/(?:전매제한|전매\s*제한)[\s\S]{0,100}?(최초[\s\S]{0,50}?(?:발표일|공고일)[\s\S]{0,50}?\d+년|소유권이전등기일|\d+년|없음)/i);
  if (resaleMatch) {
    result.restrictions.resale_restriction = resaleMatch[1].replace(/\s+/g, ' ').trim();
  }

  // 2. 거주의무 추출
  const liveMatch = pdfText.match(/(?:거주의무|실거주의무)[\s\S]{0,100}?(\d+년|없음|해당\s*없음)/i);
  if (liveMatch) {
    result.restrictions.residence_obligation = liveMatch[1].replace(/\s+/g, ' ').trim();
  }

  // 3. 재당첨제한 추출
  const reappMatch = pdfText.match(/(?:재당첨제한|재당첨\s*제한)[\s\S]{0,100}?(\d+년|없음|해당\s*없음|투기과열지구[\s\S]{0,30}?\d+년)/i);
  if (reappMatch) {
    result.restrictions.reapplication_restriction = reappMatch[1].replace(/\s+/g, ' ').trim();
  }

  // 4. 공식 약식표기 주택형 (39A, 59A, 59B, 84A, 84B, 84C, 101A, 24E, 25C, 42A, 42B, 42C 등) 탐색
  const foundTypeKeys = new Set<string>();
  const letterTypes = pdfText.match(/([1-9]\d{1,2}[A-Z])/g);

  if (letterTypes) {
    for (const t of letterTypes) {
      const num = parseInt(t, 10);
      if (num >= 20 && num <= 180 && t.length <= 4) {
        foundTypeKeys.add(t);
      }
    }
  }

  // 만약 영문 타입이 없다면 숫자+타입/형 패턴 탐색
  if (foundTypeKeys.size === 0) {
    const numTypes = pdfText.match(/([1-9]\d{1,2})(?=[타입형])/g);
    if (numTypes) {
      for (const t of numTypes) {
        const num = parseInt(t, 10);
        if (num >= 20 && num <= 180) {
          foundTypeKeys.add(t);
        }
      }
    }
  }

  // 각 타입별 가격 매핑
  const typeMap = new Map<string, { type_name: string; area: string; supply: number; prices: number[] }>();
  const lines = pdfText.split('\n');
  let currentActiveType: string | null = foundTypeKeys.size === 1 ? Array.from(foundTypeKeys)[0] : null;

  for (const line of lines) {
    // 라인에 특정 타입명이 명시된 경우
    for (const tKey of foundTypeKeys) {
      if (line.includes(tKey)) {
        currentActiveType = tKey;
        break;
      }
    }

    // 금액 매칭: 콤마 포함 금액 (예: 695,600,000)
    const priceMatches = line.match(/([1-9]\d{1,2}(?:,\d{3}){2,3})/g);
    if (currentActiveType && foundTypeKeys.has(currentActiveType) && priceMatches && priceMatches.length > 0) {
      const validPrices = priceMatches.map(parseKoreanWon).filter(p => p >= 50000000 && p <= 5000000000);
      if (validPrices.length > 0) {
        const maxPriceInLine = Math.max(...validPrices);
        const areaStr = `${currentActiveType.replace(/[A-Z]/g, '')}㎡`;

        if (!typeMap.has(currentActiveType)) {
          typeMap.set(currentActiveType, {
            type_name: currentActiveType,
            area: areaStr,
            supply: 1,
            prices: [maxPriceInLine]
          });
        } else {
          const entry = typeMap.get(currentActiveType)!;
          entry.prices.push(maxPriceInLine);
          entry.supply += 1;
        }
      }
    }
  }

  // TypeDetail 목록으로 변환
  const typesDetail: TypeDetail[] = [];
  for (const [tKey, data] of typeMap.entries()) {
    const maxP = Math.max(...data.prices);
    const minP = Math.min(...data.prices);
    const financing = calculate2026Financing(maxP, location);

    typesDetail.push({
      type_name: `${tKey} 타입`,
      exclusive_area: data.area,
      general_supply: data.supply,
      special_supply: 0,
      total_supply: data.supply,
      price_max: formatKoreanWon(maxP),
      price_min: formatKoreanWon(minP),
      financing: financing
    });
  }

  if (typesDetail.length > 0) {
    result.types_detail = typesDetail.sort((a, b) => {
      const numA = parseFloat(a.exclusive_area) || 0;
      const numB = parseFloat(b.exclusive_area) || 0;
      return numA - numB;
    });
  }

  return result;
}
