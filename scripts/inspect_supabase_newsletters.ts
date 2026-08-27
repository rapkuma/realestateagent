import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectNewsletters() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Supabase 조회 에러:', error.message);
    return;
  }

  console.log(`📋 [Supabase DB newsletters 총 ${data.length}건 목록]:\n`);
  data.forEach((item, i) => {
    console.log(`${i + 1}. [ID: ${item.id}] ${item.title} (${item.created_at})`);
  });
}

inspectNewsletters();
