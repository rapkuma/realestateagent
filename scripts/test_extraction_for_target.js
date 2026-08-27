import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testExtraction() {
  const targetId = '46f0fb14-a059-40f0-a4bc-a31b8ac3ff9b';
  const { data } = await supabase.from('newsletters').select('*').eq('id', targetId).single();
  
  if (!data) return;

  const contentHtml = data.content_html;

  // locationText extraction
  const locationMatch = contentHtml?.match(/📍 공급위치<\/td>\s*<td[^>]*>(.*?)<\/td>/) || contentHtml?.match(/📍 공급 위치: <strong>(.*?)<\/strong>/);
  const locationText = locationMatch ? locationMatch[1].replace(/<[^>]*>/g, '').trim() : '장위 푸르지오 마크원(2차)';
  const naverMapUrl = `https://map.naver.com/p/search/${encodeURIComponent(locationText)}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // size extraction
  const sizeMatches = Array.from(
    contentHtml.matchAll(/(?:59|74|84|101|102|114|130|135|140|150)\s*(?:㎡|타입|평형|A|B|C)?/gi)
  ).map((m) => m[0].trim());

  const uniqueSizes = Array.from(new Set(sizeMatches)).slice(0, 5);

  // price extraction
  const priceMatch = 
    contentHtml.match(/(?:최고\s*분양가|분양가|공급금액|최고가)[^:<]*[:\s]*<strong>?(?:약\s*)?([\d억\s,천만]+원?)/i) ||
    contentHtml.match(/([\d]+\s*억\s*[\d,]*\s*만?\s*원)/);

  console.log('📍 Extracted Location:', locationText);
  console.log('🗺️ Map Embed URL:', mapEmbedUrl);
  console.log('📐 Extracted Sizes:', uniqueSizes);
  console.log('💰 Extracted Price Match:', priceMatch ? priceMatch[0] : 'None');
  console.log('--------------------------------------------');
  console.log('Searching for price tables or text in HTML:');
  const priceOccurrences = Array.from(contentHtml.matchAll(/억/g)).length;
  console.log('Count of "억" in HTML:', priceOccurrences);
}

testExtraction();
