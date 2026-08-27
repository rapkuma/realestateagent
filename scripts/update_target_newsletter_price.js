import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateTarget() {
  const targetId = '46f0fb14-a059-40f0-a4bc-a31b8ac3ff9b';
  const { data } = await supabase.from('newsletters').select('*').eq('id', targetId).single();
  
  if (!data) {
    console.error('Target newsletter not found');
    return;
  }

  let html = data.content_html;

  // Update 9억 8,000만원 -> 16억 ~ 17억선 (전용 84㎡ 기준)
  html = html.replaceAll('9억 8,000만원', '16억 ~ 17억선');
  html = html.replaceAll('최고 9억 8,000만원 (전용 84㎡ 기준)', '16억 ~ 17억선 (전용 84㎡ 기준)');

  const { error } = await supabase
    .from('newsletters')
    .update({ content_html: html })
    .eq('id', targetId);

  if (error) {
    console.error('Error updating newsletter DB:', error);
  } else {
    console.log('✅ Successfully updated price for [장위 푸르지오 마크원(2차)] in Supabase DB to 16억~17억!');
  }
}

updateTarget();
