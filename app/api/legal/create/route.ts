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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #333; max-width: 850px; margin: 0 auto; padding: 40px 20px;">
      
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; color: #333; font-weight: 300; letter-spacing: -0.5px;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">Professional Web Development Services</p>
      </div>

      <h2 style="text-align: center; margin: 30px 0; font-size: 24px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">FREELANCE WEB DEVELOPMENT SERVICE AGREEMENT</h2>
        
      <div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-left: 4px solid #007bff; border-radius: 4px;">
        <h3 style="margin: 0 0 20px 0; color: #495057; font-size: 18px; font-weight: 600;">PARTIES TO THIS AGREEMENT</h3>
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #495057;">Date of Agreement:</span> ${currentDate}
        </div>
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #495057;">Client ("you"):</span><br>
          <div style="margin-left: 15px; margin-top: 5px;">
            <strong>${clientData.name}</strong><br>
            ${clientData.email}<br>
            ${clientData.address.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div>
          <span style="font-weight: 600; color: #495057;">Service Provider ("we/us"):</span><br>
          <div style="margin-left: 15px; margin-top: 5px;">
            <strong>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</strong><br>
            Freelance Web Development Services<br>
            United Kingdom
          </div>
        </div>
      </div>

      ${projectDescription ? `
      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">PROJECT DESCRIPTION</h3>
        <div style="padding: 20px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px; line-height: 1.6;">${projectDescription}</p>
        </div>
      </div>
      ` : ''}

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">1. SCOPE OF SERVICES</h3>
        <p style="margin-bottom: 15px; font-size: 15px;">We agree to provide professional web development services including, but not limited to:</p>
        <ul style="margin: 0; padding-left: 25px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px 25px; font-size: 14px; line-height: 1.6;">
          <li style="margin-bottom: 8px;">Website design and user interface development</li>
          <li style="margin-bottom: 8px;">Frontend and backend development as specified</li>
          <li style="margin-bottom: 8px;">Responsive design for mobile and desktop devices</li>
          <li style="margin-bottom: 8px;">Content management system implementation (where applicable)</li>
          <li style="margin-bottom: 8px;">Search engine optimisation (basic on-page SEO)</li>
          <li style="margin-bottom: 8px;">Cross-browser compatibility testing</li>
          <li style="margin-bottom: 8px;">Performance optimisation</li>
          <li style="margin-bottom: 8px;">Documentation and training materials</li>
          <li style="margin-bottom: 8px;">Post-launch support as specified in project scope</li>
          <li style="margin-bottom: 0;">Project management and regular progress updates</li>
        </ul>
      </div>

      ${estimatedValue ? `
      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">2. PROJECT VALUE & PAYMENT TERMS</h3>
        <div style="padding: 20px; background: #e7f3ff; border: 1px solid #b8daff; border-radius: 4px; margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0; font-size: 18px;"><strong>Total Project Value:</strong> <span style="color: #007bff; font-weight: 600;">£${estimatedValue.toFixed(2)}</span></p>
          <p style="margin: 0; font-size: 14px; color: #666;">Fixed price for complete project as specified</p>
        </div>
      </div>
      ` : ''}

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${estimatedValue ? '3' : '2'}. PAYMENT TERMS</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px;">
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 8px;"><strong>Deposit:</strong> 50% of total project value required before commencement of work</li>
            <li style="margin-bottom: 8px;"><strong>Final Payment:</strong> 50% balance due upon project completion and delivery</li>
            <li style="margin-bottom: 8px;"><strong>Payment Terms:</strong> Net 30 days from invoice date</li>
            <li style="margin-bottom: 8px;"><strong>Late Payment:</strong> Interest charges of 1.5% per month on overdue amounts</li>
            <li style="margin-bottom: 8px;"><strong>Currency:</strong> All payments in British Pounds (GBP)</li>
            <li style="margin-bottom: 0;"><strong>Methods:</strong> Bank transfer or online payment via secure payment link</li>
          </ul>
        </div>
      </div>

      ${timeline ? `
      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${estimatedValue ? '4' : '3'}. PROJECT TIMELINE</h3>
        <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Estimated Timeline:</strong> ${timeline}</p>
          <p style="margin: 0; font-size: 14px; color: #856404;">Timeline commences upon receipt of deposit payment and all required assets/content from client.</p>
        </div>
      </div>
      ` : ''}

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '5' : (estimatedValue || timeline) ? '4' : '3'}. INTELLECTUAL PROPERTY RIGHTS</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>Client Ownership:</strong> Upon full payment of all invoices, you will own all rights, title, and interest in the custom website, including source code, design elements, and content created specifically for your project.</p>
          <p style="margin: 0 0 15px 0;"><strong>Service Provider Rights:</strong> We retain rights to:</p>
          <ul style="margin: 0 0 15px 20px; padding-left: 15px;">
            <li style="margin-bottom: 5px;">General methodologies, frameworks, and development techniques</li>
            <li style="margin-bottom: 5px;">Pre-existing intellectual property and open-source components</li>
            <li style="margin-bottom: 0;">Portfolio rights to display completed work for marketing purposes</li>
          </ul>
          <p style="margin: 0;"><strong>Third-Party Components:</strong> Any third-party software, plugins, or components remain subject to their respective licenses.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '6' : (estimatedValue || timeline) ? '5' : '4'}. CLIENT RESPONSIBILITIES</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px;">
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">Provide all required content, images, and materials in a timely manner</li>
            <li style="margin-bottom: 8px;">Respond to requests for feedback and approval within 5 business days</li>
            <li style="margin-bottom: 8px;">Ensure all provided content is legally owned and properly licensed</li>
            <li style="margin-bottom: 8px;">Provide access to hosting accounts, domain registrars, and third-party services as needed</li>
            <li style="margin-bottom: 0;">Test and review deliverables thoroughly before final approval</li>
          </ul>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '7' : (estimatedValue || timeline) ? '6' : '5'}. REVISIONS & ADDITIONAL WORK</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>Included Revisions:</strong> Up to 3 rounds of reasonable revisions are included in the project price.</p>
          <p style="margin: 0 0 15px 0;"><strong>Additional Work:</strong> Any work beyond the agreed scope will be quoted separately at our standard hourly rate of £30/hour.</p>
          <p style="margin: 0;"><strong>Major Changes:</strong> Significant scope changes may require a new project agreement and timeline adjustment.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '8' : (estimatedValue || timeline) ? '7' : '6'}. LIMITATION OF LIABILITY</h3>
        <div style="background: #fff8e1; border: 1px solid #ffcc02; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;">Our liability is limited to the total amount paid under this agreement. We shall not be liable for any indirect, consequential, or incidental damages, including but not limited to loss of profits, data, or business opportunities.</p>
          <p style="margin: 0;"><strong>Website Availability:</strong> We do not guarantee uninterrupted website operation, as this depends on hosting, internet connectivity, and third-party services beyond our control.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '9' : (estimatedValue || timeline) ? '8' : '7'}. DATA PROTECTION & CONFIDENTIALITY</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>GDPR Compliance:</strong> We will process personal data in accordance with UK GDPR and Data Protection Act 2018.</p>
          <p style="margin: 0 0 15px 0;"><strong>Confidentiality:</strong> Both parties agree to keep confidential all proprietary information shared during this engagement.</p>
          <p style="margin: 0;"><strong>Data Security:</strong> We implement appropriate technical and organisational measures to protect your data.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '10' : (estimatedValue || timeline) ? '9' : '8'}. TERMINATION</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>By Client:</strong> You may terminate this agreement with 7 days written notice. Payment is due for all work completed to date.</p>
          <p style="margin: 0 0 15px 0;"><strong>By Service Provider:</strong> We may terminate for non-payment or material breach with 30 days written notice.</p>
          <p style="margin: 0;"><strong>Upon Termination:</strong> All work completed will be delivered, and final invoices settled within 30 days.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '11' : (estimatedValue || timeline) ? '10' : '9'}. FORCE MAJEURE</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0;">Neither party shall be liable for delays or failure to perform due to causes beyond reasonable control, including but not limited to acts of God, government actions, pandemics, natural disasters, or technical failures of third-party services.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">${(estimatedValue && timeline) ? '12' : (estimatedValue || timeline) ? '11' : '10'}. GOVERNING LAW & JURISDICTION</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;">This agreement is governed by the laws of England and Wales.</p>
          <p style="margin: 0;">Any disputes shall be subject to the exclusive jurisdiction of the English courts. Both parties agree to attempt resolution through mediation before pursuing litigation.</p>
        </div>
      </div>

      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">DIGITAL SIGNATURE & AGREEMENT</h3>
        <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;">This agreement may be executed electronically. Digital signatures are legally binding and equivalent to handwritten signatures under the Electronic Communications Act 2000.</p>
          <p style="margin: 0;"><strong>By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this agreement.</strong></p>
        </div>
      </div>

      <div style="margin-top: 50px; padding: 30px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; page-break-inside: avoid;">
        <h4 style="margin: 0 0 30px 0; font-weight: 600; text-align: center; font-size: 16px; color: #495057;">SIGNATURE SECTION</h4>
          
        <div style="display: flex; justify-content: space-between; gap: 40px; margin-top: 30px;">
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

      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #dee2e6; padding-top: 20px;">
        <p style="margin: 0;">This agreement consists of ${(estimatedValue && timeline) ? '12' : (estimatedValue || timeline) ? '11' : '10'} sections and constitutes the entire agreement between the parties.</p>
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
    }) as {
      id: string;
      name: string;
      email?: string;
      emails?: string[];
      address: string;
    } | null;

    if (!client) {
      return NextResponse.json({ 
        success: false,
        error: 'Client not found' 
      }, { status: 404 });
    }

    // Generate unique document number
    const documentNumber = await generateUniqueDocumentNumber();

    // Ensure client data is compatible (handle both old and new schema)
    const clientData: ClientData = {
      id: client.id,
      name: client.name,
      email: client.email || (client.emails && client.emails.length > 0 ? client.emails[0] : ''),
      address: client.address
    };

    // Generate service agreement content
    const content = generateServiceAgreementContent(
      clientData,
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