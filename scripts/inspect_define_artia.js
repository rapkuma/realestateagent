const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, content_html, sent_at, created_at')
    .ilike('title', '%드파인%');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📌 Found items for 드파인 아르티아:', data.length);
  data.forEach((item) => {
    console.log('ID:', item.id);
    console.log('Title:', item.title);
    console.log('Created At:', item.created_at);
    // Find all YYYY-MM-DD or YYYY.MM.DD in content_html
    const dates = item.content_html.match(/202[4-9][-.]\d{2}[-.]\d{2}/g);
    console.log('Dates found in content_html:', dates);
  });
}

inspect();
