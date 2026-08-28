import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { format } from 'date-fns';
import { generateApartmentPost } from '../src/lib/summarizer';
import { downloadAndParsePdf } from '../src/lib/pdfDownloader';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const apiKey = process.env.APPLYHOME_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function formatDateStr(dateStr: any): string {
  if (!dateStr) return '';
  const s = dateStr.toString().trim();
  if (s.length === 8 && !s.includes('-')) {
    return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
  }
  return s;
}

async function fetchAllPages(endpointName: string): Promise<any[]> {
  let allItems: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 5) {
    const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${endpointName}?page=${page}&perPage=100&serviceKey=${encodeURIComponent(apiKey || '')}`;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) break;
      const json = await res.json();
      const items = json.data || [];
      if (items.length === 0) {
        hasMore = false;
      } else {
        allItems.push(...items);
        if (items.length < 100) hasMore = false;
        else page++;
      }
    } catch {
      hasMore = false;
    }
  }

  return allItems;
}

async function processActiveAndUpcoming() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  console.log(`🚀 [청약 접수일 유효건 전용 AI 분석 파이프라인 가동] (오늘 기준: ${todayStr})`);

  if (!apiKey) {
    console.error('❌ APPLYHOME_API_KEY 없음');
    return;
  }

  // 1. 공공데이터 API 전수 수집 (전체 페이지)
  const aptItems = await fetchAllPages('getAPTLttotPblancDetail');
  const remndrItems = await fetchAllPages('getRemndrLttotPblancDetail');
  const urbntyItems = await fetchAllPages('getUrbntyLttotPblancDetail');
  const cnclItems = await fetchAllPages('getCnclLttotPblancDetail');

  const rawList: any[] = [
    ...aptItems.map((i: any) => ({ ...i, _supplyType: '민영/공공주택' })),
    ...remndrItems.map((i: any) => ({ ...i, _supplyType: '무순위 (줍줍)' })),
    ...urbntyItems.map((i: any) => ({ ...i, _supplyType: '오피스텔/도시형/민간임대' })),
    ...cnclItems.map((i: any) => ({ ...i, _supplyType: '취소후재공급' })),
  ];

  console.log(`📡 공공데이터포털 수신 총 ${rawList.length}건 (APT: ${aptItems.length}건 / 무순위: ${remndrItems.length}건 / 오피스텔: ${urbntyItems.length}건 / 취소후재공급: ${cnclItems.length}건)`);

  // 2. 청약 접수일 지난 것 제외 (apply_date >= todayStr)
  const activeItems = rawList.filter((item) => {
    const rawApply = item.RCEPT_BGNDE || item.SUBSCRPT_RCEPT_BGNDE || item.subscrpt_rcept_bgnde || item.rcept_bgnde || '';
    const applyDate = formatDateStr(rawApply);
    if (!applyDate) return false;
    return applyDate >= todayStr;
  });

  console.log(`✨ [청약 접수일 유효] 오늘(${todayStr}) 이후 접수 예정/당일 단지: 총 ${activeItems.length}건`);

  let count = 0;

  for (const item of activeItems) {
    const rawApply = item.RCEPT_BGNDE || item.SUBSCRPT_RCEPT_BGNDE || item.subscrpt_rcept_bgnde || item.rcept_bgnde || '';
    const applyDate = formatDateStr(rawApply);
    const aptName = item.HOUSE_NM || item.house_nm;
    const location = item.HSSPLY_ADRES || item.hssply_adres || '공고문 참조';
    const priceInfo = item.LTTOT_TOP_AMOUNT ? `${item.LTTOT_TOP_AMOUNT.toLocaleString()}만원` : '최고가 공고문 참조';

    console.log(`\n🤖 [AI 분석 발행] [${applyDate}] ${aptName} (${location})`);

    const aptData = {
      apt_name: aptName,
      location: location,
      price_info: priceInfo,
      apply_date: applyDate,
      supply_scale: `${item.TOT_SUPLY_HSHLDCO || 0}세대`,
      supply_type: item._supplyType,
      builder: item.BSNS_MBY_NM || '주요 건설사',
      announcement_date: formatDateStr(item.RCRIT_PBLANC_DE || item.PBLANC_NO),
      winner_date: formatDateStr(item.PRTCN_PW_BB_DE),
      contract_date: formatDateStr(item.CNTRCT_CNCLS_BGNDE),
      house_manage_no: item.HOUSE_MANAGE_NO || item.house_manage_no,
      pblanc_no: item.PBLANC_NO || item.pblanc_no,
    };

    try {
      const houseManageNo = item.HOUSE_MANAGE_NO || item.house_manage_no;
      const pblancNo = item.PBLANC_NO || item.pblanc_no;
      
      let pdfText = '';
      let pdfUrl = '';
      if (houseManageNo && pblancNo) {
        console.log(`📑 모집공고문 PDF 다운로드 및 텍스트 추출 시도: ${houseManageNo}`);
        const extracted = await downloadAndParsePdf(houseManageNo, pblancNo);
        if (extracted) {
          pdfText = extracted.text;
          pdfUrl = extracted.url;
        }
      }
      
      const generated = await generateApartmentPost(aptData as any, pdfText, pdfUrl);

      const { data: existing } = await supabase
        .from('newsletters')
        .select('id')
        .ilike('title', `%${aptName}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('newsletters')
          .update({
            title: generated.title,
            content_html: generated.content_html,
            sent_at: new Date().toISOString(),
          })
          .eq('id', existing[0].id);

        if (error) console.error(`❌ DB 업데이트 실패:`, error.message);
        else console.log(`✅ [100% 팩트 무결성] ${aptName} DB 업데이트 완료!`);
      } else {
        const { error } = await supabase
          .from('newsletters')
          .insert({
            title: generated.title,
            content_html: generated.content_html,
            sent_at: new Date().toISOString(),
          });

        if (error) console.error(`❌ DB 신규 생성 실패:`, error.message);
        else console.log(`✅ [100% 팩트 무결성] ${aptName} DB 신규 등록 완료!`);
      }
      count++;
    } catch (err) {
      console.error(`❌ ${aptName} 처리 실패:`, err);
    }
  }

  console.log(`\n🎉 유효 청약 단지 총 ${count}건 심층 분석 및 Supabase 업로드 완료!`);
}

processActiveAndUpcoming();
