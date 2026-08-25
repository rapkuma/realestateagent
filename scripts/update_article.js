const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateArticle() {
  const id = '373033d0-4d39-40c7-b3f1-e85d6a8ba951';
  const { data } = await supabase.from('newsletters').select('*').eq('id', id).single();
  if (!data) return;

  const aptName = '마포 자이 힐스테이트 라체르보 (공덕1구역)';
  const location = '서울특별시 마포구 공덕동 105-84 일원 (비규제지역)';
  const homepageSearchUrl = 'https://search.naver.com/search.naver?query=' + encodeURIComponent(aptName + ' 분양 홈페이지');

  let html = data.content_html;
  
  const newTable = `
      <!-- 2~6. 주요 정보 및 모집공고/홈페이지/일정 -->
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">2~6. 단지 기본 정보 & 핵심 일정</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; line-height: 1.8;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; width: 120px; font-weight: 700; color: #64748b; vertical-align: top;">📍 공급위치</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${location}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">🏗️ 공급규모</td>
              <td style="padding: 10px 0; color: #334155;">총 1,101세대 중 일반분양 463세대 (GS건설·현대건설)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">📄 모집공고</td>
              <td style="padding: 10px 0;">
                <a href="https://www.applyhome.co.kr" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 700; text-decoration: underline;">
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
                  <div>• 모집공고일: <strong>2026-08-23</strong></div>
                  <div>• 📌 <strong>청약 접수일:</strong> <span style="color: #1d4ed8; font-weight: 800; font-size: 15px; background-color: #eff6ff; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">2026-09-03 (특별/1순위)</span></div>
                  <div>• 🎉 당첨자 발표일: <strong>2026-09-10</strong></div>
                  <div>• 📝 계약 진행일: 2026-09-21 ~ 2026-09-24</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>`;

  const oldTableStart = html.indexOf('<!-- 2~6. 주요 정보');
  const oldTableEnd = html.indexOf('<!-- 7. 안전마진');
  if (oldTableStart !== -1 && oldTableEnd !== -1) {
    html = html.substring(0, oldTableStart) + newTable + '\n' + html.substring(oldTableEnd);
    await supabase.from('newsletters').update({ content_html: html }).eq('id', id);
    console.log('Successfully updated article:', id);
  }
}

updateArticle();
