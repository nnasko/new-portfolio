import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();
    console.log('Starting PDF generation...');
    console.log('Theme:', theme);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    console.log('Browser launched');
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Get base URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://atanaskyurkchiev.info' 
      : 'http://localhost:3000';
    
    const url = `${baseUrl}/api/cv/html?theme=${theme}`;
    
    console.log('Navigating to:', url);
    
    // Navigate with longer timeout
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('Page loaded, status:', response?.status());
    
    // Wait for content to fully render
    await delay(5000);
    
    // Check if content is present
    const contentCheck = await page.evaluate(() => {
      const container = document.querySelector('.container');
      const header = document.querySelector('header');
      const sections = document.querySelectorAll('section');
      
      return {
        hasContainer: !!container,
        hasHeader: !!header,
        sectionCount: sections.length,
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    
    console.log('Content check:', contentCheck);
    
    console.log('Generating PDF...');
    
    // Generate PDF with basic settings
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    console.log('PDF generated successfully, size:', pdf.length);
    
    await browser.close();
    
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="atanas-kyurkchiev-cv-${theme}.pdf"`,
        'Content-Length': pdf.length.toString()
      }
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
} 