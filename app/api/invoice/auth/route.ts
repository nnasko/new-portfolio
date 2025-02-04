import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!process.env.INVOICE_PASSWORD) {
      return new NextResponse('Invoice password not configured', { status: 500 });
    }

    if (password === process.env.INVOICE_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('invoice-auth', process.env.INVOICE_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return new NextResponse('Authenticated', { status: 200 });
    }

    return new NextResponse('Invalid password', { status: 401 });
  } catch {
    return new NextResponse('Error during authentication', { status: 500 });
  }
} 