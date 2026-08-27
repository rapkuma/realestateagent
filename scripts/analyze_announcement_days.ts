import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { parseISO, getDay } from 'date-fns';

const apiKey = process.env.APPLYHOME_API_KEY;

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

async function analyzeDays() {
  if (!apiKey) return;

  const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=100&serviceKey=${encodeURIComponent(apiKey)}`;
  const remndrUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=100&serviceKey=${encodeURIComponent(apiKey)}`;

  const [resApt, resRemndr] = await Promise.all([
    fetch(url, { headers: { Accept: 'application/json' } }),
    fetch(remndrUrl, { headers: { Accept: 'application/json' } }),
  ]);

  const jsonApt = await resApt.json();
  const jsonRemndr = await resRemndr.json();

  const allItems = [...(jsonApt.data || []), ...(jsonRemndr.data || [])];

  const dateCounts: { [date: string]: { count: number; dayName: string; names: string[] } } = {};

  allItems.forEach((item: any) => {
    const rawDate = item.RCRIT_PBLANC_DE || item.PBLANC_NO || '';
    if (!rawDate || rawDate.length < 8) return;
    const dateStr = rawDate.includes('-')
      ? rawDate
      : `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;

    try {
      const parsed = parseISO(dateStr);
      const dayIdx = getDay(parsed);
      const dayName = DAY_NAMES[dayIdx];

      if (!dateCounts[dateStr]) {
        dateCounts[dateStr] = { count: 0, dayName, names: [] };
      }
      dateCounts[dateStr].count++;
      dateCounts[dateStr].names.push(item.HOUSE_NM || item.house_nm);
    } catch {}
  });

  console.log('📊 [8월 청약홈 모집공고일 요일별 실제 고시 현황 분석]:\n');

  const sortedDates = Object.keys(dateCounts).sort().reverse();

  sortedDates.slice(0, 15).forEach((date) => {
    const info = dateCounts[date];
    console.log(`📅 [${date} (${info.dayName})] : 총 ${info.count}건 고시됨`);
    info.names.forEach((name) => console.log(`   - ${name}`));
    console.log('');
  });
}

analyzeDays();
