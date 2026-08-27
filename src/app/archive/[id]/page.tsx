import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Building2,
  ListOrdered,
  MapPin,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Metadata } from 'next';
import { generateNewsArticleJsonLd, generateFAQPageJsonLd } from '@/lib/jsonld';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

function parseAptName(title: string): string {
  const match = title.match(/\[(.*?)\]/);
  return match ? match[1] : title;
}

async function getNewsletter(id: string) {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }
    return data;
  } catch (err) {
    console.error('❌ [Archive Detail] Supabase 예외:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const newsletter = await getNewsletter(id);
  
  if (!newsletter) {
    return { title: 'Not Found' };
  }
  
  return {
    title: newsletter.title,
    description: newsletter.meta_description || '청약 헬퍼의 부동산 분석 리포트입니다.',
    openGraph: {
      title: newsletter.title,
      description: newsletter.meta_description || '청약 헬퍼의 부동산 분석 리포트입니다.',
      type: 'article',
      publishedTime: newsletter.sent_at || newsletter.created_at,
    },
  };
}

export default async function ArchiveDetailPage({ params }: PageProps) {
  const { id } = await params;
  const newsletter = await getNewsletter(id);

  if (!newsletter) {
    notFound();
  }

  const displayDate = newsletter.sent_at || newsletter.created_at;
  const formattedDate = displayDate
    ? format(new Date(displayDate), 'yyyy년 M월 d일 (EEEE)', { locale: ko })
    : '발행일 미정';

  const aptName = parseAptName(newsletter.title);
  const locationMatch = newsletter.content_html?.match(/📍 공급위치<\/td>\s*<td[^>]*>(.*?)<\/td>/) || newsletter.content_html?.match(/📍 공급 위치: <strong>(.*?)<\/strong>/);
  const locationText = locationMatch ? locationMatch[1].replace(/<[^>]*>/g, '').trim() : aptName;
  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(locationText)}`;

  const articleJsonLd = generateNewsArticleJsonLd(
    newsletter.title,
    id, // using id as slug here
    displayDate
  );

  const faqJsonLd = newsletter.faq_json ? generateFAQPageJsonLd(newsletter.faq_json) : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {/* Header Navigation */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-700 hover:text-slate-900 font-bold">
              <ArrowLeft className="h-4 w-4" />
              메인으로
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <a href={naverMapUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold shadow-sm">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>네이버 지도 보기</span>
                <ExternalLink className="h-3 w-3 text-emerald-500" />
              </Button>
            </a>
            <Link href="/">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm">
                무료 구독하기
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Article Content Area */}
      <article className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
        {/* Main Article Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
          
          {/* Article Header */}
          <div className="space-y-4 border-b border-slate-100 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <Sparkles className="h-3 w-3" />
                  집모아 (ZipMoa) 전면 심층 분석 리포트
                </span>
                <span className="text-xs text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <time>{formattedDate}</time>
                </div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {newsletter.title}
            </h1>
            <p className="text-sm text-slate-500">
              한국부동산원 청약홈 공식 데이터와 네이버 지도를 기반으로 자금 시뮬레이션 및 4대 입지를 심층 분석한 리포트입니다.
            </p>
          </div>

          {/* Legal Disclaimer Warning Banner (Top) */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 block text-xs">⚠️ [법적 고지 및 유의사항 안내]</span>
              <p>
                본 리포트는 공공데이터 및 AI 수집 기반의 정보 참고용 분석 자료입니다. 주택 타입별 세부 분양가, 청약 자격 요건, 상세 일정 등은 사업주체(시공사/시행사)의 사정에 따라 변동될 수 있으므로, <strong>청약 신청 전 반드시 한국부동산원 청약홈(www.applyhome.co.kr)의 공식 입주자모집공고문을 직접 최종 대조·확인</strong>하시기 바랍니다.
              </p>
            </div>
          </div>

          {/* Quick Framework TOC Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ListOrdered className="h-4 w-4 text-blue-600" />
                <span>본 리포트 20대 핵심 분석 목차</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs text-slate-600">
              <div className="flex flex-col gap-1.5 bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                <span className="text-blue-600 font-bold mb-1">📋 개요 및 규모</span>
                <span className="text-[11px] text-slate-500 line-clamp-2">청약개요, 공고문, 공급규모, 홈페이지</span>
              </div>
              <div className="flex flex-col gap-1.5 bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                <span className="text-blue-600 font-bold mb-1">🗓️ 청약 일정</span>
                <span className="text-[11px] text-slate-500 line-clamp-2">접수, 당첨자발표, 계약일정 등</span>
              </div>
              <div className="flex flex-col gap-1.5 bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                <span className="text-blue-600 font-bold mb-1">💰 분양가 및 자금</span>
                <span className="text-[11px] text-slate-500 line-clamp-2">세대수, 안전마진, 대출조건(2026.8규제)</span>
              </div>
              <div className="flex flex-col gap-1.5 bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                <span className="text-blue-600 font-bold mb-1">🏙️ 입지 및 분석</span>
                <span className="text-[11px] text-slate-500 line-clamp-2">위치, 인프라, 호재, 비교단지 분석</span>
              </div>
              <div className="flex flex-col gap-1.5 bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm">
                <span className="text-blue-600 font-bold mb-1">✅ 자격 및 전략</span>
                <span className="text-[11px] text-slate-500 line-clamp-2">청약자격, 제한사항, 전략, 주의사항</span>
              </div>
            </div>
          </div>

          {/* HTML Content Body */}
          <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-table:w-full prose-table:border-collapse prose-td:p-2.5 prose-th:p-2.5 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: newsletter.content_html }}
          />

          {/* Legal Disclaimer Warning Banner (Bottom) */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-sm my-6">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 block text-xs">📢 [청약홈 공식 공고 최종 확인 당부]</span>
              <p>
                본 분석 자료는 참고용으로만 제공되며, 법적 투자/청약 책임의 근거 자료로 활용될 수 없습니다. 실제 청약 접수 및 계좌 입금 전 반드시 <strong>한국부동산원 청약홈(www.applyhome.co.kr)</strong>의 원본 모집공고문을 대조·확인 후 신청해주시기 바랍니다.
              </p>
            </div>
          </div>

          {/* Bottom CTA Box */}
          <div className="mt-12 pt-8 border-t border-slate-100 bg-gradient-to-br from-blue-50/50 to-slate-50 rounded-2xl p-6 md:p-8 text-center space-y-4 border border-blue-100">
            <div className="inline-flex p-2.5 bg-white rounded-full shadow-sm text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                다음 주 청약 줍줍 & 안전마진 정보를 이메일로 받아보세요!
              </h3>
              <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                복잡한 공고문 대신 네이버 지도 연동 20대 프레임워크로 요약된 핵심 리포트를 매주 가장 빠르게 전해드립니다.
              </p>
            </div>
            <div className="pt-1 flex justify-center gap-3 flex-wrap">
              <a href={naverMapUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="px-6 h-11 border-emerald-400 text-emerald-800 hover:bg-emerald-50 font-bold gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>네이버 지도로 현장 확인</span>
                </Button>
              </a>
              <Link href="/">
                <Button className="px-8 h-11 bg-blue-600 hover:bg-blue-700 font-bold shadow-md">
                  지금 무료 구독하기 (3초 소요)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} 집모아 (ZipMoa) - AI 부동산 분양 정보 자동화 서비스</p>
          <p className="text-slate-500 font-medium">
            도즈소프트 | 대표: 김인중 | 사업자등록번호: 402-20-88549 | 이메일: dozesoft@gmail.com
          </p>
          <p className="text-slate-400">데이터 출처: 한국부동산원 청약홈 공공데이터 · 위치 정보: 네이버 지도</p>
        </div>
      </footer>
    </main>
  );
}
