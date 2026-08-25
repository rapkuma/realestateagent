const { fetchAndSyncApartments } = require('../src/lib/applyhome');

async function testRealApi() {
  console.log('📡 [실시간 API 테스트] 공공데이터포털 청약홈 API 호출 시도...');
  try {
    const list = await fetchAndSyncApartments();
    console.log(`🎉 [API 호출 성공] 총 ${list.length}개의 실제 청약 공고 데이터를 받아왔습니다!`);
    if (list.length > 0) {
      console.log('--- 수집된 실제 공고 샘플 ---');
      list.slice(0, 5).forEach((item, idx) => {
        console.log(`${idx + 1}. [${item.apt_name}] ${item.location} (접수일: ${item.apply_date})`);
      });
    }
  } catch (err) {
    console.error('❌ API 테스트 중 에러:', err);
  }
}

testRealApi();
