import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  const cfIp = request.headers.get('cf-connecting-ip')?.trim();
  const userAgent = request.headers.get('user-agent')?.slice(0, 120) ?? 'unknown-agent';
  return `${forwarded || realIp || cfIp || 'unknown-ip'}:${userAgent}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;
const DISCOUNT_CODE = 'fangclub';
const DISCOUNT_EXPIRES = 'June 2, 2026';
const MINIMUM_PURCHASE = '$55';

// Simple in-memory rate limiter: max 5 requests per IP per 15 minutes
const rateMap = new Map<string, number[]>();
const RATE_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(ip) ?? []).filter(t => now - t < RATE_WINDOW);
  if (hits.length >= RATE_LIMIT) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  return false;
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const clientKey = getClientKey(request);
    if (isRateLimited(clientKey)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > MAX_EMAIL_LEN) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const resend = getResend();
    const from = process.env.RESEND_FROM_EMAIL ?? 'Bloodline Registry <onboarding@resend.dev>';
    const safeEmail = escapeHtml(email);

    await Promise.all([
      resend.emails.send({
        from,
        to: email,
        subject: 'Your Bloodline discount code',
        html: `
          <div style="background:#0A0A0A;color:#F2EDE4;font-family:Arial,sans-serif;padding:32px;">
            <p style="letter-spacing:0.24em;text-transform:uppercase;color:#4A7C3F;font-size:11px;">Bloodline Access Confirmed</p>
            <h1 style="font-size:44px;line-height:0.95;margin:12px 0 20px;text-transform:uppercase;">Welcome to the Bloodline.</h1>
            <p style="font-size:16px;line-height:1.6;">Use code <strong style="color:#4A7C3F;font-size:22px;letter-spacing:0.12em;">${DISCOUNT_CODE}</strong> for 20% off your next Vampire Sex purchase.</p>
            <p style="font-size:12px;line-height:1.6;color:#B9B0A3;text-transform:uppercase;letter-spacing:0.12em;">Valid through ${DISCOUNT_EXPIRES}. Minimum purchase ${MINIMUM_PURCHASE}. One code per customer.</p>
          </div>
        `,
      }),
      resend.emails.send({
        from,
        to: 'vampiresexworldwide@gmail.com',
        subject: 'New Bloodline Registry Signup',
        html: `
          <h2>New Bloodline Registry Member</h2>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Code sent:</strong> ${DISCOUNT_CODE}</p>
          <p><strong>Signed up:</strong> ${new Date().toISOString()}</p>
        `,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Registry request failed', error);
    return NextResponse.json({ error: 'Unable to join the registry right now' }, { status: 500 });
  }
}
