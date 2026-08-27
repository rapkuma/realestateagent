import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Building2, Sparkles, Shield, Clock, FileText, Lock } from 'lucide-react';
import { ArchiveClientList, NewsletterItem } from '@/app/archive/ArchiveClientList';
import { SubscribeModalButton } from '@/components/SubscribeModal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getNewsletters(): Promise<NewsletterItem[]> {
  try {
    const { data, error } = await supabase
      .from('newsletters')
      .select('id, title, content_html, sent_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ [Homepage] newsletters 조회 실패:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('❌ [Homepage] Supabase 예외:', err);
    return [];
  }
}

export default async function Home() {
  const newsletters = await getNewsletters();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-slate-900 text-lg tracking-tight">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/20">
              <Building2 className="h-5 w-5" />
            </div>
            <span>집모아 (ZipMoa)</span>
          </Link>

          <div className="flex items-center gap-2">
            <SubscribeModalButton />
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>🔑 로그인</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/60 py-10 md:py-12 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-extrabold text-blue-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>⚡ 실시간 청약홈 연동 & AI 자금 시뮬레이션 엔진 탑재</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            🏠 집모아 - 전국 아파트 & 줍줍 분양 심층 뉴스레터
          </h1>

          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            복잡한 공고문을 직접 읽을 필요 없이, 청약홈 실시간 공공데이터와 AI 인공지능 분석으로 
            <strong>분양가·세대수·주담대 대출한도·안전마진·입지</strong>를 정밀 시뮬레이션한 리포트를 제공합니다.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>🛡️ 청약홈 공공데이터 실시간 연동</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>🤖 AI 인공지능 정밀 자금 시뮬레이션</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content: Web Newsletter Article Cards & Status Tabs */}
      <section className="flex-1 max-w-6xl mx-auto px-4 py-8 md:py-12 w-full">
        {newsletters.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-sm">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">등록된 집모아 뉴스레터가 없습니다</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                크론 파이프라인이 실행되면 실시간 청약홈 공고가 뉴스레터 분석글로 자동 수집됩니다.
              </p>
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
