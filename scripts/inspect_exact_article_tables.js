import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectExact() {
  const targetId = '46f0fb14-a059-40f0-a4bc-a31b8ac3ff9b';
  const { data } = await supabase.from('newsletters').select('*').eq('id', targetId).single();
  if (data) {
    console.log('Full content_html:\n', data.content_html);
  }
}

inspectExact();
