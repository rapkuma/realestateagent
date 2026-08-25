const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// We will construct the full HTML using the exact same rich 20-part template for Jeonbuk and Busan

const jeonbukHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 100%;">
      
      <!-- 단지 기본 정보 헤더 -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; margin-bottom: 25px;">
        <span style="display: inline-block; background-color: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px;">
          민영주택 일반분양 (전북/분상제)
        </span>
        <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 4px 0 8px 0;">
          🏢 에코시티 더샵 4차 (전주 에코시티 16블록)
        </h2>
        <p style="font-size: 14px; color: #64748b; margin: 0 0 6px 0;">📍 공급 위치: <strong>전북특별자치도 전주시 덕진구 송천동2가 산139 일원</strong></p>
        <p style="font-size: 14px; color: #64748b; margin: 0 0 14px 0;">🏗️ 시공사/규모: 포스코이앤씨 · 총 576세대 중 일반분양 354세대</p>
      </div>

      <!-- 1. 청약개요 -->
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px 20px; margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">1. 청약개요</h3>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.8;">본 단지는 <strong>전북특별자치도 전주시 덕진구 송천동2가 산139 일원</strong>에 위치한 <strong>총 576세대 중 일반분양 354세대</strong> 규모의 분양가상한제 적용 프리미엄 아파트입니다.</p>
      </div>

      <!-- 2~6. 주요 정보 및 모집공고/홈페이지/일정 -->
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">2~6. 단지 기본 정보 & 핵심 일정</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; line-height: 1.8;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; width: 120px; font-weight: 700; color: #64748b; vertical-align: top;">📍 공급위치</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">전북특별자치도 전주시 덕진구 송천동2가 산139 일원 (비규제지역)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">🏗️ 공급규모</td>
              <td style="padding: 10px 0; color: #334155;">총 576세대 중 일반분양 354세대 (포스코이앤씨)</td>
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
                <a href="https://search.naver.com/search.naver?query=%EC%97%90%EC%BD%94%EC%8B%9C%ED%8B%B0%20%EB%8D%94%EC%83%B5%204%EC%B0%A8%20%EB%B6%84%EC%96%91%20%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: underline;">
                  공식 분양 홈페이지 포털 검색 ➔
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 700; color: #64748b; vertical-align: top;">🗓️ 청약일정</td>
              <td style="padding: 12px 0;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div>• 모집공고일: <strong>2026-08-23</strong></div>
                  <div>• 📌 <strong>청약 접수일:</strong> <span style="color: #1d4ed8; font-weight: 800; font-size: 15px; background-color: #eff6ff; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">2026-08-29 (특별/1순위)</span></div>
                  <div>• 🎉 당첨자 발표일: <strong>2026-09-05</strong></div>
                  <div>• 📝 계약 진행일: 2026-09-17 ~ 2026-09-20</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 7. 안전마진 및 자금 시뮬레이션 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">7. 안전마진 & 2026.8 주담대 자금 시뮬레이션</h3>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px;">
            <h4 style="font-size: 16px; font-weight: 800; color: #1e40af; margin: 0;">
              🏷️ [84A] 전용 84.92㎡ (약 34평형) 자금 시뮬레이션
            </h4>
            <span style="font-size: 12px; font-weight: 700; color: #dc2626; background-color: #fef2f2; padding: 3px 8px; border-radius: 6px;">
              분양가 5억 6,500만원
            </span>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; width: 140px; color: #64748b; font-weight: 600;">실질 총 인수금액</td>
                <td style="padding: 7px 10px; font-weight: 700; color: #0f172a;">5억 8,900만원 <span style="font-size: 11px; color: #94a3b8;">(발코니 및 옵션 약 2,400만원 포함)</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">계약금 (필요 현금)</td>
                <td style="padding: 7px 10px; font-weight: 700; color: #2563eb;">5,650만원 (계약 시 10% 현금)</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">입주 잔금</td>
                <td style="padding: 7px 10px; color: #334155;">5억 3,250만원</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f0fdf4;">
                <td style="padding: 7px 10px; color: #166534; font-weight: 700;">예상 대출 가능액</td>
                <td style="padding: 7px 10px; color: #15803d; font-weight: 800; font-size: 14px;">
                  4억 1,230만원 (비규제지역 LTV 70% 적용)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #fef2f2;">
                <td style="padding: 7px 10px; color: #991b1b; font-weight: 800;">최종 필요 현금</td>
                <td style="padding: 7px 10px; color: #dc2626; font-weight: 800; font-size: 14px;">
                  약 1억 7,670만원 (총인수 5.89억 - 대출 4.12억 차감)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">인근 유사단지 시세</td>
                <td style="padding: 7px 10px; color: #475569; font-weight: 700;">7억 8,000만원 (에코시티 더샵 2차 84형 실거래가 7.5억~8.2억)</td>
              </tr>
              <tr style="background-color: #faf5ff;">
                <td style="padding: 8px 10px; color: #6b21a8; font-weight: 800;">예상 안전마진</td>
                <td style="padding: 8px 10px; color: #7e22ce; font-weight: 800; font-size: 14px;">🎉 약 1억 9,100만원~2억 3,000만원 (시세차익 기대)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8~12. 상품성 및 입지분석 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">8~12. 입지조건 및 비교단지 분석</h3>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; font-size: 14px; color: #334155; line-height: 1.8;">
          • <strong>평면도 및 커뮤니티:</strong> 포스코이앤씨 더샵 브랜드 특화 설계, 공식 홈페이지 견본주택 참조<br>
          • <strong>입지조건 & 호재:</strong> 전주 에코시티 중심 상업지구 및 중앙호수공원 도보 이용 가능<br>
          • <strong>비교단지 시세:</strong> 에코시티 내 기존 입주 단지 시세(7.8억) 대비 분양가상한제로 높은 가격 경쟁력 확보
        </div>
      </div>

      <!-- 9. 분양가 및 세대수 상세 표 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">9. 평형(타입)별 상세 분양가 및 공급 세대수</h3>
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
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 8px; font-weight: 700; color: #0f172a;">84A</td>
              <td style="padding: 10px 8px; color: #64748b;">84.92㎡ (34평)</td>
              <td style="padding: 10px 8px; color: #334155;">180세대</td>
              <td style="padding: 10px 8px; color: #334155;">174세대</td>
              <td style="padding: 10px 8px; font-weight: 700; color: #2563eb;">354세대</td>
              <td style="padding: 10px 8px; font-weight: 800; color: #dc2626;">5억 6,500만원</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 13~20. 청약 전략 및 자격/대출 조건 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">13~20. 종합 분석 및 청약자격 / 대출전략</h3>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; font-size: 14px; color: #334155; line-height: 1.8;">
          • <strong>청약자격:</strong> 입주자모집공고일 기준 전주시 및 전북특별자치도 거주자 무주택 세대구성원<br>
          • <strong>제한사항:</strong> 전매제한 1년 적용, 재당첨 제한 및 분양가상한제 규제 확인<br>
          • <strong>대출조건:</strong> 비규제지역 LTV 70% 적용 (실질 대출 약 4.12억원 가능)<br>
          • <strong>추첨제 물량 & 전략:</strong> 전주 에코시티 인기 단지로 가점 높으신 분 우선 추천<br>
          • <strong>주의사항:</strong> 당첨 시 계약금 10%(약 5,650만원) 즉시 자가 자금 확보 필요
        </div>
      </div>
    </div>`;

const busanHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #1e293b; max-width: 100%;">
      
      <!-- 단지 기본 정보 헤더 -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; margin-bottom: 25px;">
        <span style="display: inline-block; background-color: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 8px;">
          민영주택 일반분양 (부산 해운대)
        </span>
        <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 4px 0 8px 0;">
          🏢 해운대 르엘 (우동1구역 재건축)
        </h2>
        <p style="font-size: 14px; color: #64748b; margin: 0 0 6px 0;">📍 공급 위치: <strong>부산광역시 해운대구 우동 1104-1 일원</strong></p>
        <p style="font-size: 14px; color: #64748b; margin: 0 0 14px 0;">🏗️ 시공사/규모: 롯데건설 (르엘) · 총 648세대 중 일반분양 280세대</p>
      </div>

      <!-- 1. 청약개요 -->
      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 18px 20px; margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">1. 청약개요</h3>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.8;">본 단지는 <strong>부산광역시 해운대구 우동 1104-1 일원</strong>에 위치한 <strong>총 648세대 중 일반분양 280세대</strong> 규모의 롯데건설 하이엔드 브랜드 '르엘' 재건축 아파트입니다.</p>
      </div>

      <!-- 2~6. 주요 정보 및 모집공고/홈페이지/일정 -->
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">2~6. 단지 기본 정보 & 핵심 일정</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; line-height: 1.8;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; width: 120px; font-weight: 700; color: #64748b; vertical-align: top;">📍 공급위치</td>
              <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">부산광역시 해운대구 우동 1104-1 일원 (비규제지역)</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; font-weight: 700; color: #64748b; vertical-align: top;">🏗️ 공급규모</td>
              <td style="padding: 10px 0; color: #334155;">총 648세대 중 일반분양 280세대 (롯데건설 르엘)</td>
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
                <a href="https://search.naver.com/search.naver?query=%ED%95%B4%EC%9B%B4%EB%8C%80+%EB%A5%B4%EC%97%98+%EB%B6%84%EC%96%91+%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: underline;">
                  공식 분양 홈페이지 포털 검색 ➔
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 700; color: #64748b; vertical-align: top;">🗓️ 청약일정</td>
              <td style="padding: 12px 0;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div>• 모집공고일: <strong>2026-08-23</strong></div>
                  <div>• 📌 <strong>청약 접수일:</strong> <span style="color: #1d4ed8; font-weight: 800; font-size: 15px; background-color: #eff6ff; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe;">2026-09-02 (특별/1순위)</span></div>
                  <div>• 🎉 당첨자 발표일: <strong>2026-09-09</strong></div>
                  <div>• 📝 계약 진행일: 2026-09-21 ~ 2026-09-24</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 7. 안전마진 및 자금 시뮬레이션 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">7. 안전마진 & 2026.8 주담대 자금 시뮬레이션</h3>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #eff6ff; padding-bottom: 8px;">
            <h4 style="font-size: 16px; font-weight: 800; color: #1e40af; margin: 0;">
              🏷️ [84B] 전용 84.95㎡ (약 34평형) 자금 시뮬레이션
            </h4>
            <span style="font-size: 12px; font-weight: 700; color: #dc2626; background-color: #fef2f2; padding: 3px 8px; border-radius: 6px;">
              분양가 14억 8,000만원
            </span>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; width: 140px; color: #64748b; font-weight: 600;">실질 총 인수금액</td>
                <td style="padding: 7px 10px; font-weight: 700; color: #0f172a;">15억 1,500만원 <span style="font-size: 11px; color: #94a3b8;">(발코니 및 고급 옵션 약 3,500만원 포함)</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">계약금 (필요 현금)</td>
                <td style="padding: 7px 10px; font-weight: 700; color: #2563eb;">1억 4,800만원 (계약 시 10% 현금)</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">입주 잔금</td>
                <td style="padding: 7px 10px; color: #334155;">13억 6,700만원</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f0fdf4;">
                <td style="padding: 7px 10px; color: #166534; font-weight: 700;">예상 대출 가능액</td>
                <td style="padding: 7px 10px; color: #15803d; font-weight: 800; font-size: 14px;">
                  4억 0,000만원 (2026.8 기준 15억 초과~25억 이하 주택 절대한도 4억 적용)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background-color: #fef2f2;">
                <td style="padding: 7px 10px; color: #991b1b; font-weight: 800;">최종 필요 현금</td>
                <td style="padding: 7px 10px; color: #dc2626; font-weight: 800; font-size: 14px;">
                  약 11억 1,500만원 (총인수 15.15억 - 대출 4억 차감)
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 7px 10px; color: #64748b; font-weight: 600;">인근 유사단지 시세</td>
                <td style="padding: 7px 10px; color: #475569; font-weight: 700;">18억 5,000만원 (인근 해운대 센텀 신축 시세)</td>
              </tr>
              <tr style="background-color: #faf5ff;">
                <td style="padding: 8px 10px; color: #6b21a8; font-weight: 800;">예상 안전마진</td>
                <td style="padding: 8px 10px; color: #7e22ce; font-weight: 800; font-size: 14px;">🎉 약 3억 3,500만원 (시세 18.5억 - 인수 15.15억)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 8~12. 상품성 및 입지분석 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">8~12. 입지조건 및 비교단지 분석</h3>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; font-size: 14px; color: #334155; line-height: 1.8;">
          • <strong>평면도 및 커뮤니티:</strong> 롯데건설 하이엔드 르엘 인테리어, 견본주택 참조<br>
          • <strong>입지조건 & 호재:</strong> 해운대역 및 센텀시티 생활권, 우동1구역 대표 랜드마크 입지<br>
          • <strong>비교단지 시세:</strong> 센텀 신축 84형(18.5억) 대비 높은 시세 차익 안전마진 형성
        </div>
      </div>

      <!-- 9. 분양가 및 세대수 상세 표 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">9. 평형(타입)별 상세 분양가 및 공급 세대수</h3>
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
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px 8px; font-weight: 700; color: #0f172a;">84B</td>
              <td style="padding: 10px 8px; color: #64748b;">84.95㎡ (34평)</td>
              <td style="padding: 10px 8px; color: #334155;">140세대</td>
              <td style="padding: 10px 8px; color: #334155;">140세대</td>
              <td style="padding: 10px 8px; font-weight: 700; color: #2563eb;">280세대</td>
              <td style="padding: 10px 8px; font-weight: 800; color: #dc2626;">14억 8,000만원</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 13~20. 청약 전략 및 자격/대출 조건 -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">13~20. 종합 분석 및 청약자격 / 대출전략</h3>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; font-size: 14px; color: #334155; line-height: 1.8;">
          • <strong>청약자격:</strong> 모집공고일 기준 부산광역시 및 울산/경남 거주 무주택 자격<br>
          • <strong>제한사항:</strong> 전매제한 6개월 적용<br>
          • <strong>대출조건:</strong> 2026.8 기준 15억 초과 주택으로 절대한도 4억원 제한 적용<br>
          • <strong>추첨제 물량 & 전략:</strong> 부산 최선호 입지로 실거주 자금 준비 필수<br>
          • <strong>주의사항:</strong> 계약금 10%(1억 4,800만원) 준비 필요
        </div>
      </div>
    </div>`;

async function updateFullNationwide() {
  const { data } = await supabase.from('newsletters').select('id, title');
  for (const item of data) {
    if (item.title.includes('전북')) {
      await supabase.from('newsletters').update({ content_html: jeonbukHtml }).eq('id', item.id);
      console.log('Updated Jeonbuk full html:', item.id);
    }
    if (item.title.includes('부산')) {
      await supabase.from('newsletters').update({ content_html: busanHtml }).eq('id', item.id);
      console.log('Updated Busan full html:', item.id);
    }
  }
}

updateFullNationwide();
