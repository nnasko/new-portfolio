const puppeteer = require('puppeteer');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generatePDF() {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    
    const page = await browser.newPage();
    
    // Add styles to hide development elements
    await page.addStyleTag({
      content: `
        [data-nextjs-router-announcer],
        [data-nextjs-scroll-focus-boundary],
        #NextJSDevToolbar,
        button[aria-label="Toggle dark mode"],
        .pdf-hide {
          display: none !important;
        }
      `
    });
    
    console.log('Navigating to CV page...');
    await page.goto('http://localhost:3000/cv?pdf=true', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    console.log('Waiting for content...');
    await page.waitForSelector('main');
    
    // Small delay to ensure all styles are applied
    console.log('Waiting for styles to apply...');
    await delay(1000);
    
    // Set viewport to ensure proper rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });
    
    console.log('Generating PDF...');
    await page.pdf({
      path: './public/cv.pdf',
      format: 'A4',
      margin: {
        top: '20px',
        right: '40px',
        bottom: '40px',
        left: '40px'
      },
      printBackground: true
    });
    
    console.log('PDF generated successfully!');
    await browser.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
}

generatePDF(); 