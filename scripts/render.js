#!/usr/bin/env node

'use strict';

const path = require('path');

// 기본값
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1440;

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length < 2) {
    return null;
  }

  let inputHtml = null;
  let outputPng = null;
  let width = DEFAULT_WIDTH;
  let height = DEFAULT_HEIGHT;

  let i = 0;
  while (i < args.length) {
    if (args[i] === '--width' && i + 1 < args.length) {
      width = parseInt(args[i + 1], 10);
      i += 2;
    } else if (args[i] === '--height' && i + 1 < args.length) {
      height = parseInt(args[i + 1], 10);
      i += 2;
    } else if (inputHtml === null) {
      inputHtml = args[i];
      i++;
    } else if (outputPng === null) {
      outputPng = args[i];
      i++;
    } else {
      i++;
    }
  }

  if (!inputHtml || !outputPng) {
    return null;
  }

  return { inputHtml, outputPng, width, height };
}

function printUsage() {
  console.error('Usage: node render.js <input.html> <output.png> [--width 1080] [--height 1440]');
  console.error('');
  console.error('  input.html   변환할 HTML 파일 경로 (절대 또는 상대 경로)');
  console.error('  output.png   저장할 PNG 파일 경로');
  console.error('  --width      캔버스 너비 (기본값: 1080)');
  console.error('  --height     캔버스 높이 (기본값: 1440)');
}

async function render({ inputHtml, outputPng, width, height }) {
  let playwright;
  const marketingNodeModules = path.join(
    process.cwd(),
    'marketing/node_modules'
  );
  try {
    playwright = require(path.join(marketingNodeModules, 'playwright'));
  } catch (e) {
    console.error(`Playwright를 불러올 수 없습니다: ${marketingNodeModules}/playwright`);
    console.error('marketing 프로젝트에서 npm install 실행 필요');
    process.exit(1);
  }

  // 절대경로 변환
  const absInput = path.isAbsolute(inputHtml)
    ? inputHtml
    : path.resolve(process.cwd(), inputHtml);

  const absOutput = path.isAbsolute(outputPng)
    ? outputPng
    : path.resolve(process.cwd(), outputPng);

  const browser = await playwright.chromium.launch();
  try {
    const context = await browser.newContext({ deviceScaleFactor: 2 });
    const page = await context.newPage();

    await page.setViewportSize({ width, height });

    // 웹폰트 로딩 실패 감지
    page.on('requestfailed', (request) => {
      const url = request.url();
      if (url.includes('font') || url.includes('cdn.jsdelivr') || url.includes('fonts.')) {
        process.stderr.write(`경고: 웹폰트 로딩 실패 — ${url} (system sans-serif fallback 적용)\n`);
      }
    });

    await page.goto(`file://${absInput}`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: absOutput,
      clip: { x: 0, y: 0, width, height },
    });

    console.log(`완료: ${absOutput}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  const parsed = parseArgs(process.argv);

  if (!parsed) {
    printUsage();
    process.exit(1);
  }

  try {
    await render(parsed);
  } catch (err) {
    console.error(`렌더링 실패: ${err.message}`);
    process.exit(1);
  }
})();
