import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { format } from 'date-fns';

const apiKey = process.env.APPLYHOME_API_KEY;

function formatDateStr(dateStr: any): string {
  if (!dateStr) return '';
  const s = dateStr.toString().trim();
  if (s.length === 8 && !s.includes('-')) {
    return `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}`;
  }
  return s;
}

async function fetch4CategoryList() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  console.log(`📡 [청약홈 4대 카테고리 실시간 물건 목록 수집] (오늘 기준: ${todayStr})\n`);

  if (!apiKey) {
    console.error('❌ APPLYHOME_API_KEY 없음');
    return;
  }

  const aptUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=100&serviceKey=${encodeURIComponent(apiKey)}`;
  const remndrUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=100&serviceKey=${encodeURIComponent(apiKey)}`;

  const [resApt, resRemndr] = await Promise.all([
    fetch(aptUrl, { headers: { Accept: 'application/json' } }),
    fetch(remndrUrl, { headers: { Accept: 'application/json' } }),
  ]);

  const aptItems: any[] = resApt.ok ? (await resApt.json()).data || [] : [];
  const remndrItems: any[] = resRemndr.ok ? (await resRemndr.json()).data || [] : [];

  // 4대 카테고리로 데이터 분류
  const cat1_APT: any[] = [];
  const cat2_UrbntyOfcl: any[] = [];
  const cat3_Remndr: any[] = [];
  const cat4_PrvtSbjct: any[] = [];

  aptItems.forEach((item: any) => {
    const houseSecd = item.HOUSE_SECD || '';
    const supplyType = item.HOUSE_DTL_SECD_NM || item.HOUSE_SECD_NM || '';
    const applyDate = formatDateStr(item.RCEPT_BGNDE || item.rcept_bgnde);
    const pblancDate = formatDateStr(item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de);

    const formattedItem = {
      name: item.HOUSE_NM || item.house_nm,
      location: item.HSSPLY_ADRES || item.hssply_adres || '위치 공고문 참조',
      applyDate: applyDate || '접수일 공고문 참조',
      pblancDate: pblancDate || '모집공고일 참조',
      scale: `${item.TOT_SUPLY_HSHLDCO || 0}세대`,
    };

    if (supplyType.includes('사전청약') || item.HOUSE_NM?.includes('사전청약')) {
      cat4_PrvtSbjct.push(formattedItem);
    } else if (houseSecd === '02' || houseSecd === '03' || supplyType.includes('오피스텔') || supplyType.includes('도시형') || supplyType.includes('민간임대')) {
      cat2_UrbntyOfcl.push(formattedItem);
    } else {
      cat1_APT.push(formattedItem);
    }
  });

  remndrItems.forEach((item: any) => {
    const applyDate = formatDateStr(item.SUBSCRPT_RCEPT_BGNDE || item.subscrpt_rcept_bgnde || item.RCEPT_BGNDE);
    const pblancDate = formatDateStr(item.PBLANC_NO || item.RCRIT_PBLANC_DE);

    cat3_Remndr.push({
      name: item.HOUSE_NM || item.house_nm,
      location: item.HSSPLY_ADRES || item.hssply_adres || '위치 공고문 참조',
      applyDate: applyDate || '접수일 공고문 참조',
      pblancDate: pblancDate || '모집공고일 참조',
      scale: `${item.TOT_SUPLY_HSHLDCO || 0}세대`,
    });
  });

  console.log(`====================================================`);
  console.log(`🏢 1. [APT 일반분양주택] (총 ${cat1_APT.length}건):`);
  cat1_APT.slice(0, 8).forEach((item, idx) => {
    console.log(`   ${idx + 1}. ${item.name} (${item.location})`);
    console.log(`      - 모집공고일: ${item.pblancDate} | 청약접수일: ${item.applyDate} | 규모: ${item.scale}`);
  });

  console.log(`\n🏢 2. [오피스텔 / 도시형 / 민간임대] (총 ${cat2_UrbntyOfcl.length}건):`);
  if (cat2_UrbntyOfcl.length === 0) {
    console.log(`   (현재 청약홈 고시중인 오피스텔/도시형 물건 없음)`);
  } else {
    cat2_UrbntyOfcl.slice(0, 8).forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} (${item.location})`);
      console.log(`      - 모집공고일: ${item.pblancDate} | 청약접수일: ${item.applyDate} | 규모: ${item.scale}`);
    });
  }

  console.log(`\n🎁 3. [APT 잔여세대 (무순위 / 줍줍 / 취소재공급)] (총 ${cat3_Remndr.length}건):`);
  cat3_Remndr.slice(0, 8).forEach((item, idx) => {
    console.log(`   ${idx + 1}. ${item.name} (${item.location})`);
    console.log(`      - 모집공고일: ${item.pblancDate} | 청약접수일: ${item.applyDate} | 규모: ${item.scale}`);
  });

  console.log(`\n🏛️ 4. [민간사전청약 / 공공사전청약] (총 ${cat4_PrvtSbjct.length}건):`);
  if (cat4_PrvtSbjct.length === 0) {
    console.log(`   (현재 고시중인 사전청약 물건 없음)`);
  } else {
    cat4_PrvtSbjct.slice(0, 8).forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} (${item.location})`);
      console.log(`      - 모집공고일: ${item.pblancDate} | 청약접수일: ${item.applyDate} | 규모: ${item.scale}`);
    });
  }
  console.log(`====================================================`);
}

fetch4CategoryList();
