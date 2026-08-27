"use client";

import { MapPin, ExternalLink } from 'lucide-react';

interface ApartmentHighlightsAndMapProps {
  title: string;
  contentHtml: string;
  locationText: string;
  naverMapUrl: string;
}

export function ApartmentHighlightsAndMap({
  title,
  locationText,
  naverMapUrl,
}: ApartmentHighlightsAndMapProps) {
  // 지도 Embed URL (Google Maps output=embed query - 100% 임베드 허용)
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="my-6">
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
