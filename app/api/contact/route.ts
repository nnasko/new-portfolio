import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();
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
              <p style="margin: 0;"><span style="color: #a3a3a3;">budget range:</span> ${formatBudget(budget)}</p>
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
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}