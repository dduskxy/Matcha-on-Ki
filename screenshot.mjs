import puppeteer from 'puppeteer';

const CHROME = 'C:\\Users\\asus\\.cache\\puppeteer\\chrome\\win64-152.0.7977.54\\chrome-win64\\chrome.exe';
const OUT = 'C:\\Users\\asus\\.gemini\\antigravity-cli\\brain\\fa0ea6b7-5431-4b55-9b38-f61b7e9194b1';

const pages = [
  { url: 'http://localhost:5175/Matcha-on-Ki/', file: 'home.png', wait: 3500 },
  { url: 'http://localhost:5175/Matcha-on-Ki/#/menu', file: 'menu.png', wait: 2500 },
  { url: 'http://localhost:5175/Matcha-on-Ki/#/about', file: 'about.png', wait: 2000 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

for (const { url, file, wait } of pages) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, wait));
  await page.screenshot({ path: `${OUT}\\${file}` });
  console.log('captured', file);
}

await browser.close();
