import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Pricing config matching hire page
const PRICING_CONFIG = {
  basePackages: {
    personal: { min: 800, max: 1200, name: "Personal Website Package" },
    business: { min: 1200, max: 2000, name: "Business Website Package" }, 
    ecommerce: { min: 2000, max: 4000, name: "E-commerce Website Package" },
    saas: { min: 4000, max: 8000, name: "SaaS Platform Package" },
    enterprise: { min: 8000, max: 15000, name: "Enterprise Solution Package" }
  },
  features: {
    blog: { price: 100, name: "Blog/News Section" },
    booking: { price: 300, name: "Online Appointment Booking" },
    liveChat: { price: 150, name: "Live Chat Support" },
    multiLanguage: { price: 350, name: "Multiple Languages" },
    thirdParty: { price: 250, name: "Third-party Integrations" },
    automation: { price: 300, name: "Workflow Automation" }
  },
  additionalServices: {
    maintenance: { price: "monthly", name: "Maintenance Package" }, // Excluded from breakdown
    training: { price: 200, name: "Training Session" },
    content: { price: 500, name: "Content Creation" },
    seo: { price: 400, name: "Advanced SEO Setup" }
  }
};

// Calculate actual feature costs
function calculateFeatureCosts(features: string[], additionalServices: string[]) {
  const featureCosts = features.reduce((total, feature) => {
    const featureConfig = PRICING_CONFIG.features[feature as keyof typeof PRICING_CONFIG.features];
    return total + (featureConfig?.price || 0);
  }, 0);

  const serviceCosts = additionalServices
    .filter(service => service !== 'maintenance') // Exclude maintenance
    .reduce((total, service) => {
      const serviceConfig = PRICING_CONFIG.additionalServices[service as keyof typeof PRICING_CONFIG.additionalServices];
      return total + (typeof serviceConfig?.price === 'number' ? serviceConfig.price : 0);
    }, 0);

  return { featureCosts, serviceCosts };
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { inquiryId, clientId, finalPrice, notes } = await request.json();

    // Fetch inquiry and client data
    const [inquiry, client] = await Promise.all([
      prisma.inquiry.findUnique({
        where: { id: inquiryId }
      }),
      prisma.client.findUnique({
        where: { id: clientId }
      })
    ]);

    if (!inquiry || !client) {
      return NextResponse.json({ 
        success: false, 
        error: 'Inquiry or client not found' 
      }, { status: 404 });
    }

    // Generate quote acceptance URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/api/inquiries/accept-quote?id=${inquiryId}&token=${generateQuoteToken(inquiryId)}`;

    // Create cost breakdown from inquiry
    const breakdown = inquiry.breakdown as Record<string, unknown> || {};
    const features = Array.isArray(inquiry.selectedFeatures) ? inquiry.selectedFeatures : [];
    const additionalServices = Array.isArray(inquiry.selectedAdditionalServices) ? inquiry.selectedAdditionalServices : [];

    // Generate quote email HTML
    const emailHtml = generateQuoteEmailHTML({
      inquiry,
      client,
      finalPrice,
      notes,
      acceptUrl,
      features,
      additionalServices,
      breakdown
    });

    // Send quote email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.CONTACT_EMAIL!,
      to: client.email,
      subject: `Your Project Quote - ${inquiry.projectType} Website`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Error sending quote email:', emailError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to send quote email: ${emailError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Quote sent successfully',
      emailId: emailData?.id,
    });

  } catch (error) {
    console.error('Error in send-quote route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// Generate a simple token for quote acceptance
async function generateQuoteToken(inquiryId: string): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', secret).update(inquiryId).digest('hex').substring(0, 16);
}

// Generate the quote email HTML
function generateQuoteEmailHTML(data: {
  inquiry: Record<string, unknown>;
  client: Record<string, unknown>;
  finalPrice: number;
  notes?: string;
  acceptUrl: string;
  features: string[];
  additionalServices: string[];
  breakdown: Record<string, unknown>;
}) {
  const { inquiry, client, finalPrice, notes, acceptUrl, features, additionalServices } = data;
  const finalPriceFormatted = (finalPrice / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #fafafa;
          }
          .container {
            max-width: 650px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 0;
            box-shadow: none;
            border: 1px solid #e5e5e5;
            overflow: hidden;
          }
          .header {
            background: #ffffff;
            color: #1a1a1a;
            padding: 32px 40px 24px;
            text-align: left;
            border-bottom: 1px solid #e5e5e5;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 400;
            letter-spacing: -0.5px;
          }
          .header p {
            margin: 8px 0 0 0;
            opacity: 0.7;
            font-size: 14px;
            font-weight: 300;
          }
          .content {
            padding: 32px 40px;
          }
          .quote-summary {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            padding: 24px;
            margin: 24px 0;
            border-radius: 0;
          }
          .quote-price {
            font-size: 32px;
            font-weight: 500;
            color: #1a1a1a;
            margin: 0;
          }
          .quote-label {
            color: #6b7280;
            font-size: 13px;
            text-transform: none;
            letter-spacing: 0;
            margin-bottom: 6px;
            font-weight: 300;
          }
          .breakdown {
            margin: 24px 0;
          }
          .breakdown h3 {
            color: #1a1a1a;
            margin-bottom: 16px;
            font-size: 18px;
            font-weight: 400;
          }
          .breakdown-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #e5e5e5;
            font-size: 14px;
          }
          .breakdown-item:last-child {
            border-bottom: none;
            font-weight: 500;
            font-size: 16px;
            color: #1a1a1a;
            margin-top: 8px;
            padding-top: 12px;
            border-top: 1px solid #e5e5e5;
          }
          .breakdown-section {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 0;
            padding: 20px;
            margin: 16px 0;
          }
          .breakdown-section h4 {
            margin: 0 0 12px 0;
            color: #1a1a1a;
            display: flex;
            justify-content: space-between;
            font-size: 15px;
            font-weight: 500;
          }
          .breakdown-section ul {
            margin: 0;
            padding-left: 16px;
            color: #6b7280;
            font-size: 14px;
          }
          .breakdown-section li {
            margin: 3px 0;
          }
          .accept-button {
            display: inline-block;
            background: #1a1a1a;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 0;
            font-weight: 500;
            font-size: 15px;
            text-align: center;
            box-shadow: none;
            transition: background-color 0.2s;
            border: 1px solid #1a1a1a;
          }
          .accept-button:hover {
            background: #000000;
            transform: none;
            box-shadow: none;
          }
          .accept-section {
            text-align: center;
            margin: 32px 0;
            padding: 24px;
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 0;
          }
          .next-steps {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 0;
            padding: 20px;
            margin: 16px 0;
          }
          .next-steps h4 {
            margin: 0 0 12px 0;
            color: #1a1a1a;
            font-weight: 500;
          }
          .next-steps ol {
            margin: 0;
            padding-left: 16px;
            color: #6b7280;
            font-size: 14px;
          }
          .footer {
            background: #fafafa;
            padding: 24px 40px;
            text-align: left;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e5e5;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
            <p>Professional Web Development Services</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1a1a1a; margin-bottom: 16px;">Hello ${client.name},</h2>
            
            <p>Thank you for your interest in our ${inquiry.projectType} website development services. Based on your requirements, I've prepared a detailed quote for your project.</p>
            
                         <div class="quote-summary">
               <div class="quote-label">Project Quote</div>
               <div class="quote-price">£${finalPriceFormatted}</div>
               <p style="margin: 8px 0 0 0; color: #6b7280;">Fixed price for complete ${inquiry.projectType} website</p>
             </div>

             <!-- Project Overview -->
             <div style="margin: 24px 0; padding: 20px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 0;">
               <h3 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 16px; font-weight: 500;">Project Overview</h3>
               <div style="space-y: 12px;">
                 <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;"><strong style="color: #1a1a1a;">Project Type:</strong> ${inquiry.projectType} Website</p>
                 <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;"><strong style="color: #1a1a1a;">Business Goal:</strong> ${inquiry.projectGoal}</p>
                 ${inquiry.targetAudience ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;"><strong style="color: #1a1a1a;">Target Audience:</strong> ${inquiry.targetAudience}</p>` : ''}
                 ${inquiry.timeline ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;"><strong style="color: #1a1a1a;">Timeline:</strong> ${inquiry.timeline === 'rush' ? '2-3 weeks (rush)' : inquiry.timeline === 'normal' ? '4-6 weeks (standard)' : '6-8 weeks (flexible)'}</p>` : ''}
                 ${inquiry.designPreference && typeof inquiry.designPreference === 'string' ? `<p style="margin: 0; font-size: 14px; color: #6b7280;"><strong style="color: #1a1a1a;">Design Style:</strong> ${inquiry.designPreference.replace(/_/g, ' ')}</p>` : ''}
               </div>
             </div>

             <!-- Detailed Breakdown -->
             <div style="margin: 32px 0;">
               <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px;">Detailed Project Breakdown</h3>
               
                              <!-- Core Development -->
               <div style="margin-bottom: 24px; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
                 <h4 style="margin: 0 0 12px 0; color: #374151; display: flex; justify-content: space-between;">
                   <span>Core ${inquiry.projectType} Website</span>
                   <span>£${(() => {
                     const costs = calculateFeatureCosts(features, additionalServices);
                     const totalPrice = finalPrice / 100;
                     const corePrice = totalPrice - costs.featureCosts - costs.serviceCosts;
                     return Math.round(corePrice).toLocaleString();
                   })()}</span>
                 </h4>
                 <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                   <li>Custom ${inquiry.projectType} website design & development</li>
                   <li>Mobile-responsive design (works on all devices)</li>
                   <li>Professional ${inquiry.projectType} layout and structure</li>
                   <li>Cross-browser compatibility (Chrome, Firefox, Safari, Edge)</li>
                   <li>Performance optimization & fast loading speeds</li>
                   <li>Basic SEO setup (meta tags, site structure)</li>
                   <li>SSL certificate & secure hosting setup</li>
                 </ul>
               </div>

               ${features.length > 0 ? `
                 <!-- Selected Features -->
                 <div style="margin-bottom: 24px; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
                   <h4 style="margin: 0 0 12px 0; color: #374151; display: flex; justify-content: space-between;">
                     <span>Selected Features</span>
                     <span>£${calculateFeatureCosts(features, additionalServices).featureCosts.toLocaleString()}</span>
                   </h4>
                   <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                     ${features.map(feature => {
                       const featureConfig = PRICING_CONFIG.features[feature as keyof typeof PRICING_CONFIG.features];
                       return `<li>${formatFeatureName(feature)} ${featureConfig ? `(£${featureConfig.price})` : ''}</li>`;
                     }).join('')}
                   </ul>
                 </div>
               ` : ''}

               ${additionalServices.filter(service => service !== 'maintenance').length > 0 ? `
                 <!-- Additional Services -->
                 <div style="margin-bottom: 24px; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
                   <h4 style="margin: 0 0 12px 0; color: #374151; display: flex; justify-content: space-between;">
                     <span>Additional Services</span>
                     <span>£${calculateFeatureCosts(features, additionalServices).serviceCosts.toLocaleString()}</span>
                   </h4>
                   <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                     ${additionalServices.filter(service => service !== 'maintenance').map(service => {
                       const serviceConfig = PRICING_CONFIG.additionalServices[service as keyof typeof PRICING_CONFIG.additionalServices];
                       return `<li>${formatFeatureName(service)} ${serviceConfig && typeof serviceConfig.price === 'number' ? `(£${serviceConfig.price})` : ''}</li>`;
                     }).join('')}
                   </ul>
                 </div>
               ` : ''}

               ${additionalServices.includes('maintenance') ? `
                 <!-- Maintenance (Separate) -->
                 <div style="margin-bottom: 16px; padding: 20px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 0;">
                   <h4 style="margin: 0 0 12px 0; color: #1a1a1a; display: flex; justify-content: space-between; font-size: 15px; font-weight: 500;">
                     <span>Maintenance Package</span>
                     <span>£${inquiry.projectType === 'business' ? '100' : inquiry.projectType === 'ecommerce' ? '150' : '50'}/month</span>
                   </h4>
                   <p style="margin: 0; color: #6b7280; font-size: 14px;">
                     Note: Maintenance is billed separately starting month 2. Includes updates, security patches, and technical support.
                   </p>
                 </div>
               ` : ''}

               <!-- What's Included -->
               <div style="margin-bottom: 16px; padding: 20px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 0;">
                 <h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">Always Included (No Extra Cost)</h4>
                 <ul style="margin: 0; padding-left: 16px; color: #6b7280; font-size: 14px;">
                   <li>Professional project management & communication</li>
                   <li>Regular progress updates & previews</li>
                   <li>Quality assurance & testing</li>
                   <li>1 month post-launch support & bug fixes</li>
                   <li>Basic training on content management</li>
                   <li>Website launch & deployment</li>
                 </ul>
               </div>

               <!-- Total -->
               <div style="padding: 20px; background: #fafafa; color: #1a1a1a; border: 1px solid #e5e5e5; border-radius: 0; text-align: center;">
                 <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">Total Project Investment</div>
                 <div style="font-size: 28px; font-weight: 500;">£${finalPriceFormatted}</div>
                 <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">Fixed price - no hidden fees</div>
               </div>
             </div>

            <div class="next-steps">
              <h4>Next Steps</h4>
              <ol>
                <li>Review the quote and project details</li>
                                 <li>Click "Accept Quote" below to confirm your project</li>
                 <li>Receive service agreement for digital signature</li>
                 <li>Receive project invoice with payment details</li>
                 <li>50% deposit secures your project start date</li>
                 <li>Regular updates throughout development process</li>
               </ol>
             </div>

             <!-- Payment Terms -->
             <div style="margin: 16px 0; padding: 20px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 0;">
               <h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">Payment Structure</h4>
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; color: #6b7280;">
                 <div>
                   <div style="font-weight: 500; color: #1a1a1a; font-size: 14px;">50% Deposit</div>
                   <div style="font-size: 20px; font-weight: 500; color: #1a1a1a;">£${(parseFloat(finalPriceFormatted.replace(/,/g, '')) / 2).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
                   <div style="font-size: 13px;">Due: Upon project commencement</div>
                 </div>
                 <div>
                   <div style="font-weight: 500; color: #1a1a1a; font-size: 14px;">Final Payment</div>
                   <div style="font-size: 20px; font-weight: 500; color: #1a1a1a;">£${(parseFloat(finalPriceFormatted.replace(/,/g, '')) / 2).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
                   <div style="font-size: 13px;">Due: Upon project completion</div>
                 </div>
               </div>
             </div>

            ${notes ? `
              <div style="margin: 16px 0; padding: 20px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 0;">
                <h4 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">Additional Notes</h4>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${notes}</p>
              </div>
            ` : ''}

                         <div class="accept-section">
               <h3 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 20px; font-weight: 500;">Ready to get started?</h3>
               <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">Click the button below to accept this quote and begin your project. No payment required yet - just confirmation to proceed.</p>
               <a href="${acceptUrl}" class="accept-button">Accept Quote & Start Project</a>
               <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 13px;">Secure acceptance • No spam • Professional service guaranteed</p>
             </div>

            <p style="color: #6b7280; font-size: 14px; margin: 32px 0 0 0;">
              This quote is valid for 30 days. If you have any questions or would like to discuss the project further, please don't hesitate to reach out.
            </p>
          </div>

          <div class="footer">
            <p>Best regards,<br>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
            <p style="margin-top: 16px;">This quote was generated on ${new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Format feature names for display
function formatFeatureName(feature: string): string {
  const featureMap: { [key: string]: string } = {
    'responsive_design': 'Responsive Design (mobile-first approach)',
    'seo_optimization': 'SEO Optimization (search engine ready)',
    'contact_form': 'Contact Form (with spam protection)',
    'social_media': 'Social Media Integration (Instagram, LinkedIn, etc.)',
    'analytics': 'Analytics Setup (Google Analytics & tracking)',
    'ssl_certificate': 'SSL Certificate (secure HTTPS)',
    'hosting_setup': 'Hosting Setup (performance optimized)',
    'domain_setup': 'Domain Setup (DNS configuration)',
    'content_management': 'Content Management System (easy editing)',
    'ecommerce': 'E-commerce Functionality (online store)',
    'booking_system': 'Booking System (appointment scheduling)',
    'user_accounts': 'User Account System (login/registration)',
    'payment_integration': 'Payment Integration (Stripe/PayPal)',
    'api_integration': 'API Integration (third-party services)',
    'maintenance': 'Maintenance Package (6 months included)',
    'training': 'Training Session (1-hour walkthrough)',
    'content_creation': 'Content Creation (copywriting support)',
    'logo_design': 'Logo Design (custom brand identity)',
    'branding': 'Branding Package (complete visual identity)',
    'blog': 'Blog System (content publishing platform)',
    'booking': 'Booking System (appointment management)',
    'gallery': 'Image Gallery (portfolio showcase)',
    'testimonials': 'Customer Testimonials (social proof)',
    'newsletter': 'Newsletter Signup (email marketing)',
    'live_chat': 'Live Chat Support (customer service)',
    'multi_language': 'Multi-language Support (internationalization)',
    'search': 'Site Search (find content easily)',
    'custom_forms': 'Custom Forms (lead generation)',
    'membership': 'Membership System (exclusive content)'
  };
  
  return featureMap[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
} 