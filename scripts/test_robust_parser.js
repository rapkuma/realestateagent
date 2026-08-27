import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function parseApartmentDetails(title, contentHtml) {
  let locationText = '';
  let priceText = '';
  let sizeText = '';
  let scaleText = '';

  if (!contentHtml) return { locationText, priceText, sizeText, scaleText };

  // 1. Location (공급위치)
  const locMatch = 
    contentHtml.match(/📍\s*공급위치<\/td>\s*<td[^>]*>(.*?)<\/td>/i) ||
    contentHtml.match(/📍\s*공급\s*위치:\s*<strong>(.*?)<\/strong>/i) ||
    contentHtml.match(/공급위치[^:<]*[:\s]*<strong>?(.*?)<\/strong>?/i);
  
  if (locMatch && locMatch[1]) {
    locationText = locMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  // 2. Supply Size & Scale (공급규모 & 세대수/평형)
  const scaleMatch = 
    contentHtml.match(/🏗️\s*공급규모<\/td>\s*<td[^>]*>(.*?)<\/td>/i) ||
    contentHtml.match(/🏗️\s*시공사\/규모:\s*(.*?)(?:<\/p>|<br>)/i) ||
    contentHtml.match(/<strong>공급\s*규모<\/strong>:\s*(.*?)(?:<\/div>|<br>)/i);

  if (scaleMatch && scaleMatch[1]) {
    scaleText = scaleMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  // 3. Price & Types (평형별 상세 분양가)
  const priceMatch = 
    contentHtml.match(/<strong>공급\s*규모<\/strong>:\s*무순위[^(]*\((.*?)\)/i) ||
    contentHtml.match(/(최고\s*[\d억\s,천만]+원[^<]*)/i) ||
    contentHtml.match(/분양가[^:<]*[:\s]*<strong>?([\d억\s,천만]+원[^<]*)/i) ||
    contentHtml.match(/([\d]+억\s*[\d,]*만?\s*원)/i);

  if (priceMatch && priceMatch[1]) {
    priceText = priceMatch[1].replace(/<[^>]*>/g, '').trim();
  } else {
    priceText = '공고문 하단 세부 분양가 참조';
  }

  // 4. Extract sizes (전용 59㎡, 84㎡ etc)
  const sizeMatches = Array.from(
    contentHtml.matchAll(/(?:전용\s*)?(\d{2,3}(?:[A-Z]|㎡|평형))/gi)
  ).map(m => m[0].trim());

  const uniqueSizes = Array.from(new Set(sizeMatches)).filter(s => s.includes('㎡') || s.includes('평')).slice(0, 4);
  if (uniqueSizes.length > 0) {
    sizeText = uniqueSizes.join(' · ');
  } else {
    sizeText = '전용 59㎡ ~ 84㎡ (국민평형)';
  }

  return { locationText, priceText, sizeText, scaleText };
}

async function testAll() {
  const { data } = await supabase.from('newsletters').select('id, title, content_html');
  if (!data) return;

  console.log(`Checking ${data.length} newsletters in Supabase:\n`);
  data.forEach((item, index) => {
    const res = parseApartmentDetails(item.title, item.content_html);
    console.log(`[${index + 1}] Title: ${item.title}`);
    console.log(`   📍 Location: ${res.locationText || 'Fallback to Title'}`);
    console.log(`   🏗️ Scale: ${res.scaleText}`);
    console.log(`   💰 Price: ${res.priceText}`);
    console.log(`   📐 Sizes: ${res.sizeText}`);
    console.log('--------------------------------------------------');
  });
}

testAll();
