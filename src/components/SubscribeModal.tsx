"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Mail, Sparkles, X, MapPin, Bell } from "lucide-react";

export function SubscribeModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<string>("전국");
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
        body: JSON.stringify({ email, region }),
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
            이메일 레터 무료 구독
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            신규 청약 및 무순위 줍줍 공고 발생 시 실시간 이메일 브리핑을 보내드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Region Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>희망 수신 지역 선택</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {["전국", "서울", "경기", "인천", "전북", "기타"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    region === r
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {r === "전국" ? "🌐 전국" : `📍 ${r}`}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-blue-600" />
              <span>수신 이메일 주소</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-11 text-sm font-medium"
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 font-bold text-sm bg-blue-600 hover:bg-blue-700 shadow-md cursor-pointer"
          >
            {isLoading ? "신청 처리 중..." : "🚀 무료 이메일 알림 신청"}
          </Button>
        </form>

        <div className="flex items-start gap-1.5 bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900 leading-normal">
          <Bell className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <span>선택하신 희망 지역의 신규 무순위(줍줍) 및 1순위 청약 공고 발생 시 즉시 전송해 드립니다.</span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 font-bold text-xs md:text-sm shadow-md gap-1.5 cursor-pointer"
      >
        <Mail className="h-4 w-4" />
        <span>이메일 구독 (무료)</span>
      </Button>

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
