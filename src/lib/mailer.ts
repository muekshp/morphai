/**
 * Lead email delivery via SMTP (Google Gmail by default).
 *
 * Configure in .env — only three values are required:
 *   SMTP_USER    Gmail address that sends the emails (also the SMTP login)
 *   SMTP_PASS    Gmail App Password (Google Account > Security >
 *                2-Step Verification > App Passwords, 16 chars)
 *   OWNER_EMAIL  inbox that receives the lead notifications
 *
 * Optional: SMTP_HOST (default smtp.gmail.com), SMTP_PORT (465),
 * SMTP_SECURE (auto), SMTP_DRY_RUN (log instead of send), PUBLIC_SITE_URL.
 *
 * Emails are sent only — no state is stored here. The lead backup log is
 * written by the API route.
 */
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { envValue } from './env';

export interface Lead {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  source: string;
  pageUrl: string;
  formId: string;
  postId: string;
}

export interface SmtpState {
  configured: boolean;
  dryRun: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  owner: string;
}

export function smtpState(): SmtpState {
  const user = envValue('SMTP_USER');
  const pass = envValue('SMTP_PASS');
  const host = envValue('SMTP_HOST') || 'smtp.gmail.com';
  const port = Number(envValue('SMTP_PORT') || 465);
  const secureStr = envValue('SMTP_SECURE');
  const secure = secureStr !== '' ? secureStr === 'true' : port === 465;
  const dryRun = envValue('SMTP_DRY_RUN') === 'true';
  const owner = envValue('OWNER_EMAIL') || user;
  return {
    configured: Boolean(user && pass && owner),
    dryRun,
    host,
    port,
    secure,
    user,
    owner,
  };
}

let cachedTransporter: Transporter | null = null;
let cachedKey = '';

function getTransporter(state: SmtpState): Transporter {
  const key = state.dryRun
    ? 'dry'
    : `${state.host}:${state.port}:${state.secure}:${state.user}:${envValue('SMTP_PASS')}`;
  if (cachedTransporter && cachedKey === key) return cachedTransporter;
  cachedTransporter = state.dryRun
    ? nodemailer.createTransport({ jsonTransport: true })
    : nodemailer.createTransport({
        host: state.host,
        port: state.port,
        secure: state.secure,
        auth: { user: state.user, pass: envValue('SMTP_PASS') },
      });
  cachedKey = key;
  return cachedTransporter;
}

const BRAND = { accent: '#6904f2', dark: '#111827', bg: '#f4f4f7', border: '#e4e4ea' };

function esc(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BRAND.border};">
<tr><td style="background:linear-gradient(135deg,${BRAND.accent} 0%,#8a3bff 100%);background-color:${BRAND.accent};padding:22px 32px;">
<a href="https://morphai.in" style="color:#ffffff;text-decoration:none;font-size:20px;font-weight:bold;letter-spacing:0.5px;">Morph&nbsp;AI</a>
<div style="color:#e9dcff;font-size:11px;margin-top:3px;">Virtual Try-On API for Fashion E-commerce</div>
</td></tr>
<tr><td style="padding:28px 32px;color:${BRAND.dark};font-size:15px;line-height:1.65;">${inner}</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid ${BRAND.border};color:#8a8a94;font-size:12px;line-height:1.5;">
This is an automated message from the Morph AI website contact forms.
</td></tr>
</table></td></tr></table></body></html>`;
}

function fieldRow(label: string, value: string): string {
  if (!value) return '';
  return `<tr>
<td style="padding:8px 14px;border:1px solid ${BRAND.border};background:#fafafa;font-weight:bold;width:150px;vertical-align:top;">${esc(label)}</td>
<td style="padding:8px 14px;border:1px solid ${BRAND.border};vertical-align:top;">${esc(value)}</td>
</tr>`;
}

/** Friendly confirmation sent to the person who filled the form. */
export function userConfirmation(lead: Lead): { subject: string; html: string; text: string } {
  const first = (lead.name || 'there').split(/\s+/)[0];
  const subject = 'We received your message \u2014 Morph AI';
  const summary = [
    fieldRow('Name', lead.name),
    fieldRow('Email', lead.email),
    fieldRow('Phone', lead.phone),
    fieldRow('Company', lead.company),
    fieldRow('Subject', lead.subject),
    fieldRow('Message', lead.message),
  ].join('');
  const html = shell(`
<p style="margin:0 0 14px;">Hi ${esc(first)},</p>
<p style="margin:0 0 14px;">Thank you for reaching out to <b>Morph AI</b>${lead.subject ? ` about <b>${esc(lead.subject)}</b>` : ''}. We have received your message and our team is already looking into it.</p>
<p style="margin:0 0 18px;">A specialist will get back to you <b>within one business day</b> with the next steps &mdash; usually a short call or a tailored walkthrough of how the Virtual Try-On API fits your catalogue.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
${summary}
</table>
<p style="margin:0;">If anything is urgent, simply reply to this email and it will land directly with our team.</p>
`);
  const text = `Hi ${first},

Thank you for reaching out to Morph AI${lead.subject ? ` about ${lead.subject}` : ''}. We have received your message and our team is already looking into it.

A specialist will get back to you within one business day.

${lead.name ? 'Name: ' + lead.name + '\n' : ''}${lead.email ? 'Email: ' + lead.email + '\n' : ''}${lead.phone ? 'Phone: ' + lead.phone + '\n' : ''}${lead.company ? 'Company: ' + lead.company + '\n' : ''}${lead.message ? 'Message: ' + lead.message + '\n' : ''}
If anything is urgent, simply reply to this email.

Morph AI - Virtual Try-On API for Fashion E-commerce`;
  return { subject, html, text };
}

/** Lead alert sent to the site owner. */
export function ownerAlert(lead: Lead): { subject: string; html: string; text: string } {
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const subject = `New website lead: ${lead.name}${lead.subject ? ' \u2014 ' + lead.subject : ''}`;
  const html = shell(`
<p style="margin:0 0 8px;"><b>New lead submitted via the website.</b></p>
<p style="margin:0 0 18px;">Source: <b>${esc(lead.source)}</b> &middot; ${esc(when)} (IST)</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 18px;">
${fieldRow('Name', lead.name)}
${fieldRow('Email', lead.email)}
${fieldRow('Phone', lead.phone)}
${fieldRow('Company', lead.company)}
${fieldRow('Subject', lead.subject)}
${fieldRow('Message', lead.message)}
${fieldRow('Page', lead.pageUrl)}
${fieldRow('Form ID', lead.formId)}
</table>
<p style="margin:0;"><b>Reply to this email</b> to respond directly to ${esc(lead.name || 'the lead')}.</p>
`);
  const text = `New website lead via ${lead.source} at ${when} (IST)

Name:    ${lead.name}
Email:   ${lead.email}
Phone:   ${lead.phone}
Company: ${lead.company}
Subject: ${lead.subject}
Message: ${lead.message}
Page:    ${lead.pageUrl}
Form ID: ${lead.formId}

Reply to this email to respond directly to ${lead.name}.`;
  return { subject, html, text };
}

export interface SendResult {
  ownerSent: boolean;
  userSent: boolean;
  dryRun: boolean;
  error?: string;
}

/** Send both emails. Never throws — reports per-recipient outcome. */
export async function sendLeadEmails(lead: Lead): Promise<SendResult> {
  const state = smtpState();
  if (!state.configured && !state.dryRun) {
    console.warn(
      '[mailer] SMTP not configured - set SMTP_USER, SMTP_PASS and OWNER_EMAIL in .env to enable email delivery'
    );
    return { ownerSent: false, userSent: false, dryRun: false };
  }
  const transporter = getTransporter(state);
  const from = `"Morph AI" <${state.user || 'noreply@morphai.in'}>`;
  const siteUrl = envValue('PUBLIC_SITE_URL') || 'https://morphai.in';

  const userMail = userConfirmation(lead);
  const ownerMail = ownerAlert(lead);

  const [ownerRes, userRes] = await Promise.allSettled([
    transporter.sendMail({
      from,
      to: state.owner,
      replyTo: lead.email,
      subject: ownerMail.subject,
      text: ownerMail.text,
      html: ownerMail.html,
      priority: 'high',
    }),
    transporter.sendMail({
      from,
      to: lead.email,
      replyTo: state.owner,
      subject: userMail.subject,
      text: userMail.text,
      html: userMail.html,
      headers: { 'Auto-Submitted': 'auto-generated' },
    }),
  ]);

  if (state.dryRun) {
    for (const r of [ownerRes, userRes]) {
      if (r.status === 'fulfilled') {
        const msg = (r.value as { message?: unknown }).message;
        console.log('[mailer][dry-run]', typeof msg === 'string' ? msg.slice(0, 2000) : 'sent');
      }
    }
  }

  const ownerSent = ownerRes.status === 'fulfilled';
  const userSent = userRes.status === 'fulfilled';
  const error =
    ownerRes.status === 'rejected'
      ? String(ownerRes.reason?.message || ownerRes.reason)
      : userRes.status === 'rejected'
        ? String(userRes.reason?.message || userRes.reason)
        : undefined;
  if (error) console.error('[mailer] send failure:', error);
  void siteUrl;
  return { ownerSent, userSent, dryRun: state.dryRun, error };
}
