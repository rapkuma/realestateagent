# 🏢 부동산 청약 정보 자동화 뉴스레터 프로젝트 (agy CLI 전용 마스터 가이드)

본 문서는 `agy`(Antigravity CLI) 에이전트가 부동산 청약 정보 자동화 뉴스레터 및 블로그 웹사이트를 처음부터 끝까지 개발하기 위한 **시스템 지시서(System Prompt), 아키텍처 명세 및 검색/AI 엔진 노출 최적화(SEO/AEO/GEO/JSON-LD) 가이드**입니다. `agy`는 작업 시작 전 반드시 이 문서를 정독하고 지침을 엄격히 준수해야 합니다.

---

## 1. 프로젝트 개요 및 기술 스택
*   **목적:** 한국부동산원 청약홈 API 데이터를 수집해 OpenAI로 요약 가공한 뒤, 웹사이트(블로그)에 아카이빙하고 구독자에게 이메일 뉴스레터를 자동 발송.
*   **프론트엔드:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
*   **UI/UX 디자인:** Shadcn UI (Style: New York, Color: Slate)
*   **백엔드/인프라:** Vercel (배포 및 Cron Jobs), Supabase (PostgreSQL V2)
*   **이메일 파이프라인:** Resend API, React Email
*   **주요 라이브러리:** `fast-xml-parser`(공공데이터 변환), `date-fns`(날짜 처리), `openai`, `schema-dts`(타입 세이프 구조화 데이터)

---

## 2. 🚨 agy 핵심 행동 규칙 (Rules & Superpowers)

1.  **데이터 무결성 강제 (Anti-Hallucination):** 
    *   AI(LLM) 요약 파이프라인 구축 시 프롬프트에 반드시 **"분양가, 세대수, 청약일정 숫자는 절대 임의로 가공/추측하지 말 것"**을 명시. 빈 데이터는 '미정'으로 표기.
2.  **프론트엔드 디자인 제약 (Frontend-Design):** 
    *   독자적인 CSS 작성 금지. 모든 스타일링은 **Tailwind CSS** 사용.
    *   UI 컴포넌트는 반드시 **Shadcn UI**(`Button`, `Input`, `Card`, `Toast` 등)를 추가하여 사용.
3.  **Vercel 환경 제약 인지:** 
    *   Vercel 서버리스 함수의 타임아웃을 고려하여 API Route 설계. 무거운 작업 시 최적화 로직 반영.
4.  **MCP(Model Context Protocol) 활용:** 
    *   `postgres` MCP로 Supabase 스키마를 확인/마이그레이션하고, 최신 문서 필요 시 `fetch` MCP로 공식 문서를 검색하여 환각 방지.

---

## 3. 🌐 검색 및 AI 엔진 노출 최적화 (SEO · AEO · GEO · JSON-LD · llms.txt)

구글/네이버 전통 검색(SEO)뿐만 아니라 Perplexity, ChatGPT, Claude 등의 답변 엔진(AEO/GEO)에서 우리 사이트의 청약 분석 글을 소스로 인용하도록 완벽한 메타데이터와 구조화 데이터를 심어야 합니다.

### 3.1. Technical & On-Page SEO (Next.js App Router)
*   **Metadata API (`generateMetadata`):** 모든 동적 블로그/뉴스레터 페이지(`src/app/archive/[id]/page.tsx`)에 동적 Title, Description, Canonical URL, OpenGraph, Twitter Card 메타태그 자동 생성.
*   **동적 `sitemap.ts` & `robots.ts`:**
    *   `src/app/sitemap.ts`: Supabase의 `newsletters` 테이블 전체 URL 목록을 실시간 반영하는 동적 사이트맵 자동 서빙.
    *   `src/app/robots.ts`: 모든 정상 크롤러(Googlebot, Yeti 등) 및 AI 크롤러(GPTBot, PerplexityBot, ClaudeBot)의 인덱싱 허용.
*   **동적 OpenGraph 이미지 (`opengraph-image.tsx`):**
    *   `@vercel/og`를 활용하여 글 제목, 청약 접수일, 핵심 분양가가 들어간 1200x630 SNS 공유 썸네일을 자동 생성.

### 3.2. JSON-LD 구조화 데이터 (Schema.org)
모든 뉴스레터 상세 페이지 상단에 `<script type="application/ld+json">` 태그를 주입하여 구글 서치 콘솔 리치 스니펫과 AI 엔진의 직접 파싱을 지원.

*   **`NewsArticle` / `BlogPosting`:** 아티클 제목, 작성일(`datePublished`), 수정일(`dateModified`), 작성자(`Person`/`Organization`).
*   **`RealEstateListing` / `Place`:** 분양 아파트 이름, 위치 주소(`address`), 가격 정보.
*   **`FAQPage`:** AI가 자주 인용할 수 있도록 하단에 "1순위 청약일은 언제인가요?", "평당 분양가는 얼마인가요?" 형태의 FAQ Schema 삽입.
*   **`BreadcrumbList`:** 사이트 내 탐색 경로 구조화.

### 3.3. AEO (Answer Engine Optimization) & GEO (Generative Engine Optimization)
*   **TL;DR Summary 블록 (역피라미드 구조):** 아티클 최상단에 AI가 즉시 답변(Snippet)으로 인출할 수 있도록 **"3줄 핵심 요약 (아파트명, 1순위 청약일, 평당 분양가)"** 블록을 마크다운/HTML 상단에 항상 배치.
*   **정형화된 표(Table) 및 FAQ 섹션:** LLM은 복잡한 서술보다 표(Markdown Table)와 질의응답(FAQ) 형태의 텍스트를 답변 소스로 가장 높은 가중치로 인용함.

### 3.4. AI 전용 엔드포인트 (`llms.txt` & `llms-full.txt`)
*   최신 LLM 에이전트 표준에 맞춰 루트 디렉토리에 `public/llms.txt` 및 `public/llms-full.txt`를 생성/동적 제공.
*   사이트 소개, 최신 분양 청약 정보 요약 요약본을 마크다운 형식으로 가볍게 크롤링할 수 있도록 엔드포인트 구성.

---

## 4. 데이터베이스 스키마 설계 (Supabase)

1.  **`apartments`**: 청약홈 API 원본 데이터
    *   `id` (uuid, PK), `apt_name` (text), `location` (text), `price_info` (text), `apply_date` (date), `created_at` (timestamp)
2.  **`newsletters`**: AI가 가공한 블로그용 콘텐츠 & SEO 메타데이터
    *   `id` (uuid, PK), `slug` (text, unique), `title` (text), `meta_description` (text), `content_html` (text), `faq_json` (jsonb), `published_at` (timestamp), `sent_at` (timestamp)
3.  **`subscribers`**: 뉴스레터 구독자 목록
    *   `id` (uuid, PK), `email` (text, unique), `is_active` (boolean, default: true), `created_at` (timestamp)

---

## 5. 단계별 개발 마일스톤 (Step-by-Step Implementation)

`agy`는 아래 순서대로 프로젝트를 구축한다.

### Step 1: 프로젝트 초기화 및 환경 세팅
*   Next.js 14+ 프로젝트 생성 및 Shadcn UI 초기화(`npx shadcn-ui@latest init`).
*   필수 패키지 설치: `@supabase/supabase-js`, `resend`, `openai`, `react-email`, `@react-email/components`, `fast-xml-parser`, `date-fns`, `schema-dts`, `@vercel/og`

### Step 2: SEO/AEO/GEO 및 메타 인프라 구축
*   `src/app/robots.ts`, `src/app/sitemap.ts`, `public/llms.txt` 생성.
*   구조화 데이터를 만들어주는 헬퍼 함수 `src/lib/jsonld.ts` 생성.

### Step 3: 프론트엔드 (구독 랜딩 & 아카이브 블로그) 개발
*   `src/app/page.tsx`: Shadcn UI 기반 랜딩 페이지, 이메일 수집 폼, Toast 알림.
*   `src/app/archive/page.tsx`: 과거 뉴스레터 카드 리스트 (검색 엔진 인덱싱 대상).
*   `src/app/archive/[slug]/page.tsx`: 상세 페이지. **동적 generateMetadata + JSON-LD 주입 + TL;DR 요약 블록 + FAQ 섹션 + React Email 렌더링** 결합.

### Step 4: 핵심 백엔드 파이프라인 (자동화 스크립트) 개발
*   `src/app/api/cron/route.ts` (Vercel Cron)
    1.  **Fetch API:** 청약홈 API 호출 및 파싱.
    2.  **LLM 가공 (OpenAI):** 
        *   뉴스레터 본문 HTML
        *   SEO Title & Meta Description
        *   FAQ 3문 3답 (JSON)
        *   URL용 영문/한글 슬러그(Slug)
    3.  **DB 저장:** `newsletters` 테이블에 모든 메타데이터와 함께 저장.
    4.  **이메일 발송:** 활성 구독자 대상 Resend 발송.
