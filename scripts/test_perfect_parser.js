import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function parseAccurateDetailsStrict(title, contentHtml) {
  let locationText = '';
  let priceText = '타입별 분양가 개별 표기 (하단 표 참조)';
  let sizeText = '전용 59㎡ ~ 84㎡ (타입별 분양가 참조)';
  let scaleText = '신규 분양 단지';

  if (!contentHtml) return { locationText, priceText, sizeText, scaleText };

  // 1. Location (공급위치)
  const locMatch = 
    contentHtml.match(/📍\s*공급위치<\/td>\s*<td[^>]*>(.*?)<\/td>/i) ||
    contentHtml.match(/📍\s*공급\s*위치:\s*<strong>(.*?)<\/strong>/i);
  
  if (locMatch && locMatch[1]) {
    locationText = locMatch[1].replace(/<[^>]*>/g, '').trim();
  } else {
    locationText = title.split(']')[0].replace('[', '').trim();
  }

  // 2. Supply Scale (공급규모)
  const scaleMatch = 
    contentHtml.match(/🏗️\s*공급규모<\/td>\s*<td[^>]*>(.*?)<\/td>/i) ||
    contentHtml.match(/🏗️\s*시공사\/규모:\s*(.*?)(?:<\/p>|<br>)/i);

  if (scaleMatch && scaleMatch[1]) {
    scaleText = scaleMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  // 3. Section 9 / Header Specific Price (분양가)
  // Check header explicit price
  const headerPriceMatch = contentHtml.match(/<strong>최고\s*분양가<\/strong>[^:]*:\s*<strong>?([\d억\s,천만]+원[^<]*)/i);
  
  if (headerPriceMatch && headerPriceMatch[1]) {
    priceText = headerPriceMatch[1].replace(/<[^>]*>/g, '').trim();
  } else {
    // Check Section 9
    const sec9Match = contentHtml.match(/9\.\s*평형[^<]*상세\s*분양가[\s\S]*?(?:<div[^>]*>([\s\S]*?)<\/div>|<table[\s\S]*?<\/table>)/i);
    if (sec9Match && sec9Match[0]) {
      const sec9CleanText = sec9Match[0].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
      const specPriceMatch = sec9CleanText.match(/(?:최고\s*)?([\d]+\s*억\s*[\d,]*\s*만?\s*원?)/i);
      if (specPriceMatch && specPriceMatch[1]) {
        priceText = specPriceMatch[1].trim();
        if (!priceText.includes('원')) priceText += '원';
      }
    }
  }

  // Filter out hardcoded fallback 8억 4천만 if not in header/sec9
  if (priceText.includes('8억 4,000만') && !contentHtml.includes('9. 평형(타입)별 상세 분양가') && !contentHtml.includes('최고 분양가')) {
    priceText = '하단 [9. 상세 분양가] 참조';
  }

  // 4. Extract Sizes (공급 평형)
  const sizeMatches = Array.from(
    contentHtml.matchAll(/(?:전용\s*)?(\d{2,3}\s*㎡)/gi)
  ).map(m => m[1].trim());

  const uniqueSizes = Array.from(new Set(sizeMatches)).slice(0, 4);
  if (uniqueSizes.length > 0) {
    sizeText = uniqueSizes.join(' · ');
  }

  return { locationText, priceText, sizeText, scaleText };
}

async function testStrict() {
  const { data } = await supabase.from('newsletters').select('id, title, content_html').limit(15);
  if (!data) return;

  data.forEach((item, index) => {
    const res = parseAccurateDetailsStrict(item.title, item.content_html);
    console.log(`[${index + 1}] ${item.title}`);
    console.log(`   📍 주소: ${res.locationText}`);
    console.log(`   🏗️ 규모: ${res.scaleText}`);
    console.log(`   💰 분양가: ${res.priceText}`);
    console.log(`   📐 평형: ${res.sizeText}`);
    console.log('--------------------------------------------------');
  });
}

testStrict();
