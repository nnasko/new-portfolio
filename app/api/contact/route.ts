import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, company, project_type, timeline, budget, message } = await request.json();

    // Validate required fields
    if (!name || !email || !project_type || !timeline || !budget || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format project type for display
    const formatProjectType = (type: string) => {
      return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Format timeline for display
    const formatTimeline = (time: string) => {
      switch (time) {
        case '1_month': return 'Within 1 month';
        case '3_months': return '1-3 months';
        case '6_months': return '3-6 months';
        case 'flexible': return 'Flexible';
        default: return time;
      }
    };

    // Format budget for display
    const formatBudget = (budgetRange: string) => {
      switch (budgetRange) {
        case '5k_10k': return '£5,000 - £10,000';
        case '10k_20k': return '£10,000 - £20,000';
        case '20k_50k': return '£20,000 - £50,000';
        case '50k_plus': return '£50,000+';
        default: return budgetRange;
      }
    };

    // Send email notification with improved formatting
    await resend.emails.send({
      from: "Portfolio Contact <contact@atanaskyurkchiev.info>",
      to: "me@atanaskyurkchiev.info",
      subject: `New Project Inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #171717; margin-bottom: 24px;">New Project Inquiry</h2>
          
          <div style="margin-bottom: 32px;">
            <h3 style="color: #171717; margin-bottom: 16px;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          </div>

          <div style="margin-bottom: 32px;">
            <h3 style="color: #171717; margin-bottom: 16px;">Project Details</h3>
            <p><strong>Project Type:</strong> ${formatProjectType(project_type)}</p>
            <p><strong>Timeline:</strong> ${formatTimeline(timeline)}</p>
            <p><strong>Budget Range:</strong> ${formatBudget(budget)}</p>
          </div>

          <div style="margin-bottom: 32px;">
            <h3 style="color: #171717; margin-bottom: 16px;">Project Vision</h3>
            <p style="white-space: pre-wrap;">${message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Error sending email" },
      { status: 500 }
    );
  }
}