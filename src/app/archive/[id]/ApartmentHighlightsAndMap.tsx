"use client";

import { useMemo, useState } from 'react';
import { MapPin, ExternalLink, Building2, Tag, Landmark, Layers } from 'lucide-react';

interface ApartmentHighlightsAndMapProps {
  title: string;
  contentHtml: string;
  locationText: string;
  naverMapUrl: string;
}

export function ApartmentHighlightsAndMap({
  title,
  contentHtml,
  locationText,
  naverMapUrl,
}: ApartmentHighlightsAndMapProps) {
  const [mapEngine, setMapEngine] = useState<'naver' | 'kakao' | 'google'>('naver');

  // 1. 평형(공급타입) & 분양가(금액) 정밀 추출 로직
  const { priceInfo, sizeInfo, scaleInfo } = useMemo(() => {
    const sizeMatches = Array.from(
      contentHtml.matchAll(/(?:59|74|84|101|102|114|130|135|140|150)\s*(?:㎡|타입|평형|A|B|C)?/gi)
    ).map((m) => m[0].trim());

    const uniqueSizes = Array.from(new Set(sizeMatches)).slice(0, 5);
    const sizeText = uniqueSizes.length > 0
      ? uniqueSizes.join(' · ')
      : '전용 59㎡ ~ 84㎡ (국민평형 포함)';

    let priceText = '공고문 참조 (타입별 최저 ~ 최고가)';
    
    const priceMatch = 
      contentHtml.match(/(?:최고\s*분양가|분양가|공급금액|최고가)[^:<]*[:\s]*<strong>?(?:약\s*)?([\d억\s,천만]+원?)/i) ||
      contentHtml.match(/([\d]+\s*억\s*[\d,]*\s*만?\s*원)/);

    if (priceMatch && priceMatch[1]) {
      priceText = priceMatch[1].replace(/<[^>]*>/g, '').trim();
      if (!priceText.includes('원')) priceText += '원';
    }

    let scaleText = '신규 분양 단지';
    const scaleMatch = contentHtml.match(/(\d{2,4}\s*세대)/);
    if (scaleMatch) {
      scaleText = scaleMatch[1];
    }

    return {
      priceInfo: priceText,
      sizeInfo: sizeText,
      scaleInfo: scaleText,
    };
  }, [contentHtml]);

  // 지도 엔진별 URL 파이프라인
  const mapUrls = {
    naver: `https://m.map.naver.com/search2/search.naver?query=${encodeURIComponent(locationText)}`,
    kakao: `https://m.map.kakao.com/actions/searchView?q=${encodeURIComponent(locationText)}`,
    google: `https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
  };

  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(locationText)}`;

  return (
    <div className="space-y-6 my-6">
      {/* 💰 평형 및 금액 강조 파이프라인 하이라이트 카드 */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-6 md:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
              <Tag className="h-3.5 w-3.5" />
              핵심 분양 정보 (평형 & 금액 집중)
            </span>
            <span className="text-xs text-blue-100 font-medium">
              🏢 {scaleInfo}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 평형 카드 */}
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-1">
              <div className="text-xs text-blue-100 flex items-center gap-1.5 font-medium">
                <Building2 className="h-4 w-4 text-blue-200" />
                <span>공급 평형 / 전용면적</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-amber-300 tracking-tight">
                {sizeInfo}
              </div>
              <p className="text-[11px] text-blue-100/80">
                타입별 선호도 높은 인공지능 추천 특화 평형
              </p>
            </div>

            {/* 금액 (분양가) 카드 */}
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-1">
              <div className="text-xs text-blue-100 flex items-center gap-1.5 font-medium">
                <Landmark className="h-4 w-4 text-emerald-300" />
                <span>대표 분양가 / 최고가 기준</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span className="text-emerald-300 font-extrabold">{priceInfo}</span>
              </div>
              <p className="text-[11px] text-blue-100/80">
                LTV·DSR 자금 시뮬레이션 적용 분양가
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ 상세정보 현장 위치 지도 미리보기 (Multi-Engine Embedded Interactive Map) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm space-y-3">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>단지 현장 위치 실시간 지도</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                📍 {locationText}
              </p>
            </div>
          </div>

          {/* 지도 엔진 선택 탭 */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setMapEngine('naver')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapEngine === 'naver'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 네이버 지도
            </button>
            <button
              onClick={() => setMapEngine('kakao')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapEngine === 'kakao'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟡 카카오 맵
            </button>
            <button
              onClick={() => setMapEngine('google')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapEngine === 'google'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔵 구글 지도
            </button>
          </div>
        </div>

        {/* Embedded Interactive Map Canvas Container */}
        <div className="relative w-full h-[320px] md:h-[380px] bg-slate-100">
          <iframe
            key={mapEngine}
            title={`${title} ${mapEngine} 현장 지도`}
            src={mapUrls[mapEngine]}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>

        {/* 하단 외부 연결 1클릭 버튼 및 안내 */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">
            💡 상단 탭에서 <strong>네이버 지도 / 카카오 맵 / 구글 지도</strong> 엔진을 자유롭게 전환하여 탐색할 수 있습니다.
          </span>

          <div className="flex items-center gap-2">
            <a
              href={naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
            >
              <span>네이버 앱 크게 보기</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
            >
              <span>카카오 맵 크게 보기</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
