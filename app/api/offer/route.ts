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

function getBoundedText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

function parseOfferAmount(value: unknown): number | null {
  const raw = typeof value === 'number'
    ? String(value)
    : typeof value === 'string'
      ? value
      : '';
  const normalized = raw.replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) return null;
  return amount;
}

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

    const { event, date, amount, context } = await request.json();

    const validEvent = getBoundedText(event, 160);
    const validDate = getBoundedText(date, 180);
    const validAmount = parseOfferAmount(amount);
    const validContext = context === undefined || context === null || context === ''
      ? ''
      : getBoundedText(context, 2000);

    if (!validEvent || !validDate || !validAmount || validContext === null) {
      return NextResponse.json({ error: 'Valid event, date/location, amount, and context are required' }, { status: 400 });
    }

    const safeEvent = escapeHtml(validEvent);
    const safeDate = escapeHtml(validDate);
    const safeAmount = validAmount.toLocaleString('en-US', {
      minimumFractionDigits: validAmount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    const safeContext = validContext ? escapeHtml(validContext) : '';

    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Booking Offers <onboarding@resend.dev>',
      to: 'vampiresexworldwide@gmail.com',
      subject: `Booking Offer: ${safeEvent} — $${safeAmount}`,
      html: `
        <h2>New Booking Offer</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px;">
          <tr><td style="padding:8px;font-weight:bold;">Event / Promoter</td><td style="padding:8px;">${safeEvent}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Date &amp; Location</td><td style="padding:8px;">${safeDate}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Offer Amount</td><td style="padding:8px;">$${safeAmount} USD</td></tr>
          ${safeContext ? `<tr><td style="padding:8px;font-weight:bold;">Additional Context</td><td style="padding:8px;">${safeContext}</td></tr>` : ''}
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px;">Submitted: ${new Date().toISOString()}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Offer request failed', error);
    return NextResponse.json({ error: 'Unable to submit offer right now' }, { status: 500 });
  }
}
