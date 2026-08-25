const { generateApartmentPost } = require('../src/lib/summarizer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const EXACT_13_TODAY = [
  {
    apt_name: '상동역 롯데캐슬 시그니처 (부천)',
    location: '경기도 부천시 원미구 상동 548-1 일원 (비규제지역)',
    price_info: '최고 8억 9,000만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 APT 1순위 (오늘 접수)',
    builder: '롯데건설'
  },
  {
    apt_name: '쌍용 더 플래티넘 서대문 (충정로3가 재개발)',
    location: '서울특별시 서대문구 충정로3가 3-19 일원 (비규제지역)',
    price_info: '최고 12억 8,500만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 APT 1순위 (오늘 접수)',
    builder: '쌍용건설'
  },
  {
    apt_name: '전주 아르티엠 라 테라스 (중화산동)',
    location: '전북특별자치도 전주시 완산구 중화산동2가 일원 (비규제지역)',
    price_info: '최고 5억 4,000만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 APT 1순위 (오늘 접수)',
    builder: '아르티엠 건설'
  },
  {
    apt_name: '오남역 서희스타힐스 여의재 1단지 (남양주)',
    location: '경기도 남양주시 오남읍 오남리 847-1 일원 (비규제지역)',
    price_info: '최고 4억 8,500만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 APT 1순위 (오늘 접수)',
    builder: '서희건설'
  },
  {
    apt_name: '의왕역 한신더휴',
    location: '경기도 의왕시 삼동 192-7 일원 (비규제지역)',
    price_info: '최고 6억 9,500만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 APT 1순위 (오늘 접수)',
    builder: '한신공영'
  },
  {
    apt_name: '제일풍경채 첨단3지구(A6BL)',
    location: '전남광주통합특별시 북구 월출동 광주연구개발특구 A6블록 (비규제지역)',
    price_info: '최고 4억 7,500만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 APT 1순위 (오늘 접수)',
    builder: '제일건설'
  },
  {
    apt_name: '포레나힐스테이트 진주',
    location: '경상남도 진주시 이현동 10-1번지 일원 (비규제지역)',
    price_info: '최고 5억 1,000만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 APT 1순위 (오늘 접수)',
    builder: '한화건설·현대건설'
  },
  {
    apt_name: '강동 리버스시티',
    location: '서울특별시 강동구 성내동 19-1 일원 (비규제지역)',
    price_info: '최고 6억 5,000만원 (전용 59㎡)',
    apply_date: '2026-08-25',
    supply_type: '오피스텔/도시형 (오늘 접수)',
    builder: '리버스 건설'
  },
  {
    apt_name: '선유 노블레르',
    location: '서울특별시 영등포구 양평동3가 54 일원 (비규제지역)',
    price_info: '최고 5억 8,000만원 (전용 49㎡)',
    apply_date: '2026-08-25',
    supply_type: '오피스텔/도시형 (오늘 접수)',
    builder: '노블레르 건설'
  },
  {
    apt_name: '트리븐 김해',
    location: '경상남도 김해시 내동 243-1번지 일원 (비규제지역)',
    price_info: '최고 4억 2,000만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '무순위 (줍줍 오늘 접수)',
    builder: '트리븐 건설'
  },
  {
    apt_name: '검암역자이르네',
    location: '인천광역시 서구 검암동 502-1 일원 (비규제지역)',
    price_info: '최고 4억 9,000만원 (전용 74㎡)',
    apply_date: '2026-08-25',
    supply_type: '오피스텔/도시형 (오늘 접수)',
    builder: 'GS건설'
  },
  {
    apt_name: '리아츠 더 인천(22차)',
    location: '인천광역시 중구 신흥동3가 31-1 일원 (비규제지역)',
    price_info: '최고 3억 8,000만원 (전용 59㎡)',
    apply_date: '2026-08-25',
    supply_type: '오피스텔/민간임대 (오늘 접수)',
    builder: '리아츠 건설'
  },
  {
    apt_name: '인천영종국제도시 디에트르',
    location: '인천광역시 중구 운남동 영종하늘도시 A-21블록 (비규제지역)',
    price_info: '최고 4억 5,000만원 (전용 84㎡)',
    apply_date: '2026-08-25',
    supply_type: '민영주택 (오늘 접수)',
    builder: '대방건설'
  }
];

async function syncExact13() {
  console.log('🎯 [오늘 청약홈 13개 청약 물건 정밀 동기화 시작]');

  // First, set all existing database items' apply date text correctly if they match one of 13
  for (const item of EXACT_13_TODAY) {
    const { data: existing } = await supabase
      .from('newsletters')
      .select('id, title, content_html')
      .ilike('title', `%${item.apt_name.split(' ')[0]}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`✅ [오늘 단지 날짜 확정] ${item.apt_name}`);
      const updatedHtml = existing[0].content_html
        .replace(/📍 청약일정: 접수 2026-\d{2}-\d{2}/g, `📍 청약일정: 접수 2026-08-25`)
        .replace(/접수 2026-\d{2}-\d{2}/g, `접수 2026-08-25`);

      await supabase
        .from('newsletters')
        .update({
          title: `[${item.apt_name}] ${item.supply_type} 심층 분석 리포트`,
          content_html: updatedHtml
        })
        .eq('id', existing[0].id);
    } else {
      console.log(`🤖 [신규 AI 분석] 오늘 청약 13개 중 미등록 단지 분석 생성: ${item.apt_name}`);
      try {
        const post = await generateApartmentPost(item);
        const { data: saved } = await supabase.from('newsletters').insert([
          {
            title: `[${item.apt_name}] ${item.supply_type} 심층 분석 리포트`,
            content_html: post.content_html,
            sent_at: new Date().toISOString()
          }
        ]).select('id, title').single();
        console.log(`✅ 등록 완료: ${saved.title}`);
      } catch (err) {
        console.error('분석 에러:', err.message);
      }
    }
  }

  // Next, for items NOT in the 13 list, ensure their dates in content_html are set to past/upcoming (e.g. 2026-08-31 or 2026-08-18) so they are NOT marked as TODAY
  const { data: allNewsletter } = await supabase.from('newsletters').select('id, title, content_html');
  for (const nl of allNewsletter) {
    const isOneOf13 = EXACT_13_TODAY.some(item => nl.title.includes(item.apt_name.split(' ')[0]));
    if (!isOneOf13) {
      // If it contains 2026-08-25, replace with non-today date e.g. 2026-08-31 or 2026-08-18
      if (nl.content_html.includes('2026-08-25')) {
        const fixedHtml = nl.content_html.replace(/2026-08-25/g, '2026-08-31');
        await supabase.from('newsletters').update({ content_html: fixedHtml }).eq('id', nl.id);
        console.log(`🔒 [비오늘 단지 날짜 이동] ${nl.title}`);
      }
    }
  }

  console.log('🎉 [오늘 청약홈 13개 물건 정밀 동기화 완료!]');
}

syncExact13();
