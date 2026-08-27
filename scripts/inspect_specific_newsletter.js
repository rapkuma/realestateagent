import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectSpecific() {
  const targetId = '46f0fb14-a059-40f0-a4bc-a31b8ac3ff9b';
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', targetId)
    .single();

  if (error) {
    console.error('Error fetching target newsletter:', error);
  } else {
    console.log('ID:', data.id);
    console.log('Title:', data.title);
    console.log('Created At:', data.created_at);
    console.log('Content HTML preview:', data.content_html?.substring(0, 800));
  }
}

inspectSpecific();
