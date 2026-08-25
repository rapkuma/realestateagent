"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Mail, ShieldCheck, Zap, FileText, ArrowRight, BookOpen } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.add({
        title: "이메일 입력 필요",
        description: "구독하실 이메일 주소를 입력해 주세요.",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "구독 신청 중 오류가 발생했습니다.");
      }

      toast.add({
        title: "구독 완료! 🎉",
        description: data.message,
        type: "success",
      });
      setEmail("");
    } catch (error: any) {
      toast.add({
        title: "구독 실패",
        description: error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 max-w-4xl mx-auto w-full">
      {/* Top Archive Link Header */}
      <div className="w-full flex justify-end mb-6">
        <Link href="/archive">
          <Button variant="outline" size="sm" className="gap-2 text-slate-600 hover:text-slate-900 shadow-sm">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>지난 뉴스레터 보기</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-800 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          실시간 청약 정보 서비스
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          🏢 청약 헬퍼 뉴스레터
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          매주 쏟아지는 아파트 청약 정보, 복잡한 공고문을 직접 볼 필요 없이 AI가 핵심 분양가, 세대수, 일정을 3분 요약하여 메일로 보내드립니다.
        </p>
      </div>

      {/* Subscription Form */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              이메일 주소
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-11"
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-semibold">
            {isLoading ? "구독 신청 중..." : "지금 바로 무료 구독하기"}
          </Button>
        </form>
        <p className="text-xs text-center text-slate-400 leading-relaxed">
          스팸 메일은 절대 발송하지 않으며, 언제든 클릭 한 번으로 구독을 해제하실 수 있습니다.
        </p>
      </div>

      {/* Feature Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 w-full">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex gap-4">
          <div className="p-2 h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 text-sm">AI 핵심 요약</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              수십 페이지의 모집공고문에서 분양가, 세대수, 특별공급 일정을 AI가 명확하게 요약합니다.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex gap-4">
          <div className="p-2 h-10 w-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 text-sm">100% 무결성 정보</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              가이드 규칙에 따라 주요 수치 정보는 왜곡이나 추측 없이 청약홈의 원본을 제공합니다.
            </p>
          </div>
        </div>

        {/* Card 3: Link to Archive */}
        <Link href="/archive" className="block group">
          <div className="bg-white border border-slate-200 group-hover:border-blue-300 group-hover:shadow-md transition-all rounded-xl p-5 shadow-sm flex gap-4 h-full">
            <div className="p-2 h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">과거 이력 아카이브</h3>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                웹 아카이브 블로그를 통해 지난 뉴스레터 발송본 및 청약 정보를 언제든 모아볼 수 있습니다.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
