import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    const expectedPassword = process.env.INVOICE_PASSWORD;
    
    if (!expectedPassword) {
      console.log('No password configured');
      return NextResponse.json({ success: false, error: "No password configured" });
    }

    console.log('Token received:', token);
    console.log('Expected password:', expectedPassword);
    console.log('Token type:', typeof token);
    console.log('Expected type:', typeof expectedPassword);

    const isValid = token === expectedPassword;
    console.log('Is valid:', isValid);

    return NextResponse.json({ success: isValid });
  } catch (error) {
    console.log('Error in verify:', error);
    return NextResponse.json({ success: false, error: "Invalid request" });
  }
} 