const apiKey = process.env.APPLYHOME_API_KEY;

async function testUrbnty() {
  const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getUrbntyOftestLttotPblancDetail?page=1&perPage=50&serviceKey=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    console.log('Status:', res.status);
    if (res.ok) {
      const json = await res.json();
      console.log('Items count:', json.data ? json.data.length : 0);
      if (json.data && json.data.length > 0) {
        console.log('Sample item:', json.data[0].HOUSE_NM || json.data[0].house_nm);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

testUrbnty();
