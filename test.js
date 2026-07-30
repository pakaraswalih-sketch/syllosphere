import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  // Go to localhost:3000 where the user's dev server is running
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  
  // wait for react to render
  await new Promise(r => setTimeout(r, 2000));
  
  // try to login or see if there is an error immediately
  // Or check if hash is `#userDashboard` what happens?
  await page.goto('http://localhost:3000/#userDashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
