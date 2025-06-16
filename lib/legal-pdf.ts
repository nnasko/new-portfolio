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
  
  // Find and replace the signature section
  const signatureSection = `
    <div style="margin-top: 60px; page-break-inside: avoid;">
      <p style="margin-bottom: 40px;"><strong>By signing below, both parties agree to the terms outlined in this agreement:</strong></p>
      
      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <div style="width: 45%;">
          <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 10px; display: flex; align-items: end; justify-content: center;">
            ${clientSignature ? `<img src="${clientSignature}" style="max-height: 35px; max-width: 200px;" alt="Client Signature" />` : ''}
          </div>
          <p><strong>Client</strong><br>Client Signature<br>Date: ${clientSignature ? new Date().toLocaleDateString('en-GB') : '_____________'}</p>
        </div>
        <div style="width: 45%;">
          <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 10px; display: flex; align-items: end; justify-content: center;">
            ${adminSignature ? `<img src="${adminSignature}" style="max-height: 35px; max-width: 200px;" alt="Admin Signature" />` : ''}
          </div>
          <p><strong>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</strong><br>Service Provider<br>Date: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>
    </div>
  `;

  // Replace the existing signature section
  return content.replace(
    /<div style="margin-top: 60px;[^>]*?>[\s\S]*?<\/div>\s*$/,
    signatureSection
  );
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
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              margin: 0;
              padding: 0;
            }
            
            h1, h2, h3, h4 {
              color: #000;
              margin-top: 24px;
              margin-bottom: 12px;
            }
            
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; }
            h3 { font-size: 14pt; }
            h4 { font-size: 12pt; }
            
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
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            
            .debt-warning {
              background: #fff3cd;
              border: 2px solid #856404;
              padding: 15px;
              margin: 20px 0;
            }
            
            .signature-section {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            
            .signature-block {
              width: 45%;
            }
            
            .signature-line {
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
              height: 20px;
            }
            
            .footer {
              margin-top: 40px;
              font-size: 10pt;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }
            
            .document-number {
              text-align: right;
              font-size: 10pt;
              color: #666;
              margin-bottom: 20px;
            }
            
            .signature-ready {
              background: #e8f5e8;
              border-left: 4px solid #4caf50;
              padding: 15px;
              margin: 20px 0;
              font-size: 11pt;
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