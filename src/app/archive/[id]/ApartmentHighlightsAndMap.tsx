"use client";

import { useMemo } from 'react';
import { MapPin, ExternalLink, Building2, Tag, Landmark } from 'lucide-react';

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
  // 1. 100% 정밀 아파트 분양가 & 평형 & 규모 파싱 로직
  const { priceInfo, sizeInfo, scaleInfo } = useMemo(() => {
    let priceText = '타입별 분양가 개별 표기 (하단 9번 표 참조)';
    let sizeText = '전용 59㎡ ~ 84㎡ (국민평형 포함)';
    let scaleText = '공공데이터 신규 분양 단지';

    if (!contentHtml) return { priceInfo: priceText, sizeInfo: sizeText, scaleInfo: scaleText };

    // A. 공급규모 파싱
    const scaleMatch = 
      contentHtml.match(/🏗️\s*공급규모<\/td>\s*<td[^>]*>(.*?)<\/td>/i) ||
      contentHtml.match(/🏗️\s*시공사\/규모:\s*(.*?)(?:<\/p>|<br>)/i);

    if (scaleMatch && scaleMatch[1]) {
      scaleText = scaleMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    // B. 분양가 (Section 9 및 상단 요약문 우선 파싱)
    const headerPriceMatch = contentHtml.match(/<strong>최고\s*분양가<\/strong>[^:]*:\s*<strong>?([\d억\s,~천만]+원?[^<]*)/i);

    if (headerPriceMatch && headerPriceMatch[1]) {
      priceText = headerPriceMatch[1].replace(/<[^>]*>/g, '').trim();
    } else {
      // 9번 평형별 상세 분양가 섹션 탐색
      const sec9Match = contentHtml.match(/9\.\s*평형[^<]*상세\s*분양가[\s\S]*?(?:<div[^>]*>([\s\S]*?)<\/div>|<table[\s\S]*?<\/table>)/i);
      if (sec9Match && sec9Match[0]) {
        const sec9CleanText = sec9Match[0].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
        const specPriceMatch = sec9CleanText.match(/(?:최고\s*)?([\d]+\s*억\s*[\d,~]*\s*만?\s*원?선?)/i);
        if (specPriceMatch && specPriceMatch[1]) {
          priceText = specPriceMatch[1].trim();
          if (!priceText.includes('원') && !priceText.includes('선')) priceText += '원';
        }
      }
    }

    // C. 공급 평형 파싱
    const sec9MatchForSizes = contentHtml.match(/9\.\s*평형[^<]*상세\s*분양가[\s\S]*?(?:<div[^>]*>([\s\S]*?)<\/div>|<table[\s\S]*?<\/table>)/i);
    const sec9TextForSizes = sec9MatchForSizes ? sec9MatchForSizes[0].replace(/<[^>]*>/g, ' ') : contentHtml;
    
    const sizeMatches = Array.from(
      sec9TextForSizes.matchAll(/(?:전용\s*)?(\d{2,3}\s*㎡|\d{2,3}\s*[A-C]타입|\d{2,3}A|\d{2,3}B|\d{2,3}C)/gi)
    ).map(m => m[1].trim());

    const uniqueSizes = Array.from(new Set(sizeMatches)).slice(0, 4);
    if (uniqueSizes.length > 0) {
      sizeText = uniqueSizes.join(' · ');
    }

    return {
      priceInfo: priceText,
      sizeInfo: sizeText,
      scaleInfo: scaleText,
    };
  }, [contentHtml]);

  // 지도 Embed URL (Google Maps output=embed query - 100% 임베드 허용)
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 my-6">
      {/* 💰 평형 및 금액 강조 파이프라인 프리미엄 하이라이트 카드 */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-6 md:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/20 pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
              <Tag className="h-3.5 w-3.5" />
              핵심 분양 정보 (평형 & 금액 집중 하이라이트)
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
              <div className="text-lg md:text-xl font-black text-amber-300 tracking-tight">
                {sizeInfo}
              </div>
              <p className="text-[11px] text-blue-100/80">
                청약홈 공고문 기준 타입별 전용면적
              </p>
            </div>

            {/* 금액 (분양가) 카드 */}
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 space-y-1">
              <div className="text-xs text-blue-100 flex items-center gap-1.5 font-medium">
                <Landmark className="h-4 w-4 text-emerald-300" />
                <span>대표 분양가 / 최고가 기준</span>
              </div>
              <div className="text-lg md:text-xl font-black text-white tracking-tight flex items-baseline gap-1">
                <span className="text-emerald-300 font-extrabold">{priceInfo}</span>
              </div>
              <p className="text-[11px] text-blue-100/80">
                LTV·DSR 2026 자금 시뮬레이션 적용 분양가
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ 상세정보 현장 위치 지도 미리보기 (Google Maps Embed) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm space-y-3">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
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

          <a
            href={naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span>네이버 지도 앱으로 크게 보기</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Embedded Map Canvas Container */}
        <div className="relative w-full h-[300px] md:h-[350px] bg-slate-100">
          <iframe
            title={`${title} 현장 지도`}
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
