import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Sparkles, FileText } from 'lucide-react';
import { ArchiveClientList, NewsletterItem } from './ArchiveClientList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getNewsletters(): Promise<NewsletterItem[]> {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('id, title, content_html, sent_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ [Archive] newsletters 조회 실패:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('❌ [Archive] Supabase 예외:', err);
    return [];
  }
}

export default async function ArchivePage() {
  const newsletters = await getNewsletters();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            메인 페이지로
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1.5 shadow-sm">
              <Building className="h-3.5 w-3.5" />
              지역별 아파트 청약 리스트
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 px-4 max-w-6xl mx-auto w-full text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold mb-1">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          지역별 필터 & 네이버 지도 연동
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          🏢 전국 아파트 분양 물건별 청약 리스트
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          서울, 경기, 전북 등 희망하는 지역을 선택하여 아파트 물건별 분양가, 자금 조달 시뮬레이션, 4대 입지 리포트를 한눈에 비교해 보세요.
        </p>
      </section>

      {/* Interactive Region Filter & Cards Content */}
      <section className="flex-1 max-w-6xl mx-auto px-4 pb-16 w-full">
        {newsletters.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-sm">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">등록된 아파트 분양 물건이 없습니다</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                크론 자동화 파이프라인(`/api/cron`)이 실행되면 청약홈 실시간 공고 데이터가 지역별로 자동 분석되어 아카이빙됩니다.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/api/cron" target="_blank">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-xs">
                  ⚡ 실시간 청약 물건 수집 & 분석 실행하기
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full text-xs">
                  메인으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ArchiveClientList initialNewsletters={newsletters} />
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} 집모아 (ZipMoa) - AI 부동산 분양 정보 자동화 서비스</p>
          <p>데이터 출처: 한국부동산원 청약홈 공공데이터 · 위치 연동: 네이버 지도</p>
        </div>
      </footer>
    </main>
  );
}
