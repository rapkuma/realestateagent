"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ArrowRight,
  MapPin,
  Tag,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Building2,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export type DateStatus = 'TODAY' | 'ENDED' | 'UPCOMING';

export function checkDateStatus(contentHtml: string, title?: string): { status: DateStatus; applyDateStr?: string } {
  if (!contentHtml && !title) return { status: 'ENDED' };

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const fullText = (title || '') + ' ' + (contentHtml || '');

  // 1. 팩트 박스 또는 본문에서 청약 접수일 패턴 (HTML 태그 허용하여 YYYY-MM-DD 또는 YYYY.MM.DD 정확히 매칭)
  const applyMatch = fullText.match(/(?:청약\s*접수일|청약접수일|접수일)[\s\S]{0,150}?(202[4-9][-.]\d{2}[-.]\d{2})/i) ||
                     fullText.match(/RCEPT_BGNDE[\s\S]{0,50}?(202[4-9][-.]\d{2}[-.]\d{2})/i);

  if (applyMatch) {
    const applyDate = applyMatch[1].replace(/\./g, '-');
    if (applyDate === todayStr) {
      return { status: 'TODAY', applyDateStr: applyDate };
    } else if (applyDate < todayStr) {
      return { status: 'ENDED', applyDateStr: applyDate };
    } else {
      return { status: 'UPCOMING', applyDateStr: applyDate };
    }
  }

  // 2. 제목에 (오늘 접수) 또는 (오늘 접수중) 포함 시에만 TODAY 인지
  if (title && (title.includes('오늘 접수') || title.includes('오늘 접수중'))) {
    return { status: 'TODAY', applyDateStr: todayStr };
  }

  // 3. 접수일 매칭 실패 시 기본값은 ENDED (마감) 처리하여 과거 단지가 오늘 접수로 오분류되는 버그 차단
  return { status: 'ENDED' };
}

export interface NewsletterItem {
  id: string;
  title: string;
  content_html: string;
  sent_at: string | null;
  created_at: string;
}

const REGION_MAP: { [key: string]: string } = {
  서울: '서울',
  경기: '경기',
  인천: '인천',
  부산: '부산',
  대구: '대구',
  대전: '대전',
  광주: '광주',
  울산: '울산',
  세종: '세종',
  강원: '강원',
  충북: '충북',
  충남: '충남',
  전북: '전북',
  전남: '전남',
  경북: '경북',
  경남: '경남',
  제주: '제주',
};

// 텍스트/HTML에서 지역 감지 헬퍼
export function detectRegion(title: string, contentHtml: string): string {
  const text = `${title} ${contentHtml}`;
  if (/서울|서초|강남|송파|용산|마포|영등포|성동|노원|은평|강동|강서|동작|관악/.test(text)) return '서울';
  if (/경기|구리|성남|분당|판교|수원|용인|고양|일산|화성|동탄|하남|과천|안양|부천|남양주|평택|시흥|파주|의정부|김포|광명|군포|이천|오산|안성|의왕|양주|포천|여주|동두천|가평|양평|연천/.test(text)) return '경기';
  if (/인천|송도|청라|검단|부평|미추홀|연수|남동/.test(text)) return '인천';
  if (/부산|해운대|수영|부산진|동래|남구|연제|사하|금정|북구|강서구|사상|기장/.test(text)) return '부산';
  if (/대구|수성|달서|중구|동구|서구|남구|북구|달성|군위/.test(text)) return '대구';
  if (/대전|유성|서구|중구|동구|대덕/.test(text)) return '대전';
  if (/광주|광산|서구|남구|북구|동구/.test(text)) return '광주';
  if (/울산|남구|중구|북구|동구|울주/.test(text)) return '울산';
  if (/세종/.test(text)) return '세종';
  if (/전북|전주|익산|군산|정읍|남원|김제|완주|진안|무주|장수|임실|순창|고창|부안/.test(text)) return '전북';
  if (/전남|여수|순천|목포|나주|광양|담양|곡성|구례|고흥|보성|화순|장흥|강진|해남|영암|무안|함평|영광|장성|완도|진도|신안/.test(text)) return '전남';
  if (/충남|천안|아산|서산|당진|공주|보령|논산|계룡|금산|부여|서천|청양|홍성|예산|태안/.test(text)) return '충남';
  if (/충북|청주|충주|제천|보은|옥천|영동|증평|진천|괴산|음성|단양/.test(text)) return '충북';
  if (/경북|포항|구미|경주|김천|안동|영주|영천|상주|문경|경산|의성|청송|영양|영덕|청도|고령|성주|칠곡|예천|봉화|울진|울릉/.test(text)) return '경북';
  if (/경남|창원|김해|양산|진주|거제|통영|사천|밀양|의령|함안|창녕|고성|남해|하동|산청|함양|거창|합천/.test(text)) return '경남';
  if (/강원|춘천|원주|강릉|동해|태백|속초|삼척|홍천|횡성|영월|평창|정선|철원|화천|양구|인제|고성|양양/.test(text)) return '강원';
  if (/제주|서귀포/.test(text)) return '제주';
  return '기타';
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function parseAptName(title: string): string {
  const match = title.match(/\[(.*?)\]/);
  return match ? match[1] : '청약 분양 물건';
}

export function cleanTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/평형별 세대수·분양가·2026\.8주담대절대한도 자금시뮬레이션 심층 분석/g, '')
    .replace(/평형별 세대수·분양가·2026\.8대출규제 자금시뮬레이션 심층 분석/g, '')
    .replace(/평형별 세대수 및 자금 조달 시뮬레이션 리포트/g, '')
    .replace(/평형별 세대수 및 2026\.8 대출규제 안전마진 총정리/g, '')
    .replace(/자금시뮬레이션 심층 분석/g, '')
    .trim();
}

const REGION_COLORS: { [key: string]: string } = {
  서울: 'bg-rose-50 text-rose-700 border-rose-200/80',
  경기: 'bg-blue-50 text-blue-700 border-blue-200/80',
  인천: 'bg-sky-50 text-sky-700 border-sky-200/80',
  전북: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  전남: 'bg-teal-50 text-teal-700 border-teal-200/80',
  충남: 'bg-amber-50 text-amber-700 border-amber-200/80',
  충북: 'bg-yellow-50 text-yellow-700 border-yellow-200/80',
  부산: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  대구: 'bg-purple-50 text-purple-700 border-purple-200/80',
  대전: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  광주: 'bg-lime-50 text-lime-700 border-lime-200/80',
  울산: 'bg-orange-50 text-orange-700 border-orange-200/80',
  세종: 'bg-violet-50 text-violet-700 border-violet-200/80',
  강원: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  경북: 'bg-pink-50 text-pink-700 border-pink-200/80',
  경남: 'bg-red-50 text-red-700 border-red-200/80',
  제주: 'bg-amber-50 text-amber-700 border-amber-200/80',
  기타: 'bg-slate-100 text-slate-700 border-slate-200',
};

const ALL_REGIONS = [
  '전체',
  '서울',
  '경기',
  '인천',
  '전북',
  '충남',
  '충북',
  '부산',
  '대구',
  '대전',
  '광주',
  '울산',
  '세종',
  '강원',
  '전남',
  '경북',
  '경남',
  '제주',
];

interface ArchiveClientListProps {
  initialNewsletters: NewsletterItem[];
}

export function ArchiveClientList({ initialNewsletters }: ArchiveClientListProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'ENDED'>('ALL');
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'name'>('latest');

  // 각 아이템에 감지된 지역 및 청약 상태 부여
  const itemsWithMeta = useMemo(() => {
    return initialNewsletters.map((item) => {
      const region = detectRegion(item.title, item.content_html);
      const aptName = parseAptName(item.title);
      const { status, applyDateStr } = checkDateStatus(item.content_html, item.title);
      return {
        ...item,
        region,
        aptName,
        status,
        applyDateStr,
      };
    });
  }, [initialNewsletters]);

  // 카운트 계산
  const statusCounts = useMemo(() => {
    const todayCount = itemsWithMeta.filter((i) => i.status === 'TODAY').length;
    const upcomingCount = itemsWithMeta.filter((i) => i.status === 'UPCOMING').length;
    const endedCount = itemsWithMeta.filter((i) => i.status === 'ENDED').length;
    return { todayCount, upcomingCount, endedCount, total: itemsWithMeta.length };
  }, [itemsWithMeta]);

  // 실제 데이터에 존재하는 지역 목록 추출 (상단 빠른 필터용)
  const availableRegions = useMemo(() => {
    const present = new Set(itemsWithMeta.map((item) => item.region));
    const list = ['전체'];
    ALL_REGIONS.forEach((r) => {
      if (r !== '전체' && present.has(r)) {
        list.push(r);
      }
    });
    ['서울', '경기', '인천', '전북'].forEach((r) => {
      if (!list.includes(r)) list.push(r);
    });
    return list;
  }, [itemsWithMeta]);

  // 필터링 및 정렬 적용
  const filteredAndSorted = useMemo(() => {
    let result = [...itemsWithMeta];

    // 상태 필터 (오늘 / 예정 / 마감)
    if (selectedStatus === 'TODAY') {
      result = result.filter((item) => item.status === 'TODAY');
    } else if (selectedStatus === 'UPCOMING') {
      result = result.filter((item) => item.status === 'UPCOMING');
    } else if (selectedStatus === 'ENDED') {
      result = result.filter((item) => item.status === 'ENDED');
    }

    // 지역 필터
    if (selectedRegion !== '전체') {
      result = result.filter((item) => item.region === selectedRegion);
    }

    // 정렬
    if (sortOption === 'latest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'name') {
      result.sort((a, b) => a.aptName.localeCompare(b.aptName));
    }

    return result;
  }, [itemsWithMeta, selectedStatus, selectedRegion, sortOption]);

  return (
    <div className="space-y-6">
      {/* Status Filter Tab Bar (🔥 오늘 / 📅 예정 / 🔒 마감) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedStatus === 'ALL'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🌐 전체 보기</span>
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
            {statusCounts.total}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('TODAY')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedStatus === 'TODAY'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20'
              : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          <span>🔥 오늘 청약 접수</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${selectedStatus === 'TODAY' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
            {statusCounts.todayCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('UPCOMING')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedStatus === 'UPCOMING'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📅 청약 예정</span>
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
            {statusCounts.upcomingCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedStatus('ENDED')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            selectedStatus === 'ENDED'
              ? 'bg-slate-300 text-slate-900 shadow-sm border border-slate-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🔒 청약 마감</span>
          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-bold">
            {statusCounts.endedCount}
          </span>
        </button>
      </div>

      {/* Filter & Sort Controls Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        {/* Top: Region Tab Bar */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              지역 선택 필터
            </span>
            <span className="text-xs text-slate-400">
              선택: <strong className="text-blue-600 font-bold">{selectedRegion}</strong> ({filteredAndSorted.length}건)
            </span>
          </div>

          {/* Region Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {availableRegions.map((region) => {
              const isSelected = selectedRegion === region;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {region === '전체' ? '🌐 전체 지역' : `📍 ${region}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom: Sort Controls & Summary Counter */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              총 <strong className="text-slate-900">{filteredAndSorted.length}개</strong>의 아파트 분양 물건
            </span>
            {(selectedRegion !== '전체' || selectedStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedRegion('전체');
                  setSelectedStatus('ALL');
                }}
                className="text-blue-600 hover:underline cursor-pointer text-xs"
              >
                (필터 초기화)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-600">정렬:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="latest">최신 등록순</option>
              <option value="oldest">과거 등록순</option>
              <option value="name">단지명 가나다순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Apartment Cards */}
      {filteredAndSorted.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            선택하신 조건에 해당하는 청약 물건이 없습니다
          </h3>
          <p className="text-xs text-slate-500">
            지역 또는 상태 필터를 조정해보세요.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedRegion('전체');
                setSelectedStatus('ALL');
              }}
              className="text-xs font-semibold"
            >
              전체 목록 보기
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((item) => {
            const displayDate = item.sent_at || item.created_at;
            const formattedDate = displayDate
              ? format(new Date(displayDate), 'yyyy.MM.dd', { locale: ko })
              : '날짜 미정';
            const previewText = stripHtml(item.content_html).slice(0, 120) + '...';
            const regionColor = REGION_COLORS[item.region] || REGION_COLORS['기타'];
            const cleanAptName = item.aptName.replace(new RegExp('^' + item.region + '\\s*'), '');
            const displayTitle = cleanTitle(item.title) || item.title;
            const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(item.aptName)}`;

            const { status } = item;
            const isToday = status === 'TODAY';
            const isEnded = status === 'ENDED';

            return (
              <Card
                key={item.id}
                className={
                  isToday
                    ? 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 border-2 border-blue-500 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20 transition-all flex flex-col justify-between rounded-xl overflow-hidden group'
                    : isEnded
                    ? 'bg-gradient-to-br from-slate-100 via-slate-100/90 to-slate-200/80 border border-slate-300/80 shadow-xs opacity-75 grayscale-[35%] hover:grayscale-0 hover:opacity-100 transition-all flex flex-col justify-between rounded-xl overflow-hidden group'
                    : 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between rounded-xl overflow-hidden group'
                }
              >
                <CardHeader className="p-5 space-y-3">
                  {/* Top Row: Region Badge (Left) + Status / Date (Right) */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${regionColor} shadow-xs`}>
                      <MapPin className="h-3 w-3" />
                      {item.region}
                    </span>

                    {isToday ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-sm animate-pulse shrink-0">
                        <Sparkles className="h-3.5 w-3.5 fill-white" />
                        <span>🔥 오늘청약: {item.applyDateStr || '오늘'}</span>
                      </span>
                    ) : isEnded ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200/90 text-slate-600 border border-slate-300 shrink-0">
                        <Lock className="h-3.5 w-3.5 text-slate-500" />
                        <span>청약마감: {item.applyDateStr || '과거'}</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-300/80 shrink-0 shadow-xs">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>📅 청약예정: {item.applyDateStr || '일정참조'}</span>
                      </div>
                    )}
                  </div>

                  {/* Second Row: Apt Name Tag */}
                  <div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md max-w-full truncate border ${isToday ? 'bg-blue-100/80 text-blue-900 border-blue-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{cleanAptName}</span>
                    </span>
                  </div>

                  {/* Title (Clickable Link to detail page) */}
                  <CardTitle className={`text-base font-bold leading-snug pt-1 ${isToday ? 'text-blue-950 font-black' : isEnded ? 'text-slate-700' : 'text-slate-900'}`}>
                    <Link
                      href={`/archive/${item.id}`}
                      className="group-hover:text-blue-600 transition-colors line-clamp-2 block hover:underline"
                    >
                      {displayTitle}
                    </Link>
                  </CardTitle>

                  {/* Preview Description (Clickable Link) */}
                  <Link href={`/archive/${item.id}`} className="block">
                    <CardDescription className="text-xs text-slate-500 line-clamp-3 leading-relaxed hover:text-slate-700 transition-colors">
                      {previewText}
                    </CardDescription>
                  </Link>
                </CardHeader>

                <CardFooter className={`p-3 border-t flex items-center gap-2 ${isToday ? 'bg-blue-50/80 border-blue-200/80' : isEnded ? 'bg-slate-200/50 border-slate-300/60' : 'bg-slate-50/70 border-slate-100'}`}>
                  <a
                    href={naverMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors shrink-0 text-xs font-bold gap-1"
                    title="네이버 지도로 현장 위치 확인"
                  >
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    <span className="hidden sm:inline">지도</span>
                  </a>
                  <Link href={`/archive/${item.id}`} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className={`w-full justify-between text-xs font-extrabold transition-colors h-9 ${
                        isToday
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                          : isEnded
                          ? 'bg-slate-700 hover:bg-slate-800 text-slate-200'
                          : 'bg-slate-900 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <span>{isToday ? '🔥 오늘 청약 분석 열람' : isEnded ? '🔒 마감된 분석 리포트 열람' : '단지별 심층 분석 열람'}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
