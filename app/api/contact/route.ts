import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "../../../lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Handle both old contact form and new hire form data structures
    const isHireForm = data.businessType !== undefined;
    
    if (isHireForm) {
      // New hire form structure
      const {
        name, email, company, phone,
        projectType, businessType, currentChallenge, projectGoal, targetAudience, hasExistingWebsite,
        selectedFeatures = [], selectedAdditionalServices = [], designPreference, timeline, contentReady,
        message, hearAboutUs, budget
      } = data;

      // Validate required fields for hire form
      if (!name || !email || !projectType || !projectGoal || !message) {
        return NextResponse.json(
          { error: "Please fill in all required fields" },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 }
        );
      }

      // Calculate estimate if not provided
      const estimate = data.estimate || { min: 0, max: 0 };
      const breakdown = data.breakdown || [];

      // Store inquiry in database
      const inquiry = await prisma.inquiry.create({
        data: {
          // Contact Information
          name,
          email,
          company: company || null,
          phone: phone || null,
          
          // Project Information
          projectType,
          businessType: businessType || null,
          currentChallenge: currentChallenge || null,
          projectGoal,
          targetAudience: targetAudience || null,
          hasExistingWebsite: hasExistingWebsite || null,
          
          // Technical Requirements
          selectedFeatures: selectedFeatures || [],
          selectedAdditionalServices: selectedAdditionalServices || [],
          designPreference: designPreference || null,
          timeline: timeline || 'normal',
          contentReady: contentReady || null,
          
          // Estimate
          estimateMin: estimate.min || null,
          estimateMax: estimate.max || null,
          breakdown: breakdown || null,
          
          // Additional Information
          message,
          hearAboutUs: hearAboutUs || null,
          budget: budget || null,
          
          // System fields
          status: 'NEW',
          priority: false,
        }
      });

      // Format features and services for email
      const formatFeatures = (features: string[]) => {
        if (!features || features.length === 0) return 'None selected';
        return features.join(', ');
      };

      const formatServices = (services: string[]) => {
        if (!services || services.length === 0) return 'None selected';
        return services.join(', ');
      };

      // Send email notification with improved formatting
      await resend.emails.send({
        from: "Portfolio Contact <contact@atanaskyurkchiev.info>",
        to: "me@atanaskyurkchiev.info",
        subject: `New Project Inquiry from ${name} - ${projectType} (${estimate.min ? `£${estimate.min}-${estimate.max}` : 'No estimate'})`,
        html: `
          <div style="font-family: 'Space Grotesk', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #171717; color: #fafafa; padding: 32px; border-radius: 8px;">
            <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 32px; color: #fafafa;">New Project Inquiry</h2>
            
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">Contact Information</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Name:</span> ${name}</p>
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Email:</span> ${email}</p>
                ${company ? `<p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Company:</span> ${company}</p>` : ''}
                ${phone ? `<p style="margin: 0;"><span style="color: #a3a3a3;">Phone:</span> ${phone}</p>` : ''}
              </div>
            </div>

            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">Business Information</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Project Type:</span> ${projectType}</p>
                ${businessType ? `<p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Business Type:</span> ${businessType}</p>` : ''}
                ${currentChallenge ? `<p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Current Challenge:</span> ${currentChallenge}</p>` : ''}
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Success Goal:</span> ${projectGoal}</p>
                ${targetAudience ? `<p style="margin: 0;"><span style="color: #a3a3a3;">Target Audience:</span> ${targetAudience}</p>` : ''}
              </div>
            </div>

            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">Project Requirements</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Timeline:</span> ${timeline}</p>
                ${designPreference ? `<p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Design Preference:</span> ${designPreference}</p>` : ''}
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">Additional Features:</span> ${formatFeatures(selectedFeatures)}</p>
                <p style="margin: 0;"><span style="color: #a3a3a3;">Additional Services:</span> ${formatServices(selectedAdditionalServices)}</p>
              </div>
            </div>

            ${estimate.min ? `
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">Project Estimate</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">£${estimate.min.toLocaleString()} - £${estimate.max.toLocaleString()}</p>
                ${breakdown && breakdown.length > 0 ? breakdown.map((item: { item: string; price: string | number }) => 
                  `<p style="margin: 0 0 4px 0; font-size: 12px;"><span style="color: #a3a3a3;">${item.item}:</span> ${typeof item.price === 'number' ? `£${item.price}` : item.price}</p>`
                ).join('') : ''}
              </div>
            </div>
            ` : ''}

            <div>
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">Additional Information</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
              </div>
            </div>

            <div style="margin-top: 32px; padding: 16px; background: #059669; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px;">Inquiry ID: ${inquiry.id}</p>
              <p style="margin: 0; font-size: 12px;">View in admin: <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/inquiries/${inquiry.id}" style="color: #fafafa;">Manage Inquiry</a></p>
            </div>
          </div>
        `,
      });

      return NextResponse.json(
        { 
          success: true,
          message: "Project inquiry submitted successfully!",
          inquiryId: inquiry.id
        },
        { status: 200 }
      );

    } else {
      // Old contact form structure (for backwards compatibility)
      const { name, email, company, projectType, timeline, budget, message, otherProjectType } = data;

      // Validate required fields
      if (!name || !email || !projectType || !timeline || !budget || !message) {
        return NextResponse.json(
          { error: "Please fill in all required fields" },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Please enter a valid email address" },
          { status: 400 }
        );
      }

      // Format project type for display
      const formatProjectType = (type: string, otherType?: string) => {
        if (type === 'other' && otherType) {
          return otherType;
        }
        return type.split('_').map(word => word.charAt(0).toLowerCase() + word.slice(1)).join(' ');
      };

      // Format timeline for display
      const formatTimeline = (time: string) => {
        switch (time) {
          case '1_month': return 'within 1 month';
          case '3_months': return '1-3 months';
          case '6_months': return '3-6 months';
          case 'flexible': return 'flexible';
          default: return time;
        }
      };

      // Format budget for display
      const formatBudget = (budgetRange: string) => {
        switch (budgetRange) {
          case '5k_10k': return '£500 - £1000';
          case '1k_2k': return '£1000 - £2000';
          case '2k_5k': return '£2000 - £5000';
          case '5k_plus': return '£5000+';
          default: return budgetRange;
        }
      };

      // Send email notification with improved formatting
      await resend.emails.send({
        from: "Portfolio Contact <contact@atanaskyurkchiev.info>",
        to: "me@atanaskyurkchiev.info",
        subject: `new project inquiry from ${name}`,
        html: `
          <div style="font-family: 'Space Grotesk', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #171717; color: #fafafa; padding: 32px; border-radius: 8px;">
            <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 32px; color: #fafafa;">new project inquiry</h2>
            
            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">contact information</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">name:</span> ${name}</p>
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">email:</span> ${email}</p>
                ${company ? `<p style="margin: 0;"><span style="color: #a3a3a3;">company:</span> ${company}</p>` : ''}
              </div>
            </div>

            <div style="margin-bottom: 32px;">
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">project details</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">project type:</span> ${formatProjectType(projectType, otherProjectType)}</p>
                <p style="margin: 0 0 8px 0;"><span style="color: #a3a3a3;">timeline:</span> ${formatTimeline(timeline)}</p>
                <p style="margin: 0;"><span style="color: #a3a3a3;">budget range:</span> ${formatBudget(budget)}
              </div>
            </div>

            <div>
              <h3 style="font-size: 14px; font-weight: 400; margin-bottom: 16px; color: #a3a3a3;">project vision</h3>
              <div style="background: #262626; padding: 24px; border-radius: 4px; border: 1px solid #404040;">
                <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</p>
              </div>
            </div>
          </div>
        `,
      });

      return NextResponse.json(
        { message: "message sent successfully!" },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}