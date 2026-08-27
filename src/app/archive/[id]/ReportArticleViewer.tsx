"use client";

import { useEffect, useRef } from 'react';
import { ListOrdered, AlertTriangle } from 'lucide-react';

interface ReportArticleViewerProps {
  contentHtml: string;
}

export function ReportArticleViewer({ contentHtml }: ReportArticleViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToKeyword = (keywords: string[]) => {
    if (!containerRef.current) return;

    // 1. article container 내부의 모든 h1, h2, h3, h4, th, td, strong, p 검색
    const elements = Array.from(
      containerRef.current.querySelectorAll('h1, h2, h3, h4, th, td, strong, p, div')
    );

    // 2. 키워드 일치하는 첫 번째 요소 탐색
    for (const kw of keywords) {
      const match = elements.find((el) => {
        const text = el.textContent || '';
        return text.includes(kw) && text.length < 100;
      });

      if (match) {
        // 스티키 헤더 높이(약 80px) 고려하여 smooth 스크롤
        const yOffset = -90;
        const y = match.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });

        // 잠시 시각적 하이라이트 애니메이션
        match.classList.add('bg-blue-100/70', 'transition-all', 'duration-500', 'rounded-md', 'p-1');
        setTimeout(() => {
          match.classList.remove('bg-blue-100/70', 'p-1');
        }, 2000);

        break;
      }
    }
  };

  const tocItems = [
    {
      title: '📋 개요 및 규모',
      desc: '청약개요, 공고문, 공급규모, 공식홈페이지',
      keywords: ['개요', '공급규모', '단지개요', '기본 정보', '사업개요'],
    },
    {
      title: '🗓️ 청약 일정',
      desc: '접수일, 당첨자발표, 계약일정',
      keywords: ['청약 일정', '주요 일정', '접수일', '당첨자 발표', '입주예정'],
    },
    {
      title: '💰 분양가 및 자금',
      desc: '세대수, 안전마진, 대출조건, 분양가',
      keywords: ['분양가', '공급금액', '자금 조달', '대출', '안전마진'],
    },
    {
      title: '🏙️ 입지 및 분석',
      desc: '위치, 교통인프라, 입지환경, 비교단지',
      keywords: ['입지', '교통', '인프라', '환경 분석', '주요 입지'],
    },
    {
      title: '✅ 자격 및 전략',
      desc: '청약자격, 재당첨제한, 당첨전략',
      keywords: ['청약 자격', '신청 자격', '당첨 전략', '유의사항', '제한사항'],
    },
  ];

  return (
    <div className="space-y-8" ref={containerRef}>
      {/* Interactive Framework TOC Box */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 md:p-6 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            <ListOrdered className="h-4 w-4 text-blue-600" />
            <span>본 리포트 20대 핵심 분석 목차 (클릭 시 바로 이동)</span>
          </div>
          <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            👇 목차 항목 클릭 시 해당 문단 스크롤
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          {tocItems.map((item) => (
            <button
              key={item.title}
              onClick={() => scrollToKeyword(item.keywords)}
              className="flex flex-col text-left gap-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span className="text-blue-700 font-extrabold text-xs group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{item.title}</span>
                <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-2 leading-snug group-hover:text-slate-700">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* HTML Content Body */}
      <div
        className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-table:w-full prose-table:border-collapse prose-td:p-2.5 prose-th:p-2.5 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
