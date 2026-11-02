/**
 * Website form endpoint.
 *
 * The pages' own form widget JavaScript submits here (see
 * MorphProFrontendConfig.ajaxurl in src/data/pages/*.json) with the exact
 * request shape it used on the original site:
 *
 *   POST /api/forms  (multipart/form-data)
 *     action=morph_pro_forms_send_form
 *     post_id, form_id, referer_title, queried_id
 *     form_fields[name], form_fields[phone], form_fields[email],
 *     form_fields[company_name], form_fields[subject], message field
 *     referrer=<page URL>
 *
 * and expects JSON back: { success: boolean, data: { message: string,
 * data: {} } } which it renders as the native green/red inline message.
 * The inner "data" object mirrors the original backend contract — the
 * popup and form modules read data.data.popup / data.data.redirect_url on
 * submit_success / form_destruct and would crash without it.
 *
 * On every valid submission two emails go out over SMTP (Google Gmail by
 * default, configured via .env):
 *   1. a friendly confirmation to the visitor's email address
 *   2. a lead alert to OWNER_EMAIL (reply-to the visitor)
 *
 * Leads are additionally appended to leads.jsonl as a durable backup.
 */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendLeadEmails, smtpState, type Lead } from '@/lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ACTIONS = new Set(['morph_pro_forms_send_form', 'morph_sendform', 'form']);

/** Simple in-memory rate limit: 5 submissions per 10 minutes per IP. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) hits.clear(); // hard safety valve
  return false;
}

function extractFields(fd: FormData): { fields: Record<string, string>; meta: Record<string, string> } {
  const fields: Record<string, string> = {};
  const meta: Record<string, string> = {};
  for (const [rawKey, rawValue] of fd.entries()) {
    if (typeof rawValue !== 'string') continue;
    const value = rawValue.trim();
    if (rawKey.startsWith('form_fields')) {
      // Normal keys: form_fields[name]. The textarea in the migrated markup
      // carries a truncated key (form_fieldsessage]) — normalise it too.
      let key = rawKey.slice('form_fields'.length).replace(/[\[\]]/g, '');
      if (/essage/.test(key)) key = 'message';
      if (key === 'company') key = 'company_name';
      if (key) fields[key] = value;
    } else if (['action', 'post_id', 'form_id', 'referer_title', 'queried_id', 'referrer', 'nonce'].includes(rawKey)) {
      meta[rawKey] = value;
    }
  }
  return { fields, meta };
}

function sourceFrom(pageUrl: string, postId: string): string {
  if (/book-a-discovery-call/i.test(pageUrl)) return 'Book a Discovery Call form';
  if (/\/contact/i.test(pageUrl)) return 'Contact form';
  if (postId === '215') return 'Book a Discovery Call form';
  if (postId === '72') return 'Contact form';
  return 'Website form';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function appendLeadLog(record: Record<string, unknown>): void {
  try {
    const file = path.join(process.cwd(), 'leads.jsonl');
    fs.appendFileSync(file, JSON.stringify(record) + '\n');
  } catch (err) {
    console.warn('[forms] could not write lead log:', err instanceof Error ? err.message : err);
  }
}

function reply(success: boolean, message: string) {
  // Inner "data" object is part of the original response contract; the
  // bundled popup/form modules dereference data.data.popup and
  // data.data.redirect_url in submit_success / form_destruct handlers.
  return NextResponse.json({ success, data: { message, data: {} } }, { status: 200 });
}

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return reply(false, 'Invalid form submission.');
  }

  const { fields, meta } = extractFields(fd);
  const action = (meta.action || '').toLowerCase();
  if (action && !VALID_ACTIONS.has(action)) {
    return reply(false, 'Unsupported form action.');
  }

  const ip =
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'local';
  if (rateLimited(ip)) {
    return reply(false, 'Too many submissions from your network. Please try again in a few minutes.');
  }

  const name = fields.name || '';
  const email = fields.email || '';
  if (!name || !EMAIL_RE.test(email)) {
    return reply(false, 'Please provide your name and a valid email address.');
  }

  const pageUrl = meta.referrer || '';
  const lead: Lead = {
    name,
    email,
    phone: fields.phone || '',
    company: fields.company_name || '',
    subject: fields.subject || '',
    message: fields.message || '',
    source: sourceFrom(pageUrl, meta.post_id || ''),
    pageUrl,
    formId: meta.form_id || '',
    postId: meta.post_id || '',
  };

  const receivedAt = new Date().toISOString();
  appendLeadLog({ receivedAt, ip, ...lead });

  const state = smtpState();
  const result = await sendLeadEmails(lead);

  if (result.dryRun) {
    console.log(`[forms] DRY-RUN lead captured (${lead.source}) from ${email}`);
    return reply(true, 'Thank you! Your message has been sent successfully.');
  }
  if (!state.configured) {
    // SMTP not set up yet — the lead is stored in leads.jsonl; the visitor
    // still gets a friendly confirmation so nothing breaks before .env is
    // filled in. The server log carries a loud warning for the owner.
    console.warn(`[forms] lead captured but SMTP not configured (set SMTP_USER/SMTP_PASS/OWNER_EMAIL in .env): ${name} <${email}>`);
    return reply(true, 'Thank you! Your message has been sent successfully.');
  }
  if (result.ownerSent) {
    return reply(true, 'Thank you! Your message has been sent successfully.');
  }
  console.error('[forms] lead captured but email delivery failed:', result.error);
  return reply(false, 'Your message was received, but email delivery failed. Please try again shortly.');
}

export async function GET() {
  return NextResponse.json({ success: false, data: { message: 'Method not allowed.' } }, { status: 405 });
}
