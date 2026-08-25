const apiKey = process.env.APPLYHOME_API_KEY;

async function fetchEndpoint(endpointName, title) {
  console.log(`\n========================================`);
  console.log(`📡 [${title}] Calling ${endpointName}...`);
  const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${endpointName}?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`;
  
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.error(`HTTP Error ${res.status}`);
      return [];
    }
    const json = await res.json();
    const items = json.data || [];
    console.log(`✅ Received ${items.length} items from ${endpointName}`);
    items.forEach((item, idx) => {
      const name = item.HOUSE_NM || item.house_nm;
      const rceptBgnde = item.RCEPT_BGNDE || item.rcept_bgnde || item.SUBSCRPT_RCEPT_BGNDE;
      const rceptEndde = item.RCEPT_ENDDE || item.rcept_endde || item.SUBSCRPT_RCEPT_ENDDE;
      const location = item.HSSPLY_ADRES || item.hssply_adres;
      console.log(` ${idx+1}. [${name}] | 접수일: ${rceptBgnde} ~ ${rceptEndde} | 위치: ${location}`);
    });
    return items;
  } catch (err) {
    console.error(`Exception in ${endpointName}:`, err.message);
    return [];
  }
}

async function run() {
  await fetchEndpoint('getAPTLttotPblancDetail', 'APT 분양 상세');
  await fetchEndpoint('getRemndrLttotPblancDetail', 'APT 무순위/잔여세대 (줍줍) 상세');
  await fetchEndpoint('getUrbntyOftestLttotPblancDetail', '오피스텔/도시형/민간임대 상세');
}

run();
