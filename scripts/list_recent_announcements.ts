import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.APPLYHOME_API_KEY;

async function listRecentAnnouncements() {
  if (!apiKey) return;

  const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`;
  const remndrUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getRemndrLttotPblancDetail?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`;

  const [resApt, resRemndr] = await Promise.all([
    fetch(url, { headers: { Accept: 'application/json' } }),
    fetch(remndrUrl, { headers: { Accept: 'application/json' } }),
  ]);

  const jsonApt = await resApt.json();
  const jsonRemndr = await resRemndr.json();

  const aptItems = jsonApt.data || [];
  const remndrItems = jsonRemndr.data || [];

  console.log('📌 [최신 APT 모집공고일 목록 Top 15]:');
  aptItems.slice(0, 15).forEach((item: any, i: number) => {
    console.log(`${i + 1}. [모집공고일: ${item.RCRIT_PBLANC_DE}] ${item.HOUSE_NM} (${item.HSSPLY_ADRES})`);
    console.log(`   - 청약접수일: ${item.RCEPT_BGNDE || '미정'}`);
  });

  console.log('\n📌 [최신 무순위(줍줍) 모집공고일 목록 Top 10]:');
  remndrItems.slice(0, 10).forEach((item: any, i: number) => {
    console.log(`${i + 1}. [모집공고일: ${item.RCRIT_PBLANC_DE || item.PBLANC_NO}] ${item.HOUSE_NM} (${item.HSSPLY_ADRES})`);
    console.log(`   - 청약접수일: ${item.SUBSCRPT_RCEPT_BGNDE || item.RCEPT_BGNDE || '미정'}`);
  });
}

listRecentAnnouncements();
