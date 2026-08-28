import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { downloadAndParsePdf } from '../src/lib/pdfDownloader';

async function test() {
  const houseManageNo = '2026910221';
  const pblancNo = '2026910221';
  
  console.log(`Testing PDF download and parse for ${houseManageNo}...`);
  const text = await downloadAndParsePdf(houseManageNo, pblancNo);
  
  if (text) {
    console.log(`\n--- Extracted Text Preview (First 500 chars) ---`);
    console.log(text.substring(0, 500));
    console.log(`----------------------------------------------`);
    console.log(`Total Length: ${text.length}`);
  } else {
    console.error('Failed to get text');
  }
}

test();
