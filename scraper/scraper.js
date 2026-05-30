const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { SingleBar, Presets } = require('cli-progress');

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://jeeadv.ac.in';
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
const DELAY_MS = 2000; // 2 seconds between requests — respectful to server
const TIMEOUT_MS = 30000;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/pdf,application/octet-stream,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://jeeadv.ac.in/archive.html',
};

// ─── Paper URL Map ────────────────────────────────────────────────────────────
// JEE Advanced papers — official URLs from jeeadv.ac.in/archive.html
// Format changes: 2007-2018 = YEAR_PAPER.pdf, 2019+ = separate English/Hindi

const PAPERS = [
  // 2007 – 2018: single PDF per paper (English only)
  { year: 2007, paper: 1, url: 'past_qps/2007_1.pdf',  lang: 'en' },
  { year: 2007, paper: 2, url: 'past_qps/2007_2.pdf',  lang: 'en' },
  { year: 2008, paper: 1, url: 'past_qps/2008_1.pdf',  lang: 'en' },
  { year: 2008, paper: 2, url: 'past_qps/2008_2.pdf',  lang: 'en' },
  { year: 2009, paper: 1, url: 'past_qps/2009_1.pdf',  lang: 'en' },
  { year: 2009, paper: 2, url: 'past_qps/2009_2.pdf',  lang: 'en' },
  { year: 2010, paper: 1, url: 'past_qps/2010_1.pdf',  lang: 'en' },
  { year: 2010, paper: 2, url: 'past_qps/2010_2.pdf',  lang: 'en' },
  { year: 2011, paper: 1, url: 'past_qps/2011_1.pdf',  lang: 'en' },
  { year: 2011, paper: 2, url: 'past_qps/2011_2.pdf',  lang: 'en' },
  { year: 2012, paper: 1, url: 'past_qps/2012_1.pdf',  lang: 'en' },
  { year: 2012, paper: 2, url: 'past_qps/2012_2.pdf',  lang: 'en' },
  { year: 2013, paper: 1, url: 'past_qps/2013_1.pdf',  lang: 'en' },
  { year: 2013, paper: 2, url: 'past_qps/2013_2.pdf',  lang: 'en' },
  { year: 2014, paper: 1, url: 'past_qps/2014_1.pdf',  lang: 'en' },
  { year: 2014, paper: 2, url: 'past_qps/2014_2.pdf',  lang: 'en' },
  { year: 2015, paper: 1, url: 'past_qps/2015_1.pdf',  lang: 'en' },
  { year: 2015, paper: 2, url: 'past_qps/2015_2.pdf',  lang: 'en' },
  { year: 2016, paper: 1, url: 'past_qps/2016_1.pdf',  lang: 'en' },
  { year: 2016, paper: 2, url: 'past_qps/2016_2.pdf',  lang: 'en' },
  { year: 2017, paper: 1, url: 'past_qps/2017_1.pdf',  lang: 'en' },
  { year: 2017, paper: 2, url: 'past_qps/2017_2.pdf',  lang: 'en' },
  { year: 2018, paper: 1, url: 'past_qps/2018_1.pdf',  lang: 'en' },
  { year: 2018, paper: 2, url: 'past_qps/2018_2.pdf',  lang: 'en' },

  // 2019 – 2025: English versions (correct URL pattern from archive.html)
  { year: 2019, paper: 1, url: 'past_qps/2019_1_English.pdf', lang: 'en' },
  { year: 2019, paper: 2, url: 'past_qps/2019_2_English.pdf', lang: 'en' },
  { year: 2020, paper: 1, url: 'past_qps/2020_1_English.pdf', lang: 'en' },
  { year: 2020, paper: 2, url: 'past_qps/2020_2_English.pdf', lang: 'en' },
  { year: 2021, paper: 1, url: 'past_qps/2021_1_English.pdf', lang: 'en' },
  { year: 2021, paper: 2, url: 'past_qps/2021_2_English.pdf', lang: 'en' },
  { year: 2022, paper: 1, url: 'past_qps/2022_1_English.pdf', lang: 'en' },
  { year: 2022, paper: 2, url: 'past_qps/2022_2_English.pdf', lang: 'en' },
  { year: 2023, paper: 1, url: 'past_qps/2023_1_English.pdf', lang: 'en' },
  { year: 2023, paper: 2, url: 'past_qps/2023_2_English.pdf', lang: 'en' },
  { year: 2024, paper: 1, url: 'past_qps/2024_1_English.pdf', lang: 'en' },
  { year: 2024, paper: 2, url: 'past_qps/2024_2_English.pdf', lang: 'en' },
  { year: 2025, paper: 1, url: 'past_qps/2025_1_English.pdf', lang: 'en' },
  { year: 2025, paper: 2, url: 'past_qps/2025_2_English.pdf', lang: 'en' },

  // 2026 — current year (known from homepage)
  { year: 2026, paper: 1, url: 'documents/p1_english.pdf', lang: 'en' },
  { year: 2026, paper: 2, url: 'documents/p2_english.pdf', lang: 'en' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

async function downloadPDF(paper) {
  const fullUrl = `${BASE_URL}/${paper.url}`;
  const yearDir = path.join(DOWNLOAD_DIR, String(paper.year));
  const filename = `JEE_Advanced_${paper.year}_Paper${paper.paper}_Maths_EN.pdf`;
  const filePath = path.join(yearDir, filename);

  // Skip if already downloaded
  if (await fs.pathExists(filePath)) {
    const stat = await fs.stat(filePath);
    return { status: 'skipped', file: filename, size: stat.size };
  }

  await fs.ensureDir(yearDir);

  const response = await axios.get(fullUrl, {
    headers: HEADERS,
    responseType: 'arraybuffer',
    timeout: TIMEOUT_MS,
    validateStatus: (status) => status === 200,
  });

  // Verify it's actually a PDF
  const buf = Buffer.from(response.data);
  if (!buf.slice(0, 4).toString().startsWith('%PDF')) {
    throw new Error('Response is not a valid PDF');
  }

  await fs.writeFile(filePath, buf);
  return { status: 'downloaded', file: filename, size: buf.length };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   JEE Advanced Question Paper Scraper            ║');
  console.log('║   Source: jeeadv.ac.in (Official)                ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  await fs.ensureDir(DOWNLOAD_DIR);

  const results = { downloaded: [], skipped: [], failed: [] };
  let totalSize = 0;

  const bar = new SingleBar({
    format: 'Downloading |{bar}| {percentage}% | {value}/{total} papers | {file}',
    barCompleteChar: '█',
    barIncompleteChar: '░',
    hideCursor: true,
  }, Presets.shades_classic);

  bar.start(PAPERS.length, 0, { file: 'starting...' });

  for (let i = 0; i < PAPERS.length; i++) {
    const paper = PAPERS[i];
    const label = `${paper.year} Paper ${paper.paper}`;

    bar.update(i, { file: label });

    try {
      const result = await downloadPDF(paper);
      if (result.status === 'downloaded') {
        results.downloaded.push({ ...paper, ...result });
        totalSize += result.size;
      } else {
        results.skipped.push({ ...paper, ...result });
        totalSize += result.size;
      }
    } catch (err) {
      results.failed.push({ ...paper, error: err.message });
    }

    bar.update(i + 1, { file: label });

    // Respectful delay between requests
    if (i < PAPERS.length - 1) await sleep(DELAY_MS);
  }

  bar.stop();

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\n  ✅ Downloaded : ${results.downloaded.length} papers`);
  console.log(`  ⏭  Skipped    : ${results.skipped.length} papers (already existed)`);
  console.log(`  ❌ Failed     : ${results.failed.length} papers`);
  console.log(`  💾 Total size : ${formatSize(totalSize)}`);
  console.log(`  📁 Saved to   : ${DOWNLOAD_DIR}\n`);

  if (results.downloaded.length > 0) {
    console.log('  Newly downloaded:');
    results.downloaded.forEach(p => {
      console.log(`    • ${p.year} Paper ${p.paper} — ${formatSize(p.size)}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n  ⚠  Failed papers (URL may have changed on official site):');
    results.failed.forEach(p => {
      console.log(`    • ${p.year} Paper ${p.paper} — ${p.error}`);
    });
    console.log('\n  Tip: Visit https://jeeadv.ac.in/archive.html to find updated URLs');
    console.log('       then update the PAPERS array in scraper.js\n');
  }

  // Write a manifest JSON
  const manifest = {
    downloadedAt: new Date().toISOString(),
    source: 'https://jeeadv.ac.in',
    subject: 'IIT JEE Advanced — All Subjects (Maths section inside)',
    note: 'Upload these PDFs to the EduPrep admin panel. The AI will extract and tag only the Maths questions.',
    papers: [
      ...results.downloaded.map(p => ({ year: p.year, paper: p.paper, file: p.file, status: 'downloaded', size: p.size })),
      ...results.skipped.map(p =>  ({ year: p.year, paper: p.paper, file: p.file, status: 'skipped',    size: p.size })),
      ...results.failed.map(p =>   ({ year: p.year, paper: p.paper, file: null,   status: 'failed',     error: p.error })),
    ]
  };
  await fs.writeJson(path.join(DOWNLOAD_DIR, 'manifest.json'), manifest, { spaces: 2 });
  console.log('  📋 manifest.json written to downloads/\n');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
