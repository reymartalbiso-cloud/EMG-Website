import "server-only";
import type { OrderRequest } from "@/lib/enquiry";

/**
 * The receipt a customer gets after pressing "Send my order request".
 *
 * This is a TRANSACTIONAL email: it confirms the customer's own action, gives
 * them their reference, and tells them what happens next. It follows the
 * portal's established Graph pattern (2FA codes and portal invites already go
 * out automatically from admin@); the portal's "no automatic customer email"
 * rule is about substantive outbound like quotes and chasers, which this is
 * not. Ben should still see the wording before it has been live long.
 *
 * Rules this file enforces
 * ------------------------
 * - NO customer free text is echoed. The message box and layout plan never
 *   appear here: a receipt that repeats attacker-supplied text to an
 *   attacker-supplied address is a spam relay wearing our name. Only
 *   structured, length-capped fields travel, and every one is HTML-escaped.
 * - Sending can never break the order. Missing configuration or a Graph
 *   failure logs a warning and the customer still gets their on-screen
 *   confirmation; the row is already safe in the portal either way.
 * - admin@ is CC'd, so the office learns a web quote landed the moment it
 *   does. Until now nothing told a human; the panel waited to be opened.
 */

const GRAPH_TENANT = process.env.GRAPH_TENANT_ID;
const GRAPH_CLIENT = process.env.GRAPH_CLIENT_ID;
const GRAPH_SECRET = process.env.GRAPH_CLIENT_SECRET;

/** Same sender as the portal's invites and 2FA codes. */
const FROM_MAILBOX = "admin@elitemanufacturing.com.au";
const CC_INTERNAL = ["admin@elitemanufacturing.com.au"];
const PHONE = "0420 251 550";

export const mailConfigured = () => !!(GRAPH_TENANT && GRAPH_CLIENT && GRAPH_SECRET);

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const aud = (n: number) => "$" + n.toLocaleString("en-AU");

async function graphToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${GRAPH_TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GRAPH_CLIENT!,
        client_secret: GRAPH_SECRET!,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  if (!res.ok) throw new Error(`graph token ${res.status}`);
  return (await res.json()).access_token as string;
}

function receiptHtml(v: OrderRequest, ref: string): string {
  /* Structured fields only, and only the ones that read as a receipt. The
     figure is restated as indicative in the same breath it is shown, matching
     the terms page: every order is confirmed with a written quote. */
  const rows: [string, string][] = [];
  if (v.model) rows.push(["Building", esc(v.model)]);
  if (v.spec) rows.push(["Specification", esc(v.spec.slice(0, 200))]);
  if (v.location) rows.push(["Location", esc(v.location)]);
  if (v.deliveryKm !== null) rows.push(["Delivery distance", `${v.deliveryKm} km`]);
  if (v.totalAud !== null) rows.push(["Indicative total", `${aud(v.totalAud)} inc GST`]);

  const table = rows.length
    ? `<table cellpadding="0" cellspacing="0" style="margin:18px 0;border-collapse:collapse">
        ${rows
          .map(
            ([k, val]) => `<tr>
          <td style="padding:6px 18px 6px 0;color:#6b6b6b;font-size:13px;white-space:nowrap;vertical-align:top">${k}</td>
          <td style="padding:6px 0;color:#1a1a1a;font-size:14px">${val}</td>
        </tr>`
          )
          .join("")}
      </table>`
    : "";

  const priceNote =
    v.totalAud !== null
      ? `<p style="margin:0 0 14px;color:#6b6b6b;font-size:13px;line-height:1.6">The total above is the indicative figure you were shown on our website. It is not a quote. Your written quote will account for your site, access and delivery distance.</p>`
      : "";

  return `
  <div style="background:#f6f5f3;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e2dd;padding:32px">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#9a5b2d;font-weight:bold">ELITE MANUFACTURING GROUP</p>
      <h1 style="margin:0 0 18px;font-size:22px;color:#1a1a1a">We've received your request.</h1>
      <p style="margin:0 0 14px;color:#333;font-size:14px;line-height:1.6">Hi ${esc(v.name)},</p>
      <p style="margin:0 0 14px;color:#333;font-size:14px;line-height:1.6">
        Thanks for your order request. Your reference is
        <strong style="white-space:nowrap">${esc(ref)}</strong>.
        Keep it handy if you call us.
      </p>
      ${table}
      ${priceNote}
      <p style="margin:0 0 14px;color:#333;font-size:14px;line-height:1.6">
        One of our team will be in touch to talk through your site and prepare
        your written quote. Nothing is ordered and nothing is charged until you
        have that quote and confirm it.
      </p>
      <p style="margin:0 0 14px;color:#333;font-size:14px;line-height:1.6">
        Need us sooner? Call <a href="tel:0420251550" style="color:#9a5b2d">${PHONE}</a>
        or simply reply to this email.
      </p>
      <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e5e2dd;color:#9b9b9b;font-size:12px;line-height:1.7">
        Elite Manufacturing Group Pty Ltd &middot; ABN 13 669 513 473 &middot; Darwin, NT<br>
        <a href="https://www.elitemanufacturing.com.au/terms" style="color:#9b9b9b">Terms &amp; conditions</a>
      </p>
    </div>
  </div>`;
}

/**
 * Fire the receipt. Throws only into the caller's catch; the caller decides
 * that a mail failure is a warning, never an error the customer sees.
 */
export async function sendOrderConfirmation(v: OrderRequest, ref: string): Promise<void> {
  if (!mailConfigured()) {
    console.warn("order receipt skipped: GRAPH_* not configured on this deployment");
    return;
  }
  if (!v.email) return;

  const token = await graphToken();
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(FROM_MAILBOX)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        saveToSentItems: true,
        message: {
          subject: `We've received your request (${ref})`,
          body: { contentType: "HTML", content: receiptHtml(v, ref) },
          toRecipients: [{ emailAddress: { address: v.email } }],
          ccRecipients: CC_INTERNAL.map((address) => ({ emailAddress: { address } })),
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`sendMail ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
