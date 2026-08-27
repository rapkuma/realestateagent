import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspect() {
  const { data, error } = await supabase.from('newsletters').select('*').limit(3);
  if (error) console.error(error);
  else {
    data.forEach(item => {
      console.log('ID:', item.id);
      console.log('Title:', item.title);
      console.log('Content HTML snippet:', item.content_html?.substring(0, 500));
      console.log('-----------------------------------------------------');
    });
  }
}

inspect();
