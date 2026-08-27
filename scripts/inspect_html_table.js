import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectTable() {
  const { data } = await supabase.from('newsletters').select('title, content_html').limit(1);
  if (data && data[0]) {
    console.log('Title:', data[0].title);
    console.log('Full content HTML:\n', data[0].content_html.substring(0, 3500));
  }
}

inspectTable();
