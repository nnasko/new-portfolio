import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

interface CreateServiceAgreementRequest {
  clientId: string;
  title: string;
  projectDescription?: string;
  estimatedValue?: number;
  timeline?: string;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  address: string;
}

async function generateUniqueDocumentNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Generate a simple sequential number for this month
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SA-${year}${month}-${randomSuffix}`;
}

function generateServiceAgreementContent(
  clientData: ClientData, 
  projectDescription?: string,
  estimatedValue?: number,
  timeline?: string
): string {
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px;">
      
      <div style="text-align: center; margin-bottom: 50px; border-bottom: 2px solid #333; padding-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; color: #333; font-weight: 300; letter-spacing: -0.5px;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 16px; text-transform: lowercase;">Professional Services</p>
      </div>

      <h2 style="text-align: center; margin: 40px 0; font-size: 24px; font-weight: 400; text-transform: uppercase; letter-spacing: 1px;">SERVICE AGREEMENT</h2>
        
      <div style="margin: 40px 0; padding: 30px; background: #f8f9fa; border-left: 4px solid #007bff;">
        <div style="margin-bottom: 20px;">
          <span style="font-weight: 600; color: #495057;">Date:</span> ${currentDate}
        </div>
        <div style="margin-bottom: 20px;">
          <span style="font-weight: 600; color: #495057;">Client:</span> ${clientData.name}<br>
          <span style="font-weight: 600; color: #495057;">Email:</span> ${clientData.email}<br>
          <span style="font-weight: 600; color: #495057;">Address:</span><br>
          <div style="margin-left: 20px; margin-top: 5px;">${clientData.address.replace(/\n/g, '<br>')}</div>
        </div>
        <div>
          <span style="font-weight: 600; color: #495057;">Service Provider:</span> ${process.env.NEXT_PUBLIC_ACCOUNT_NAME}
        </div>
      </div>

      ${projectDescription ? `
      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">PROJECT DESCRIPTION</h3>
        <p style="margin: 0; padding: 15px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px;">${projectDescription}</p>
      </div>
      ` : ''}

      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">SCOPE OF SERVICES</h3>
        <p style="margin-bottom: 15px;">The Service Provider agrees to provide professional services including:</p>
        <ul style="margin: 0; padding-left: 30px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px 30px;">
          <li style="margin-bottom: 8px;">Service design and implementation</li>
          <li style="margin-bottom: 8px;">Professional consultation and guidance</li>
          <li style="margin-bottom: 8px;">Quality assurance and testing</li>
          <li style="margin-bottom: 8px;">Documentation and support</li>
          <li style="margin-bottom: 8px;">Project management and coordination</li>
          <li style="margin-bottom: 0;">Delivery and implementation assistance</li>
        </ul>
      </div>

      ${estimatedValue ? `
      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">PROJECT VALUE</h3>
        <div style="padding: 20px; background: #e7f3ff; border: 1px solid #b8daff; border-radius: 4px;">
          <p style="margin: 0; font-size: 18px;"><strong>Estimated Project Value:</strong> <span style="color: #007bff; font-weight: 600;">£${estimatedValue.toFixed(2)}</span></p>
        </div>
      </div>
      ` : ''}

      ${timeline ? `
      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">TIMELINE</h3>
        <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0; font-size: 16px;"><strong>Estimated Timeline:</strong> ${timeline}</p>
        </div>
      </div>
      ` : ''}

      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">PAYMENT TERMS</h3>
        <ul style="margin: 0; padding-left: 30px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px 30px;">
          <li style="margin-bottom: 8px;">50% deposit required before work commences</li>
          <li style="margin-bottom: 8px;">50% balance due upon project completion</li>
          <li style="margin-bottom: 0;">Payment terms: Net 30 days from invoice date</li>
        </ul>
      </div>

      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">INTELLECTUAL PROPERTY</h3>
        <p style="margin: 0; padding: 15px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px;">Upon full payment, ${clientData.name} will own all rights to the delivered work product. The Service Provider retains rights to general methodologies and frameworks.</p>
      </div>

      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;">DIGITAL SIGNATURE</h3>
        <p style="margin: 0; padding: 15px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px;">This agreement can be signed digitally by both parties. Digital signatures have the same legal validity as handwritten signatures.</p>
      </div>

      <div style="margin-top: 60px; padding: 30px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; page-break-inside: avoid;">
        <p style="margin-bottom: 40px; font-weight: 600; text-align: center; font-size: 16px;">By signing below, both parties agree to the terms outlined in this agreement:</p>
          
        <div style="display: flex; justify-content: space-between; gap: 40px; margin-top: 40px;">
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 2px solid #333; height: 50px; margin-bottom: 15px; background: #ffffff;"></div>
            <div style="text-align: center;">
              <p style="margin: 0; font-weight: 600; font-size: 14px;">${clientData.name}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Client Signature</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Date: _____________</p>
            </div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 2px solid #333; height: 50px; margin-bottom: 15px; background: #ffffff;"></div>
            <div style="text-align: center;">
              <p style="margin: 0; font-weight: 600; font-size: 14px;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Service Provider</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Date: ${currentDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const requestData: CreateServiceAgreementRequest = await request.json();
    
    // Validate required fields
    if (!requestData.clientId || !requestData.title) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields (clientId, title)' 
      }, { status: 400 });
    }

    // Fetch client data
    const client = await prisma.client.findUnique({
      where: { id: requestData.clientId }
    });

    if (!client) {
      return NextResponse.json({ 
        success: false,
        error: 'Client not found' 
      }, { status: 404 });
    }

    // Generate unique document number
    const documentNumber = await generateUniqueDocumentNumber();

    // Generate service agreement content
    const content = generateServiceAgreementContent(
      client,
      requestData.projectDescription,
      requestData.estimatedValue,
      requestData.timeline
    );

    // Create the service agreement in the database
    const document = await prisma.legalDocument.create({
      data: {
        documentNumber,
        title: requestData.title,
        documentType: 'SERVICE_AGREEMENT',
        content,
        status: 'DRAFT',
        clientId: requestData.clientId,
        signatureRequired: true,
        legalBasis: 'Contract Law',
        jurisdiction: 'England & Wales',
      },
      include: {
        Client: true,
      }
    });

    return NextResponse.json({ 
      success: true,
      document 
    });
  } catch (error) {
    console.error('Error creating service agreement:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create service agreement' 
    }, { status: 500 });
  }
} 