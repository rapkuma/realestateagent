"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  FileText,
  Play,
  LogOut,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Newsletter {
  id: string;
  title: string;
  sent_at: string | null;
  created_at: string;
}

interface Subscriber {
  id?: string;
  email: string;
  created_at?: string;
  is_active?: boolean;
}

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'newsletters' | 'subscribers' | 'cron'>('newsletters');

  // Data states
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingNewsletters, setLoadingNewsletters] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  // Search states
  const [newsletterSearch, setNewsletterSearch] = useState('');
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Cron execution state
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);

  // Notification state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchNewsletters = async () => {
    setLoadingNewsletters(true);
    try {
      const res = await fetch('/api/admin/newsletters');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setNewsletters(data.newsletters || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNewsletters(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await fetch('/api/admin/subscribers');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setSubscribers(data.subscribers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
    fetchSubscribers();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/admin/login');
    router.refresh();
  };

  const handleDeleteNewsletter = async (id: string, title: string) => {
    if (!confirm(`정말로 "${title}" 아카이브 글을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/admin/newsletters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '아카이브 글이 삭제되었습니다.' });
        fetchNewsletters();
      } else {
        setMessage({ type: 'error', text: data.error || '삭제 실패' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '서버 에러가 발생했습니다.' });
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`구독자 "${email}"을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '구독자가 삭제되었습니다.' });
        fetchSubscribers();
      } else {
        setMessage({ type: 'error', text: data.error || '삭제 실패' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '서버 에러가 발생했습니다.' });
    }
  };

  const handleRunCron = async () => {
    setCronRunning(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      setCronResult(data);
      if (data.success) {
        setMessage({ type: 'success', text: '크론 자동화 파이프라인이 성공적으로 실행되었습니다!' });
        fetchNewsletters();
        fetchSubscribers();
      } else {
        setMessage({ type: 'error', text: data.error || '크론 실행 중 오류' });
      }
    } catch (err: any) {
      setCronResult({ error: err.message });
      setMessage({ type: 'error', text: '크론 실행 실패' });
    } finally {
      setCronRunning(false);
    }
  };

  // Filtered Lists
  const filteredNewsletters = newsletters.filter((n) =>
    n.title.toLowerCase().includes(newsletterSearch.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg border border-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-none">
                집모아 (ZipMoa) 관리자 대시보드
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">RealEstateAgent Admin v1.0</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              인증됨 (admin)
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 w-full">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800/80 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-rose-400" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Main Body Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Metric 1 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">등록된 아카이브 글</span>
              <div className="text-2xl font-black text-white">
                {loadingNewsletters ? '...' : `${newsletters.length}개`}
              </div>
            </div>
            <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <FileText className="h-6 w-6" />
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">등록된 이메일 구독자</span>
              <div className="text-2xl font-black text-white">
                {loadingSubscribers ? '...' : `${subscribers.length}명`}
              </div>
            </div>
            <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">자동화 수집 파이프라인</span>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                자동 크론 대기 중 (/api/cron)
              </div>
            </div>
            <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Zap className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('newsletters')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 gap-2 flex items-center ${
              activeTab === 'newsletters'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>아카이브 글 관리 ({newsletters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 gap-2 flex items-center ${
              activeTab === 'subscribers'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>구독자 관리 ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cron')}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 gap-2 flex items-center ${
              activeTab === 'cron'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>수동 크론 파이프라인 가동</span>
          </button>
        </div>

        {/* TAB 1: Newsletters Management */}
        {activeTab === 'newsletters' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="제목으로 검색..."
                  value={newsletterSearch}
                  onChange={(e) => setNewsletterSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={fetchNewsletters}
                className="gap-1.5 border-slate-800 text-slate-300 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                새로고침
              </Button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {loadingNewsletters ? (
                <div className="p-12 text-center text-xs text-slate-500">목록을 불러오는 중입니다...</div>
              ) : filteredNewsletters.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">검색 조건에 일치하는 아카이브 글이 없습니다.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                        <th className="p-4 font-bold">제목</th>
                        <th className="p-4 font-bold w-44">발행일</th>
                        <th className="p-4 font-bold w-36 text-right">관리 옵션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredNewsletters.map((item) => {
                        const dateStr = item.sent_at || item.created_at;
                        const formatted = dateStr
                          ? format(new Date(dateStr), 'yyyy년 M월 d일 HH:mm', { locale: ko })
                          : '일정 미정';

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-medium text-slate-200">
                              <span className="line-clamp-1">{item.title}</span>
                              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">ID: {item.id}</span>
                            </td>
                            <td className="p-4 text-slate-400">{formatted}</td>
                            <td className="p-4 text-right space-x-2 shrink-0">
                              <Link href={`/archive/${item.id}`} target="_blank">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2.5 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
                                  title="미리보기"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteNewsletter(item.id, item.title)}
                                className="h-8 px-2.5 border-rose-900/60 text-rose-400 hover:bg-rose-950/80 hover:text-rose-300 text-xs"
                                title="삭제"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Subscribers Management */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="이메일 주소로 검색..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={fetchSubscribers}
                className="gap-1.5 border-slate-800 text-slate-300 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                새로고침
              </Button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {loadingSubscribers ? (
                <div className="p-12 text-center text-xs text-slate-500">구독자 목록을 불러오는 중입니다...</div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">등록되었거나 검색 조건에 일치하는 이메일 구독자가 없습니다.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                        <th className="p-4 font-bold">이메일 주소</th>
                        <th className="p-4 font-bold w-44">가입 일자</th>
                        <th className="p-4 font-bold w-24 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredSubscribers.map((item, idx) => {
                        const dateStr = item.created_at;
                        const formatted = dateStr
                          ? format(new Date(dateStr), 'yyyy.MM.dd HH:mm', { locale: ko })
                          : '가입일 미정';

                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 font-medium text-slate-200 font-mono">
                              {item.email}
                            </td>
                            <td className="p-4 text-slate-400">{formatted}</td>
                            <td className="p-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSubscriber(item.email)}
                                className="h-8 px-2.5 border-rose-900/60 text-rose-400 hover:bg-rose-950/80 text-xs"
                                title="구독 취소/삭제"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Manual Cron Execution */}
        {activeTab === 'cron' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    수동 크론 파이프라인 가동 (/api/cron)
                  </h3>
                  <p className="text-xs text-slate-400">
                    한국부동산원 청약홈 데이터를 실시간 수집하고, 챗GPT(OpenAI)로 20대 프레임워크 심층 분석 포스팅을 생성하여 구독자에게 자동 발송합니다.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleRunCron}
                  disabled={cronRunning}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg shadow-blue-600/25 gap-2"
                >
                  {cronRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>청약 데이터 수집 & AI 분석 실행 중... (최대 30초 소요)</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      <span>수동 크론 파이프라인 즉시 가동하기</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Cron Execution Output Console */}
            {cronResult && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400 font-semibold">실행 결과 로그 (Execution Log)</span>
                  <span className="text-emerald-400 font-bold">
                    {cronResult.executionTime ? `소요 시간: ${cronResult.executionTime}` : ''}
                  </span>
                </div>
                <pre className="text-slate-300 overflow-x-auto p-2 leading-relaxed max-h-96">
                  {JSON.stringify(cronResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
