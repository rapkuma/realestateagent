import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function parseAccurateApartmentDetails(title, contentHtml) {
  let locationText = '';
  let priceText = '';
  let sizeText = '';
  let scaleText = '';

  if (!contentHtml) return { locationText, priceText, sizeText, scaleText };

  // 1. Location (공급위치)
  const locMatch = 
    contentHtml.match(/📍\s*공급위치<\/td>\s*<td[^>]*>(.*?)<\/td>/i) ||
    contentHtml.match(/📍\s*공급\s*위치:\s*<strong>(.*?)<\/strong>/i);
  
  if (locMatch && locMatch[1]) {
    locationText = locMatch[1].replace(/<[^>]*>/g, '').trim();
  } else {
    // Fallback: title parsing
    const cleanTitle = title.replace(/\[|\]/g, ' ').split(']')[0].trim();
    locationText = cleanTitle;
  }

  // 2. Supply Scale (공급규모)
  const scaleMatch = 
    contentHtml.match(/🏗️\s*공급규모<\/td>\s*<td[^>]*>(.*?)<\/td>/i) ||
    contentHtml.match(/🏗️\s*시공사\/규모:\s*(.*?)(?:<\/p>|<br>)/i);

  if (scaleMatch && scaleMatch[1]) {
    scaleText = scaleMatch[1].replace(/<[^>]*>/g, '').trim();
  } else {
    scaleText = '공공데이터 분양 단지';
  }

  // 3. Section 9 / Section 7 Table Specific Price (분양가)
  // Section 9: 9. 평형(타입)별 상세 분양가 및 공급 세대수
  const sec9Match = contentHtml.match(/9\.\s*평형[^<]*상세\s*분양가[\s\S]*?(?:<div[^>]*>([\s\S]*?)<\/div>|<table[\s\S]*?<\/table>)/i);
  
  if (sec9Match && sec9Match[0]) {
    const sec9Text = sec9Match[0].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    
    // Look for "최고 X억 Y천만원" or "X억 Y천만원" inside Section 9 specifically
    const specPriceMatch = sec9Text.match(/(?:최고\s*)?([\d]+\s*억\s*[\d,]*\s*만?\s*원?)/i);
    if (specPriceMatch && specPriceMatch[1]) {
      priceText = specPriceMatch[1].trim();
      if (!priceText.includes('원')) priceText += '원';
    }
  }

  // If Section 9 didn't yield a specific price, look at general header info
  if (!priceText) {
    const headerPriceMatch = contentHtml.match(/<strong>최고\s*분양가<\/strong>[^:]*:\s*<strong>?([\d억\s,천만]+원)/i);
    if (headerPriceMatch && headerPriceMatch[1]) {
      priceText = headerPriceMatch[1].trim();
    } else {
      priceText = '하단 [9. 상세 분양가] 참조';
    }
  }

  // 4. Extract Sizes from Section 9 or Title
  const sec9TextForSizes = sec9Match ? sec9Match[0].replace(/<[^>]*>/g, ' ') : contentHtml;
  const sizeMatches = Array.from(
    sec9TextForSizes.matchAll(/(?:전용\s*)?(\d{2,3}\s*㎡|\d{2,3}\s*[A-C]타입|\d{2,3}A|\d{2,3}B|\d{2,3}C)/gi)
  ).map(m => m[1].trim());

  const uniqueSizes = Array.from(new Set(sizeMatches)).slice(0, 4);
  if (uniqueSizes.length > 0) {
    sizeText = uniqueSizes.join(' · ');
  } else {
    sizeText = '전용 59㎡ ~ 84㎡';
  }

  return { locationText, priceText, sizeText, scaleText };
}

async function testImproved() {
  const { data } = await supabase.from('newsletters').select('id, title, content_html').limit(10);
  if (!data) return;

  data.forEach((item, index) => {
    const res = parseAccurateApartmentDetails(item.title, item.content_html);
    console.log(`[${index + 1}] Title: ${item.title}`);
    console.log(`   📍 Location: ${res.locationText}`);
    console.log(`   🏗️ Scale: ${res.scaleText}`);
    console.log(`   💰 Price: ${res.priceText}`);
    console.log(`   📐 Sizes: ${res.sizeText}`);
    console.log('--------------------------------------------------');
  });
}

testImproved();
