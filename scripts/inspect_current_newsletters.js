const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수 없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 조회 오류:', error);
    return;
  }

  console.log(`📌 총 ${data.length}개 뉴스레터 항목 발견:`);
  data.forEach((item, index) => {
    console.log(`${index + 1}. [ID: ${item.id}] ${item.title}`);
  });
}

inspect();
