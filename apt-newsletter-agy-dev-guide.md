# 🏢 부동산 청약 정보 자동화 뉴스레터 프로젝트 (agy CLI 전용 가이드)

본 문서는 `agy`(Antigravity CLI) 에이전트가 부동산 청약 정보 자동화 뉴스레터 및 블로그 웹사이트를 처음부터 끝까지 개발하기 위한 **시스템 지시서(System Prompt) 및 구조도**입니다. `agy`는 작업 시작 전 반드시 이 문서를 정독하고 지침을 준수해야 합니다.

---

## 1. 프로젝트 개요 및 기술 스택
*   **목적:** 한국부동산원 청약홈 API 데이터를 수집해 OpenAI로 요약 가공한 뒤, 웹사이트(블로그)에 아카이빙하고 구독자에게 이메일 뉴스레터를 자동 발송.
*   **프론트엔드:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
*   **UI/UX 디자인:** Shadcn UI (Style: New York, Color: Slate)
*   **백엔드/인프라:** Vercel (배포 및 Cron Jobs), Supabase (PostgreSQL V2)
*   **이메일 파이프라인:** Resend API, React Email
*   **주요 라이브러리:** `fast-xml-parser`(공공데이터 변환), `date-fns`(날짜 처리), `openai`

---

## 2. 🚨 agy 핵심 행동 규칙 (Rules & Superpowers)

1.  **데이터 무결성 강제 (Anti-Hallucination):** 
    *   AI(LLM) 요약 파이프라인을 구축할 때 프롬프트에 반드시 **"분양가, 세대수, 청약일정 숫자는 절대 임의로 가공/추측하지 말 것"**을 명시하도록 코드를 작성한다. 빈 데이터는 '미정'으로 표기한다.
2.  **프론트엔드 디자인 제약 (Frontend-Design):** 
    *   독자적인 CSS 작성을 금지한다. 모든 스타일링은 **Tailwind CSS**를 사용한다.
    *   UI 컴포넌트는 반드시 **Shadcn UI**(`Button`, `Input`, `Card`, `Toast` 등)를 추가하여 사용한다.
3.  **Vercel 환경 제약 인지:** 
    *   Vercel 서버리스 함수의 10초 타임아웃을 고려하여 API Route를 설계한다. 무거운 작업 시 최적화 로직을 반영한다.
4.  **MCP(Model Context Protocol) 활용:** 
    *   필요 시 `postgres` MCP를 통해 Supabase 스키마를 확인 및 마이그레이션하고, 최신 문서가 필요할 땐 `fetch` MCP로 공식 문서를 검색하여 환각을 방지한다.

---

## 3. 데이터베이스 스키마 설계 (Supabase)

DB 구축 시 다음 3개의 핵심 테이블을 구성한다.

1.  **`apartments`**: 청약홈 API 원본 데이터
    *   `id` (uuid, PK), `apt_name` (text), `location` (text), `price_info` (text), `apply_date` (date)
2.  **`newsletters`**: AI가 가공한 블로그용 콘텐츠
    *   `id` (uuid, PK), `title` (text), `content_html` (text), `sent_at` (timestamp)
3.  **`subscribers`**: 뉴스레터 구독자 목록
    *   `id` (uuid, PK), `email` (text, unique), `is_active` (boolean, default: true), `created_at` (timestamp)

---

## 4. 단계별 개발 마일스톤 (Step-by-Step Implementation)

agy는 아래의 순서대로 프로젝트를 구축한다.

### Step 1: 프로젝트 초기화 및 필수 패키지 설치
*   Next.js 프로젝트를 셋업하고, Shadcn UI를 초기화(`npx shadcn-ui@latest init`)한다.
*   필수 패키지를 설치한다: `@supabase/supabase-js`, `resend`, `openai`, `react-email`, `@react-email/components`, `fast-xml-parser`, `date-fns`

### Step 2: 프론트엔드 (구독 랜딩 페이지) 개발
*   `src/app/page.tsx`에 뉴스레터 소개 및 이메일 수집 폼을 개발한다.
*   Shadcn UI의 `Input`, `Button`을 배치하고, 구독 완료 시 `Toast` 알림을 띄운다.
*   API Route(`/api/subscribe`)를 만들어 Supabase `subscribers` 테이블에 이메일을 저장하는 로직을 연동한다.

### Step 3: 핵심 백엔드 파이프라인 (자동화 스크립트) 개발
*   `src/app/api/cron/route.ts` 파일에 Vercel Cron 엔드포인트를 구축한다. 
    1.  **Fetch API:** 한국부동산원 청약홈 API 호출 및 `fast-xml-parser`로 JSON 파싱. 오늘 기준 유효 공고 필터링.
    2.  **LLM 가공:** 필터링된 데이터를 OpenAI API로 전달하여 뉴스레터용 HTML/Markdown 본문 생성.
    3.  **DB 저장:** 생성된 결과물을 `newsletters` 테이블에 저장.
    4.  **이메일 발송:** Supabase에서 활성 상태(`is_active=true`)인 이메일 목록을 불러와 React Email로 감싼 후 Resend로 일괄 전송.

### Step 4: 블로그(아카이브) 페이지 개발
*   `src/app/archive/page.tsx` 및 `[id]` 동적 라우팅을 통해 `newsletters` 테이블에 저장된 과거 발송본을 Shadcn `Card` 컴포넌트를 이용해 그리드 형태로 렌더링한다.
