import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🏠 집모아 (ZipMoa) - AI 부동산 분양 & 입지 심층 뉴스레터",
  description: "한국부동산원 청약홈 공공데이터 기반 AI 부동산 분양가, 세대수, 대출한도, 안전마진 정밀 분석 뉴스레터",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
