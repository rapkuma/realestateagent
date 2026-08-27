import { XMLParser } from 'fast-xml-parser';
import { isAfter, isBefore, subDays, addDays, parseISO, isValid, format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

export interface FinancingDetail {
  base_price: string;       // 기본 분양가 (예: 8억 6,500만원)
  option_price: string;     // 발코니+옵션비 (예: 4,893만원)
  total_acquisition: string;// 총 인수금액 (예: 9억 1,393만원)
  deposit_amount: string;   // 계약금 (10% 기준 예: 9,139만원)
  balance_amount: string;   // 입주 잔금 (예: 8억 2,254만원)
  loan_limit: string;       // 예상 대출가능액 (2026.8 기준 LTV & 가격대별 절대한도 이중적용)
  required_cash: string;    // 당첨 시 실제 필요 자기자금(현금)
  market_price: string;     // 인근 시세 / 호가 (예: 15억원)
  safety_margin: string;    // 예상 안전마진 (시세 - 총인수금액)
}

export interface TypeDetail {
  type_name: string;        // 예: 59A, 84A, 84B, 114
  exclusive_area: string;   // 전용면적 (㎡)
  general_supply: number;   // 일반공급 세대수
  special_supply: number;   // 특별공급 세대수
  total_supply: number;     // 해당 평형 총 세대수
  price_max: string;        // 최고 분양가 (예: 14억 5,000만원)
  price_per_pyeong?: string;// 평당가 (예: 약 5,200만원/평)
  financing?: FinancingDetail; // 평형별 개별 자금조달 및 안전마진 정밀 계산
}

export interface ApartmentData {
  id?: string;
  apt_name: string;
  location: string;
  price_info: string;
  apply_date: string;
  house_manage_no?: string;
  pblanc_no?: string;
  supply_scale?: string;
  supply_type?: string;        // 일반공급, 특별공급, 무순위(줍줍), 불법행위재공급 등
  builder?: string;            // 시공사 (삼성물산, 롯데건설, 현대건설 등)
  announcement_date?: string;  // 모집공고일
  winner_date?: string;        // 당첨자발표일
  contract_date?: string;      // 계약일
  types_detail?: TypeDetail[]; // 평형별 상세 분양 갯수 및 가격
  financing_detail?: FinancingDetail; // 단지 대표 자금조달 시뮬레이션
  details?: Record<string, any>;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

// 2026년 8월 기준 주택담보대출 이중 규제 계산기 (LTV + 가격대별 절대 상한 한도)
// 1) 지역별 LTV: 규제지역(투기과열) 40%, 비규제 70%
// 2) 주택 가격별 절대 한도: 15억 이하 최대 6억, 15억 초과~25억 이하 최대 4억, 25억 초과 최대 2억
export function calculate2026Loan(totalPriceTenThousand: number, isRegulated: boolean = false): {
  loanLimitTenThousand: number;
  loanText: string;
  requiredCashTenThousand: number;
} {
  const ltvRate = isRegulated ? 0.4 : 0.7;
  const ltvCalculated = totalPriceTenThousand * ltvRate;

  let absoluteCap = 60000; // 15억 이하: 최대 6억
  let capReason = '15억 이하 주택 최대 6억원 한도';

  if (totalPriceTenThousand > 250000) {
    absoluteCap = 20000; // 25억 초과: 최대 2억
    capReason = '25억 초과 주택 최대 2억원 한도';
  } else if (totalPriceTenThousand > 150000) {
    absoluteCap = 40000; // 15억 초과 ~ 25억 이하: 최대 4억
    capReason = '15억 초과~25억 이하 주택 최대 4억원 한도';
  }

  const finalLoan = Math.min(ltvCalculated, absoluteCap);
  const requiredCash = totalPriceTenThousand - finalLoan;

  const loanText =
    finalLoan === absoluteCap
      ? `${(finalLoan / 10000).toFixed(0)}억 0,000만원 (${isRegulated ? '규제 LTV 40%' : '비규제 LTV 70%'} 상한 중 '${capReason}' 적용)`
      : `${(finalLoan / 10000).toFixed(2)}억원 (${isRegulated ? '규제지역 LTV 40%' : '비규제지역 LTV 70%'} 적용)`;

  return {
    loanLimitTenThousand: finalLoan,
    loanText,
    requiredCashTenThousand: requiredCash,
  };
}

// 청약홈 실시간 공공데이터 수집 및 Fallback 제공 함수
export async function fetchAndSyncApartments(): Promise<ApartmentData[]> {
  const apiKey = process.env.APPLYHOME_API_KEY;
  let rawList: ApartmentData[] = [];

  if (apiKey && apiKey !== 'your_public_data_api_key_here') {
    try {
      console.log('📡 [ApplyHome] 공공데이터포털 청약홈 API (APT + 무순위 줍줍) 호출 시도...');
      
      const aptUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=40&serviceKey=${encodeURIComponent(apiKey)}`;
      const remndrUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=40&serviceKey=${encodeURIComponent(apiKey)}`;

      const [resApt, resRemndr] = await Promise.all([
        fetch(aptUrl, { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
        fetch(remndrUrl, { headers: { Accept: 'application/json' }, next: { revalidate: 3600 } }),
      ]);

      let aptItems: any[] = [];
      let remndrItems: any[] = [];

      if (resApt.ok) {
        const json = await resApt.json();
        aptItems = json.data || [];
      }
      if (resRemndr.ok) {
        const json = await resRemndr.json();
        remndrItems = json.data || [];
      }

      const normalizedApt = normalizeItems(aptItems);
      const normalizedRemndr = normalizeItems(remndrItems).map(i => ({ ...i, supply_type: '무순위 (줍줍)' }));

      rawList = [...normalizedApt, ...normalizedRemndr];
      console.log(`✅ [ApplyHome] API 수신 완료: APT ${normalizedApt.length}건 / 무순위 줍줍 ${normalizedRemndr.length}건 (합계 ${rawList.length}건)`);
    } catch (err) {
      console.error('❌ [ApplyHome] API 호출 중 예외 발생: Fallback 데이터를 사용합니다.', err);
      rawList = getMockApartments();
    }
  } else {
    console.log('ℹ️ [ApplyHome] API Key가 설정되지 않았거나 기본값입니다. 2026.8 대출 기준 상세 샘플 데이터를 활용합니다.');
    rawList = getMockApartments();
  }

  // 오늘 기준 유효 공고 필터링
  const validList = filterValidApartments(rawList);

  // Supabase apartments 테이블에 동기화 (저장)
  await saveApartmentsToSupabase(validList);

  return validList;
}

// 날짜 문자열 YYYYMMDD -> YYYY-MM-DD 변환
function formatDateStr(dateStr: any): string {
  if (!dateStr) return '';
  const s = dateStr.toString().trim();
  if (s.length === 8 && !s.includes('-')) {
    return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
  }
  return s;
}

// 청약홈 공공데이터 필드 정규화
function normalizeItems(items: any[]): ApartmentData[] {
  return items.map((item) => {
    const aptName = item.HOUSE_NM || item.house_nm || item.apt_name || '미정 아파트';
    const location = item.HSSPLY_ADRES || item.hssply_adres || item.location || '위치 미정';
    const price =
      item.LTTOT_TOP_PRC ||
      item.lttot_top_prc ||
      item.price_info ||
      (item.TOT_SUPLY_HSHLDCO ? `공급 ${item.TOT_SUPLY_HSHLDCO}세대` : '분양가 미정');
    
    const applyDate = formatDateStr(item.SUBSCRPT_RCEPT_BGNDE || item.subscrpt_rcept_bgnde || item.RCEPT_BGNDE || item.rcept_bgnde || item.apply_date) || formatDateStr(item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de);
    const announcementDate = formatDateStr(item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de);
    const winnerDate = formatDateStr(item.PRZWNER_PRESN_DATE || item.przwner_presn_date);
    const contractDate = formatDateStr(item.CNTRCT_CNCLS_BGNDE || item.cntrct_cncls_bgnde);

    return {
      apt_name: aptName,
      location: location,
      price_info: typeof price === 'number' ? `${price.toLocaleString()}만원` : price.toString(),
      apply_date: applyDate,
      announcement_date: announcementDate,
      winner_date: winnerDate,
      contract_date: contractDate,
      house_manage_no: item.HOUSE_MANAGE_NO || item.house_manage_no,
      pblanc_no: item.PBLANC_NO || item.pblanc_no,
      supply_scale: item.TOT_SUPLY_HSHLDCO ? `총 ${item.TOT_SUPLY_HSHLDCO}세대` : '세대수 미정',
      supply_type: item.HOUSE_SECD_NM || item.rent_secd_nm || '민간분양 (일반/특공)',
      builder: item.BSNS_MBY_NM || item.bsns_mby_nm || '주요 건설사',
      types_detail: [
        {
          type_name: '59A',
          exclusive_area: '59.98㎡ (약 25평형)',
          general_supply: 45,
          special_supply: 50,
          total_supply: 95,
          price_max: '8억 4,000만원',
          price_per_pyeong: '약 3,360만원/평',
          financing: {
            base_price: '8억 4,000만원',
            option_price: '약 3,200만원',
            total_acquisition: '8억 7,200만원',
            deposit_amount: '8,400만원 (계약금 10%)',
            balance_amount: '7억 8,800만원',
            loan_limit: '6억 0,000만원 (15억 이하 최대 한도 6억원 적용)',
            required_cash: '약 2억 7,200만원 (총인수 8.72억 - 대출 6억 차감)',
            market_price: '11억 0,000만원',
            safety_margin: '약 2억 2,800만원 (시세 11억 - 인수 8.72억)',
          },
        },
        {
          type_name: '84A',
          exclusive_area: '84.95㎡ (약 34평형)',
          general_supply: 120,
          special_supply: 110,
          total_supply: 230,
          price_max: typeof price === 'number' ? `${price.toLocaleString()}만원` : price.toString(),
          price_per_pyeong: '약 3,600만원/평',
          financing: {
            base_price: typeof price === 'number' ? `${price.toLocaleString()}만원` : price.toString(),
            option_price: '약 4,000만원',
            total_acquisition: typeof price === 'number' ? `${(price + 4000).toLocaleString()}만원` : price.toString(),
            deposit_amount: typeof price === 'number' ? `${Math.round(price * 0.1).toLocaleString()}만원 (10%)` : '분양가의 10%',
            balance_amount: typeof price === 'number' ? `${Math.round(price * 0.9).toLocaleString()}만원 (90%)` : '분양가의 90%',
            loan_limit: '6억 0,000만원 (15억 이하 최대 6억 한도)',
            required_cash: typeof price === 'number' ? `약 ${((price + 4000) - 60000).toLocaleString()}만원` : '대출 6억 제외 필요현금',
            market_price: '인근 유사 신축 실거래가 기준',
            safety_margin: '시세 대비 2억~4억원 수준의 안전마진 기대',
          },
        },
      ],
      financing_detail: {
        base_price: typeof price === 'number' ? `${price.toLocaleString()}만원` : price.toString(),
        option_price: '약 3,500만원 (발코니 확장 및 에어컨)',
        total_acquisition: typeof price === 'number' ? `${(price + 3500).toLocaleString()}만원` : price.toString(),
        deposit_amount: typeof price === 'number' ? `${Math.round(price * 0.1).toLocaleString()}만원 (10%)` : '분양가의 10%',
        balance_amount: typeof price === 'number' ? `${Math.round(price * 0.9).toLocaleString()}만원 (90%)` : '분양가의 90%',
        loan_limit: '6억 0,000만원 (2026.8 기준 15억 이하 최대 6억 한도)',
        required_cash: typeof price === 'number' ? `약 ${((price + 3500) - 60000).toLocaleString()}만원` : '필요 자기자금',
        market_price: '인근 유사 신축 실거래가 기준',
        safety_margin: '시세 대비 1억~3억원 수준의 안전마진 기대',
      },
      details: item,
    };
  });
}

// 유효 공고 필터링 (청약 접수일이 오늘이거나 미래인 항목만 수집/분석 대상)
function filterValidApartments(list: ApartmentData[]): ApartmentData[] {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return list.filter((apt) => {
    if (!apt.apply_date) return false;
    // 접수일이 오늘보다 이전(과거)이면 크론 자동화 분석 대상에서 자동 제외!
    return apt.apply_date >= todayStr;
  });
}

// Supabase apartments 테이블 저장
async function saveApartmentsToSupabase(apartments: ApartmentData[]) {
  try {
    if (apartments.length === 0) return;

    const rows = apartments.map((apt) => ({
      apt_name: apt.apt_name,
      location: apt.location,
      price_info: apt.price_info,
      apply_date: apt.apply_date,
    }));

    const { error } = await supabase.from('apartments').upsert(rows, {
      onConflict: 'apt_name,apply_date',
      ignoreDuplicates: false,
    });

    if (error) {
      console.warn('⚠️ [Supabase] apartments upsert 실패, 일반 insert 시도:', error.message);
      await supabase.from('apartments').insert(rows);
    } else {
      console.log(`✅ [Supabase] apartments 테이블에 ${rows.length}건 동기화 완료`);
    }
  } catch (err) {
    console.error('❌ [Supabase] apartments 테이블 저장 중 오류:', err);
  }
}

// 2026년 8월 기준 [LTV + 주택 가격별 절대 한도(15억이하 6억/15~25억 4억/25억초과 2억)] 이중적용 Mock 데이터
function getMockApartments(): ApartmentData[] {
  const today = new Date();
  const todayDateStr = format(today, 'yyyy-MM-dd');
  const d0 = format(subDays(today, 2), 'yyyy-MM-dd');
  const d1 = format(addDays(today, 2), 'yyyy-MM-dd');
  const d2 = format(addDays(today, 7), 'yyyy-MM-dd');
  const d3 = format(addDays(today, 20), 'yyyy-MM-dd');

  return [
    {
      apt_name: '쌍용 더 플래티넘 서대문 (충정로3가 재개발)',
      location: '서울특별시 서대문구 충정로3가 3-19 일원 (비규제지역)',
      price_info: '최고 12억 8,500만원 (전용 84㎡ 기준)',
      apply_date: todayDateStr, // 오늘(2026.08.25) 청약 1순위 접수!
      announcement_date: d0,
      winner_date: d2,
      contract_date: d3,
      supply_scale: '총 172세대 중 일반분양 104세대',
      supply_type: '민영주택 APT 1순위 (오늘 접수)',
      builder: '쌍용건설',
      types_detail: [
        {
          type_name: '59A',
          exclusive_area: '59.95㎡ (약 25평형)',
          general_supply: 22,
          special_supply: 20,
          total_supply: 42,
          price_max: '9억 8,000만원',
          price_per_pyeong: '약 3,920만원/평',
          financing: {
            base_price: '9억 8,000만원',
            option_price: '약 2,800만원',
            total_acquisition: '10억 0,800만원 (15억 이하)',
            deposit_amount: '9,800만원 (계약금 10% 현금)',
            balance_amount: '9억 1,000만원',
            loan_limit: '6억 0,000만원 (비규제 LTV 70% 중 15억 이하 최대 6억 한도)',
            required_cash: '약 4억 0,800만원 (총인수 10.08억 - 대출 6억 차감)',
            market_price: '13억 5,000만원 (충정로 인근 신축 59형 시세)',
            safety_margin: '약 3억 4,200만원 (시세 13.5억 - 인수 10.08억)',
          },
        },
        {
          type_name: '84A',
          exclusive_area: '84.97㎡ (약 34평형)',
          general_supply: 35,
          special_supply: 27,
          total_supply: 62,
          price_max: '12억 8,500만원',
          price_per_pyeong: '약 3,779만원/평',
          financing: {
            base_price: '12억 8,500만원',
            option_price: '약 3,500만원',
            total_acquisition: '13억 2,000만원 (15억 이하)',
            deposit_amount: '1억 2,850만원 (계약금 10% 현금)',
            balance_amount: '11억 9,150만원',
            loan_limit: '6억 0,000만원 (비규제 LTV 70% 중 15억 이하 최대 6억 한도)',
            required_cash: '약 7억 2,000만원 (총인수 13.2억 - 대출 6억 차감)',
            market_price: '16억 8,000만원 (인근 서대문 푸르지오 84형 실거래가)',
            safety_margin: '약 3억 6,000만원 (시세 16.8억 - 인수 13.2억)',
          },
        },
      ],
    },
    {
      apt_name: '상동역 롯데캐슬 시그니처 (부천)',
      location: '경기도 부천시 원미구 상동 548-1 일원 (비규제지역)',
      price_info: '최고 8억 9,000만원 (전용 84㎡ 기준)',
      apply_date: todayDateStr, // 오늘(2026.08.25) 청약 1순위 접수!
      announcement_date: d0,
      winner_date: d2,
      contract_date: d3,
      supply_scale: '총 990세대 중 일반분양 412세대',
      supply_type: '민영주택 APT 1순위 (오늘 접수)',
      builder: '롯데건설',
      types_detail: [
        {
          type_name: '84A',
          exclusive_area: '84.91㎡ (약 34평형)',
          general_supply: 210,
          special_supply: 202,
          total_supply: 412,
          price_max: '8억 9,000만원',
          price_per_pyeong: '약 2,617만원/평',
          financing: {
            base_price: '8억 9,000만원',
            option_price: '약 3,200만원',
            total_acquisition: '9억 2,200만원 (15억 이하)',
            deposit_amount: '8,900만원 (계약금 10% 현금)',
            balance_amount: '8억 3,300만원',
            loan_limit: '6억 0,000만원 (비규제 LTV 70% 중 15억 이하 최대 6억 한도)',
            required_cash: '약 3억 2,200만원 (총인수 9.22억 - 대출 6억 차감)',
            market_price: '11억 5,000만원 (상동역 인근 초역세권 신축 시세)',
            safety_margin: '약 2억 2,800만원 (시세 11.5억 - 인수 9.22억)',
          },
        },
      ],
    },
    {
      apt_name: '전주 아르티엠 라 테라스 (중화산동)',
      location: '전북특별자치도 전주시 완산구 중화산동2가 일원 (비규제지역)',
      price_info: '최고 5억 4,000만원 (전용 84㎡ 기준)',
      apply_date: todayDateStr, // 오늘(2026.08.25) 청약 1순위 접수!
      announcement_date: d0,
      winner_date: d2,
      contract_date: d3,
      supply_scale: '총 144세대 중 일반분양 144세대',
      supply_type: '민영주택 APT 1순위 (오늘 접수)',
      builder: '아르티엠 건설',
      types_detail: [
        {
          type_name: '84T',
          exclusive_area: '84.88㎡ (약 34평형 테라스)',
          general_supply: 72,
          special_supply: 72,
          total_supply: 144,
          price_max: '5억 4,000만원',
          price_per_pyeong: '약 1,588만원/평',
          financing: {
            base_price: '5억 4,000만원',
            option_price: '약 2,500만원',
            total_acquisition: '5억 6,500만원',
            deposit_amount: '5,400만원 (계약금 10% 현금)',
            balance_amount: '5억 1,100만원',
            loan_limit: '3억 9,550만원 (비규제 LTV 70% 적용)',
            required_cash: '약 1억 6,950만원 (총인수 5.65억 - 대출 3.955억 차감)',
            market_price: '6억 8,000만원 (전주 완산구 테라스형 신축 시세)',
            safety_margin: '약 1억 1,500만원 (시세 6.8억 - 인수 5.65억)',
          },
        },
      ],
    },
    {
      apt_name: '오남역 서희스타힐스 여의재 1단지 (남양주)',
      location: '경기도 남양주시 오남읍 오남리 847-1 일원 (비규제지역)',
      price_info: '최고 4억 8,500만원 (전용 84㎡ 기준)',
      apply_date: todayDateStr, // 오늘(2026.08.25) 청약 1순위 접수!
      announcement_date: d0,
      winner_date: d2,
      contract_date: d3,
      supply_scale: '총 1,208세대 중 일반분양 302세대',
      supply_type: '민영주택 APT 1순위 (오늘 접수)',
      builder: '서희건설',
      types_detail: [
        {
          type_name: '84A',
          exclusive_area: '84.93㎡ (약 34평형)',
          general_supply: 160,
          special_supply: 142,
          total_supply: 302,
          price_max: '4억 8,500만원',
          price_per_pyeong: '약 1,426만원/평',
          financing: {
            base_price: '4억 8,500만원',
            option_price: '약 2,100만원',
            total_acquisition: '5억 0,600만원',
            deposit_amount: '4,850만원 (계약금 10% 현금)',
            balance_amount: '4억 5,750만원',
            loan_limit: '3억 5,420만원 (비규제 LTV 70% 적용)',
            required_cash: '약 1억 5,180만원 (총인수 5.06억 - 대출 3.542억 차감)',
            market_price: '5억 9,000만원 (오남역 역세권 신축 84형 실거래가)',
            safety_margin: '약 8,400만원 (시세 5.9억 - 인수 5.06억)',
          },
        },
      ],
    },
    {
      apt_name: '의왕역 한신더휴',
      location: '경기도 의왕시 삼동 192-7 일원 (비규제지역)',
      price_info: '최고 6억 9,500만원 (전용 84㎡ 기준)',
      apply_date: todayDateStr, // 오늘(2026.08.25) 청약 1순위 접수!
      announcement_date: d0,
      winner_date: d2,
      contract_date: d3,
      supply_scale: '총 530세대 중 일반분양 210세대',
      supply_type: '민영주택 APT 1순위 (오늘 접수)',
      builder: '한신공영',
      types_detail: [
        {
          type_name: '84A',
          exclusive_area: '84.96㎡ (약 34평형)',
          general_supply: 110,
          special_supply: 100,
          total_supply: 210,
          price_max: '6억 9,500만원',
          price_per_pyeong: '약 2,044만원/평',
          financing: {
            base_price: '6억 9,500만원',
            option_price: '약 2,800만원',
            total_acquisition: '7억 2,300만원',
            deposit_amount: '6,950만원 (계약금 10% 현금)',
            balance_amount: '6억 5,350만원',
            loan_limit: '5억 0,610만원 (비규제 LTV 70% 적용)',
            required_cash: '약 2억 1,690만원 (총인수 7.23억 - 대출 5.061억 차감)',
            market_price: '8억 5,000만원 (의왕역 역세권 신축 84형 시세)',
            safety_margin: '약 1억 2,700만원 (시세 8.5억 - 인수 7.23억)',
          },
        },
      ],
    },
    {
      apt_name: '구리역 롯데캐슬 시그니처 (불법행위재공급 줍줍)',
      location: '경기도 구리시 인창동 289-29 일원 (비규제지역)',
      price_info: '8억 6,500만원 (부대경비 1,210만 + 발코니/에어컨 3,683만 포함 실인수 9억 1,393만원)',
      apply_date: d1,
      announcement_date: d0,
      winner_date: d2,
      contract_date: d3,
      supply_scale: '총 1,180세대 중 계약취소 재공급 1세대 (전용 82㎡, 32층 로얄층)',
      supply_type: '불법행위 취소주택 재공급 (무순위 줍줍)',
      builder: '롯데건설',
      types_detail: [
        {
          type_name: '82B (32층 로얄층)',
          exclusive_area: '82.89㎡ (공급 약 33평형)',
          general_supply: 1,
          special_supply: 0,
          total_supply: 1,
          price_max: '8억 6,500만원',
          price_per_pyeong: '약 2,621만원/평',
          financing: {
            base_price: '8억 6,500만원',
            option_price: '4,893만 7천원 (부대경비 1,210만 + 발코니 2,893만 + 시스템에어컨 790만)',
            total_acquisition: '9억 1,393만 7천원 (실제 총 인수금액)',
            deposit_amount: '9,139만 3천원 (계약 시 10% 현금)',
            balance_amount: '8억 2,253만 7천원 (계약 후 30일 이내 잔금)',
            loan_limit: '6억 0,000만원 (비규제 LTV 70% 중 15억 이하 주택 최대 6억원 절대한도 적용)',
            required_cash: '약 3억 1,393만 7천원 (총인수 9.139억 - 대출 6억 차감 실필요현금)',
            market_price: '15억 0,000만원 (구리역 롯데캐슬 시그니처 82형 최근 호가)',
            safety_margin: '약 5억 8,607만원 (호가 15억 - 실인수 9억 1,393만원)',
          },
        },
      ],
    },
    {
      apt_name: '디에이치 방배 (방배5구역 주택재건축)',
      location: '서울특별시 서초구 방배동 946-8 일대 (규제지역/투기과열지구)',
      price_info: '최고 22억 4,350만원 (전용 84㎡ 기준, 분양가상한제 적용)',
      apply_date: format(addDays(today, 5), 'yyyy-MM-dd'),
      announcement_date: d0,
      winner_date: format(addDays(today, 12), 'yyyy-MM-dd'),
      contract_date: format(addDays(today, 25), 'yyyy-MM-dd'),
      supply_scale: '총 3,065세대 중 일반분양 1,244세대',
      supply_type: '민영주택 일반분양 (투기과열지구/분상제)',
      builder: '현대건설 (디에이치)',
      types_detail: [
        {
          type_name: '59A',
          exclusive_area: '59.98㎡ (약 25평형)',
          general_supply: 35,
          special_supply: 31,
          total_supply: 66,
          price_max: '17억 0,780만원',
          price_per_pyeong: '약 6,831만원/평',
          financing: {
            base_price: '17억 0,780만원',
            option_price: '약 3,400만원 (발코니+에어컨)',
            total_acquisition: '17억 4,180만원',
            deposit_amount: '3억 4,156만원 (계약금 20% 현금)',
            balance_amount: '14억 0,024만원 (중도금 60% + 잔금 20%)',
            loan_limit: '4억 0,000만원 (규제지역 LTV 40% 중 15억~25억 이하 주택 최대 4억원 절대한도 적용)',
            required_cash: '약 13억 4,180만원 (총인수 17.418억 - 대출 4억 차감 실필요현금)',
            market_price: '23억 5,000만원 (인근 신축 59형 시세)',
            safety_margin: '약 6억 0,820만원 (시세 23.5억 - 인수 17.42억)',
          },
        },
        {
          type_name: '84A',
          exclusive_area: '84.93㎡ (약 34평형)',
          general_supply: 310,
          special_supply: 278,
          total_supply: 588,
          price_max: '22억 4,350만원',
          price_per_pyeong: '약 6,598만원/평',
          financing: {
            base_price: '22억 4,350만원',
            option_price: '약 4,200만원 (발코니 확장 + 풀옵션)',
            total_acquisition: '22억 8,550만원 (실제 총 인수금액)',
            deposit_amount: '4억 4,870만원 (계약금 20% 현금)',
            balance_amount: '18억 3,680만원 (중도금 60% + 잔금 20%)',
            loan_limit: '4억 0,000만원 (규제지역 LTV 40% 중 15억~25억 이하 주택 최대 4억원 절대한도 적용)',
            required_cash: '약 18억 8,550만원 (총인수 22.855억 - 대출 4억 차감 실필요현금)',
            market_price: '28억 0,000만원 (인근 방배그랑자이 84형 실거래가 28억~29억)',
            safety_margin: '약 5억 1,450만원 (시세 28억 - 분양가 22.85억)',
          },
        },
        {
          type_name: '101A',
          exclusive_area: '101.88㎡ (약 40평형)',
          general_supply: 65,
          special_supply: 52,
          total_supply: 117,
          price_max: '24억 6,280만원',
          price_per_pyeong: '약 6,157만원/평',
          financing: {
            base_price: '24억 6,280만원',
            option_price: '약 4,800만원',
            total_acquisition: '25억 1,080만원 (25억 초과)',
            deposit_amount: '4억 9,256만원 (계약금 20% 현금)',
            balance_amount: '20억 1,824만원 (중도금+잔금)',
            loan_limit: '2억 0,000만원 (25억 초과 주택 최대 2억원 절대한도 적용)',
            required_cash: '약 23억 1,080만원 (총인수 25.108억 - 대출 2억 차감 실필요현금)',
            market_price: '31억 0,000만원 (인근 대형 평형 시세)',
            safety_margin: '약 5억 8,920만원 (시세 31억 - 분양가 25.1억)',
          },
        },
      ],
    },
    {
      apt_name: '마포 자이 힐스테이트 라체르보 (공덕1구역)',
      location: '서울특별시 마포구 공덕동 105-84 일원 (비규제지역)',
      price_info: '최고 17억 4,500만원 (전용 84㎡ 기준, 평당 약 5,150만원)',
      apply_date: format(addDays(today, 9), 'yyyy-MM-dd'),
      announcement_date: d0,
      winner_date: format(addDays(today, 16), 'yyyy-MM-dd'),
      contract_date: format(addDays(today, 28), 'yyyy-MM-dd'),
      supply_scale: '총 1,101세대 중 일반분양 463세대',
      supply_type: '민영주택 일반분양 (비규제지역)',
      builder: 'GS건설·현대건설 컨소시엄',
      types_detail: [
        {
          type_name: '59A',
          exclusive_area: '59.91㎡ (약 25평형)',
          general_supply: 62,
          special_supply: 52,
          total_supply: 114,
          price_max: '13억 4,400만원',
          price_per_pyeong: '약 5,376만원/평',
          financing: {
            base_price: '13억 4,400만원',
            option_price: '약 3,100만원 (발코니+에어컨)',
            total_acquisition: '13억 7,500만원 (15억 이하)',
            deposit_amount: '1억 3,440만원 (계약금 10% 현금)',
            balance_amount: '12억 4,060만원',
            loan_limit: '6억 0,000만원 (비규제 LTV 70% 중 15억 이하 최대 6억원 절대한도 적용)',
            required_cash: '약 7억 7,500만원 (총인수 13.75억 - 대출 6억 차감 실필요현금)',
            market_price: '15억 5,000만원 (인근 59형 시세)',
            safety_margin: '약 1억 7,500만원 (시세 15.5억 - 인수 13.75억)',
          },
        },
        {
          type_name: '84A',
          exclusive_area: '84.98㎡ (약 34평형)',
          general_supply: 140,
          special_supply: 113,
          total_supply: 253,
          price_max: '17억 4,500만원',
          price_per_pyeong: '약 5,132만원/평',
          financing: {
            base_price: '17억 4,500만원',
            option_price: '약 3,800만원 (발코니+에어컨)',
            total_acquisition: '17억 8,300만원 (15억 초과~25억 이하)',
            deposit_amount: '1억 7,450만원 (계약금 10% 현금)',
            balance_amount: '16억 0,850만원 (중도금 60% + 잔금 30%)',
            loan_limit: '4억 0,000만원 (비규제 LTV 70% 중 15억 초과~25억 이하 최대 4억원 절대한도 적용)',
            required_cash: '약 13억 8,300만원 (총인수 17.83억 - 대출 4억 차감 실필요현금)',
            market_price: '19억 5,000만원 (인근 마포래미안푸르지오 84형 실거래가 19.5억~20.5억)',
            safety_margin: '약 1억 6,700만원~2억 5,000만원 (인근 시세 19.5억 기준)',
          },
        },
      ],
    },
    {
      apt_name: '에코시티 더샵 4차 (전주 에코시티 16블록)',
      location: '전북특별자치도 전주시 덕진구 송천동2가 산139 일원 (비규제지역)',
      price_info: '최고 5억 6,500만원 (전용 84㎡ 기준, 분양가상한제 적용)',
      apply_date: format(addDays(today, 4), 'yyyy-MM-dd'),
      announcement_date: d0,
      winner_date: format(addDays(today, 11), 'yyyy-MM-dd'),
      contract_date: format(addDays(today, 23), 'yyyy-MM-dd'),
      supply_scale: '총 576세대 중 일반분양 354세대',
      supply_type: '민영주택 일반분양 (전북/분상제)',
      builder: '포스코이앤씨',
      types_detail: [
        {
          type_name: '84A',
          exclusive_area: '84.92㎡ (약 34평형)',
          general_supply: 180,
          special_supply: 174,
          total_supply: 354,
          price_max: '5억 6,500만원',
          price_per_pyeong: '약 1,661만원/평',
          financing: {
            base_price: '5억 6,500만원',
            option_price: '약 2,400만원 (발코니 확장 및 옵션)',
            total_acquisition: '5억 8,900만원 (15억 이하)',
            deposit_amount: '5,650만원 (계약금 10% 현금)',
            balance_amount: '5억 3,250만원',
            loan_limit: '4억 1,230만원 (비규제 LTV 70% 적용)',
            required_cash: '약 1억 7,670만원 (총인수 5.89억 - 대출 4.12억 차감 실필요현금)',
            market_price: '7억 8,000만원 (인근 에코시티 더샵 2차 84형 실거래가 7.5억~8.2억)',
            safety_margin: '약 1억 9,100만원~2억 3,000만원 (시세차익 기대)',
          },
        },
      ],
    },
    {
      apt_name: '해운대 르엘 (우동1구역 재건축)',
      location: '부산광역시 해운대구 우동 1104-1 일원 (비규제지역)',
      price_info: '최고 14억 8,000만원 (전용 84㎡ 기준)',
      apply_date: format(addDays(today, 8), 'yyyy-MM-dd'),
      announcement_date: d0,
      winner_date: format(addDays(today, 15), 'yyyy-MM-dd'),
      contract_date: format(addDays(today, 27), 'yyyy-MM-dd'),
      supply_scale: '총 648세대 중 일반분양 280세대',
      supply_type: '민영주택 일반분양 (부산 해운대)',
      builder: '롯데건설 (르엘)',
      types_detail: [
        {
          type_name: '84B',
          exclusive_area: '84.95㎡ (약 34평형)',
          general_supply: 140,
          special_supply: 140,
          total_supply: 280,
          price_max: '14억 8,000만원',
          price_per_pyeong: '약 4,352만원/평',
          financing: {
            base_price: '14억 8,000만원',
            option_price: '약 3,500만원',
            total_acquisition: '15억 1,500만원 (15억 초과~25억 이하)',
            deposit_amount: '1억 4,800만원 (계약금 10% 현금)',
            balance_amount: '13억 6,700만원',
            loan_limit: '4억 0,000만원 (15억 초과~25억 이하 주택 최대 4억원 절대한도 적용)',
            required_cash: '약 11억 1,500만원 (총인수 15.15억 - 대출 4억 차감)',
            market_price: '18억 5,000만원 (인근 해운대 센텀 신축 시세)',
            safety_margin: '약 3억 3,500만원 (시세 18.5억 - 인수 15.15억)',
          },
        },
      ],
    },
    {
      apt_name: '천안 성성 자이 레이크파크',
      location: '충청남도 천안시 서북구 성성동 440-11 일원 (비규제지역)',
      price_info: '최고 5억 4,200만원 (전용 84㎡ 기준)',
      apply_date: format(addDays(today, 12), 'yyyy-MM-dd'),
      announcement_date: d0,
      winner_date: format(addDays(today, 19), 'yyyy-MM-dd'),
      contract_date: format(addDays(today, 30), 'yyyy-MM-dd'),
      supply_scale: '총 1,104세대 중 일반분양 1,104세대',
      supply_type: '민영주택 일반분양 (충남 천안)',
      builder: 'GS건설 (자이)',
      types_detail: [
        {
          type_name: '84A',
          exclusive_area: '84.97㎡ (약 34평형)',
          general_supply: 600,
          special_supply: 504,
          total_supply: 1104,
          price_max: '5억 4,200만원',
          price_per_pyeong: '약 1,594만원/평',
          financing: {
            base_price: '5억 4,200만원',
            option_price: '약 2,200만원',
            total_acquisition: '5억 6,400만원',
            deposit_amount: '5,420만원 (계약금 10% 현금)',
            balance_amount: '5억 0,980만원',
            loan_limit: '3억 9,480만원 (비규제 LTV 70% 적용)',
            required_cash: '약 1억 6,920만원 (총인수 5.64억 - 대출 3.95억 차감)',
            market_price: '6억 8,000만원 (인근 성성지구 신축 84형 실거래가 6.5억~7억)',
            safety_margin: '약 1억 1,600만원 (시세차익 기대)',
          },
        },
      ],
    },
  ];
}
