const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Import fallback items directly to generate nationwide sample newsletters
const mockData = [
  {
    title: '[전북 에코시티 더샵 4차] 분양가상한제 적용 평형별 세대수 및 자금 조달 시뮬레이션 리포트',
    location: '전북특별자치도 전주시 덕진구 송천동2가 산139 일원 (비규제지역)',
    html: `<div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #0f172a;">🏢 에코시티 더샵 4차 (전주 에코시티 16블록)</h2>
      <p>📍 위치: <strong>전북특별자치도 전주시 덕진구 송천동2가 산139 일원</strong></p>
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">2~6. 단지 기본 정보 & 핵심 일정</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; line-height: 1.8;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; width: 120px; font-weight: 700;">📍 공급위치</td><td>전북특별자치도 전주시 덕진구 송천동2가 산139 일원 (비규제지역)</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 700;">🏗️ 공급규모</td><td>총 576세대 중 일반분양 354세대 (포스코이앤씨)</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 700;">📄 모집공고</td><td><a href="https://www.applyhome.co.kr" target="_blank" style="color: #2563eb; font-weight: 700;">청약홈 공식 모집공고 바로가기 ➔</a></td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 700;">🌐 분양홈페이지</td><td><a href="https://search.naver.com/search.naver?query=%EC%97%90%EC%BD%94%EC%8B%9C%ED%8B%B0+%EB%8D%94%EC%83%B5+4%EC%B0%A8+%EB%B6%84%EC%96%91+%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80" target="_blank" style="color: #059669; font-weight: 700;">공식 분양 홈페이지 포털 검색 ➔</a></td></tr>
          <tr><td style="padding: 12px 0; font-weight: 700;">🗓️ 청약일정</td><td>• 모집공고일: <strong>2026-08-23</strong><br>• 📌 <strong>청약 접수일:</strong> <span style="color: #1d4ed8; font-weight: 800; background-color: #eff6ff; padding: 2px 8px; border-radius: 6px;">2026-08-29 (특별/1순위)</span><br>• 🎉 당첨자 발표일: <strong>2026-09-05</strong><br>• 📝 계약 진행일: 2026-09-17 ~ 2026-09-20</td></tr>
        </table>
      </div>
    </div>`
  },
  {
    title: '[부산 해운대 르엘] 우동1구역 대단지 프리미엄 평형별 세대수 및 자금 조달 시뮬레이션 리포트',
    location: '부산광역시 해운대구 우동 1104-1 일원 (비규제지역)',
    html: `<div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #0f172a;">🏢 해운대 르엘 (우동1구역 재건축)</h2>
      <p>📍 위치: <strong>부산광역시 해운대구 우동 1104-1 일원</strong></p>
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">2~6. 단지 기본 정보 & 핵심 일정</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; line-height: 1.8;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; width: 120px; font-weight: 700;">📍 공급위치</td><td>부산광역시 해운대구 우동 1104-1 일원 (비규제지역)</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 700;">🏗️ 공급규모</td><td>총 648세대 중 일반분양 280세대 (롯데건설 르엘)</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 700;">📄 모집공고</td><td><a href="https://www.applyhome.co.kr" target="_blank" style="color: #2563eb; font-weight: 700;">청약홈 공식 모집공고 바로가기 ➔</a></td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 700;">🌐 분양홈페이지</td><td><a href="https://search.naver.com/search.naver?query=%ED%95%B4%EC%9B%B4%EB%8C%80+%EB%A5%B4%EC%97%98+%EB%B6%84%EC%96%91+%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80" target="_blank" style="color: #059669; font-weight: 700;">공식 분양 홈페이지 포털 검색 ➔</a></td></tr>
          <tr><td style="padding: 12px 0; font-weight: 700;">🗓️ 청약일정</td><td>• 모집공고일: <strong>2026-08-23</strong><br>• 📌 <strong>청약 접수일:</strong> <span style="color: #1d4ed8; font-weight: 800; background-color: #eff6ff; padding: 2px 8px; border-radius: 6px;">2026-09-02 (특별/1순위)</span><br>• 🎉 당첨자 발표일: <strong>2026-09-09</strong><br>• 📝 계약 진행일: 2026-09-21 ~ 2026-09-24</td></tr>
        </table>
      </div>
    </div>`
  }
];

async function insertNationwide() {
  for (const m of mockData) {
    const { error } = await supabase.from('newsletters').insert({
      title: m.title,
      content_html: m.html,
      created_at: new Date().toISOString()
    });
    if (error) console.error('Insert error:', error.message);
    else console.log('Successfully inserted:', m.title);
  }
}

insertNationwide();
