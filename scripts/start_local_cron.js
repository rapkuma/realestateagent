const cron = require('node-cron');

console.log('⏰ [로컬 자동화 스케줄러 시작]');
console.log('📅 매일 오전 08:35 ~ 08:55 (5분 간격) 청약홈 데이터를 자동 수집 및 분석합니다.');

// 매일 한국 시각 08:35, 08:40, 08:45, 08:50, 08:55 실행
cron.schedule('35,40,45,50,55 8 * * *', async () => {
  console.log(`\n📡 [${new Date().toLocaleString('ko-KR')}] 매일 크론 자동 수집 파이프라인 트리거 중...`);
  try {
    const res = await fetch('http://localhost:3000/api/cron', { method: 'POST' });
    const json = await res.json();
    console.log('✅ 실행 결과:', json);
  } catch (err) {
    console.error('❌ 실행 중 오류:', err.message);
  }
});
