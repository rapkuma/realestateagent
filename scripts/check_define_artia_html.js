const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, title, content_html')
    .ilike('title', '%드파인%');

  if (error || !data || data.length === 0) {
    console.error('❌ Not found');
    return;
  }

  const item = data[0];
  console.log('Title:', item.title);
  console.log('First 500 chars of content_html:\n', item.content_html.substring(0, 500));
}

check();
