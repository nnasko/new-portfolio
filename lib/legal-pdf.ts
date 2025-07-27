import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';

interface ServiceAgreementForPdf {
  id: string;
  documentNumber: string;
  title: string;
  content: string;
  clientSignature?: string;
  Client?: {
    name: string;
    email: string;
    address: string;
  };
}

function getAdminSignature(): string {
  try {
    const signaturePath = path.join(process.cwd(), 'public', 'signature.svg');
    if (fs.existsSync(signaturePath)) {
      const svgContent = fs.readFileSync(signaturePath, 'utf-8');
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    }
  } catch (error) {
    console.error('Error loading admin signature:', error);
  }
  return '';
}

function updateContentWithSignatures(content: string, clientSignature?: string): string {
  const adminSignature = getAdminSignature();
  
  // More robust replacement to target the specific signature section
  const updatedContent = content.replace(
    // Target the signature section specifically
    /<div style="margin-top: 50px; padding: 30px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; page-break-inside: avoid;">[\s\S]*?<\/div>/g,
    `<div style="margin-top: 50px; padding: 30px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; page-break-inside: avoid;">
      <h4 style="margin: 0 0 30px 0; font-weight: 600; text-align: center; font-size: 16px; color: #495057;">SIGNATURE SECTION</h4>
        
      <div style="display: flex; justify-content: space-between; gap: 40px; margin-top: 30px;">
        <div style="flex: 1; text-align: center;">
          <div style="border-bottom: 2px solid #333; height: 50px; margin-bottom: 15px; background: #ffffff; display: flex; align-items: center; justify-content: center; position: relative;">
            ${clientSignature ? `<img src="${clientSignature}" style="max-height: 40px; max-width: 180px; position: absolute; bottom: 5px;" alt="Client Signature" />` : ''}
          </div>
          <div style="text-align: center;">
            <p style="margin: 0; font-weight: 600; font-size: 14px;">${content.match(/Client.*?:.*?<strong>(.*?)<\/strong>/)?.[1] || 'Client Name'}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Client Signature</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Date: ${clientSignature ? new Date().toLocaleDateString('en-GB') : '_____________'}</p>
          </div>
        </div>
        <div style="flex: 1; text-align: center;">
          <div style="border-bottom: 2px solid #333; height: 50px; margin-bottom: 15px; background: #ffffff; display: flex; align-items: center; justify-content: center; position: relative;">
            ${adminSignature ? `<img src="${adminSignature}" style="max-height: 40px; max-width: 180px; position: absolute; bottom: 5px;" alt="Service Provider Signature" />` : ''}
          </div>
          <div style="text-align: center;">
            <p style="margin: 0; font-weight: 600; font-size: 14px;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Service Provider</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Date: ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>
    </div>`
  );
  
  return updatedContent;
}

export async function generateServiceAgreementPDF(document: ServiceAgreementForPdf): Promise<Buffer> {
  let browser = null;
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    if (isProduction) {
      console.log('Production environment detected. Using puppeteer-core with @sparticuz/chromium...');
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      console.log('Development environment detected. Using standard puppeteer...');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    
    console.log('Browser launched successfully for service agreement PDF generation.');
    const page = await browser.newPage();
    console.log('New page created for service agreement.');
    
    // Update content with signatures
    const updatedContent = updateContentWithSignatures(document.content, document.clientSignature);
    
    // Create the full HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page {
              margin: 2cm;
              size: A4;
            }
            
            body {
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #1a1a1a;
              margin: 0;
              padding: 0;
            }
            
            h1, h2, h3, h4 {
              color: #1a1a1a;
              margin-top: 16px;
              margin-bottom: 8px;
              font-weight: 500;
            }
            
            h1 { font-size: 16pt; font-weight: 400; letter-spacing: -0.5px; }
            h2 { font-size: 14pt; font-weight: 500; }
            h3 { font-size: 12pt; font-weight: 500; }
            h4 { font-size: 11pt; font-weight: 500; }
            
            p {
              margin: 12px 0;
              text-align: justify;
            }
            
            strong {
              font-weight: bold;
            }
            
            ul, ol {
              margin: 12px 0;
              padding-left: 30px;
            }
            
            li {
              margin: 6px 0;
            }
            
            .header {
              text-align: left;
              margin-bottom: 32px;
              border-bottom: 1px solid #e5e5e5;
              padding-bottom: 16px;
            }
            
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            
            .signature-block {
              width: 45%;
            }
            
            .signature-line {
              border-bottom: 1px solid #1a1a1a;
              margin-bottom: 8px;
              height: 30px;
              display: flex;
              align-items: end;
              justify-content: center;
            }
            
            .footer {
              margin-top: 32px;
              font-size: 9pt;
              color: #6b7280;
              border-top: 1px solid #e5e5e5;
              padding-top: 16px;
            }
            
            .document-number {
              text-align: right;
              font-size: 9pt;
              color: #6b7280;
              margin-bottom: 16px;
            }
            
            .content-section {
              background: #fafafa;
              border: 1px solid #e5e5e5;
              padding: 16px;
              margin: 16px 0;
            }
          </style>
        </head>
        <body>
          <div class="document-number">
            Doc: ${document.documentNumber}
          </div>
          
          ${updatedContent}
          
          <div class="footer">
            <p><strong>Document Generated:</strong> ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}</p>
            <p><strong>Document ID:</strong> ${document.documentNumber}</p>
            ${document.Client ? `<p><strong>Client:</strong> ${document.Client.name}</p>` : ''}
          </div>
        </body>
      </html>
    `;
    
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('HTML content set for service agreement PDF.');
    
    // Generate PDF with specific options for service agreements
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          ${document.title}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });
    
    console.log('Service agreement PDF generated successfully.');
    return Buffer.from(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating service agreement PDF:', error);
    throw new Error(`Failed to generate service agreement PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed after service agreement PDF generation.');
    }
  }
} 