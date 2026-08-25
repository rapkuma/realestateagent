"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Mail, Sparkles, X } from "lucide-react";

export function SubscribeModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "구독 신청 중 오류가 발생했습니다.");
      }

      toast.add({
        title: "구독 신청 완료! 🎉",
        description: data.message,
        type: "success",
      });
      setEmail("");
      setIsOpen(false);
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

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-2 text-center pt-2">
          <div className="inline-flex p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg md:text-xl font-extrabold text-slate-900">
            이메일 레터 무료 구독 (선택 기능)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            웹사이트 뉴스레터와 별도로, 매주 신규 청약 브리핑을 이메일로도 받고 싶으신 분들을 위한 알림 서비스입니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              수신 이메일 주소
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-11 text-sm"
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 font-bold text-sm bg-blue-600 hover:bg-blue-700 shadow-md"
          >
            {isLoading ? "신청 처리 중..." : "무료 이메일 알림 신청"}
          </Button>
        </form>

        <p className="text-[11px] text-center text-slate-400">
          스팸 없이 언제든 클릭 한 번으로 수신 해제가 가능합니다.
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 font-bold text-xs md:text-sm shadow-md gap-1.5"
      >
        <Mail className="h-4 w-4" />
        <span>이메일 구독 (부가기능)</span>
      </Button>

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
