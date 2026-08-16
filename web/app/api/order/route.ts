import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateOrderRequest, isBot, toRow } from "@/lib/enquiry";

/**
 * The website's order button.
 *
 * A customer presses "Send my order request"; this writes one row into the
 * portal's `web_orders` table, where it appears in the Orders tab for a CSR to
 * ring back. It never creates a real order — a human presses New Order once
 * they have spoken to the person (see the migration's header for why).
 *
 * Deliberate choices
 * ------------------
 * - The SERVICE ROLE key is used, and it only ever exists here, on the server.
 *   `web_orders` revokes everything from anon precisely so a browser cannot
 *   write to it; that guarantee is worth nothing if the key ships to a browser,
 *   hence "server-only" at the top of this file.
 * - Bots get 200 and nothing is stored. A 400 teaches a scraper what to fix.
 * - A double-click, a refresh or a flaky connection must not produce two jobs
 *   for one customer, so every submission carries an idempotency key and the
 *   database's unique index is the referee — a duplicate is reported as the
 *   success it already was.
 * - If the portal is unreachable, we say so plainly and keep the customer's
 *   own words on screen. An order request that silently evaporates is the one
 *   failure this business cannot absorb.
 */

const SB_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/* Belt and braces: the customer sees this if the phone line is the only way
   through. Never leave someone holding a configuration with nowhere to send it. */
const FALLBACK = "Please call us on 0420 251 550 or email admin@elitemanufacturing.com.au — we'll pick it up straight away.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "That request could not be read." }, { status: 400 });
  }

  /* Answer the bot exactly as we answer a person, and store nothing. */
  if (isBot(body)) return NextResponse.json({ ok: true, ref: null });

  const parsed = validateOrderRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, field: parsed.field }, { status: 400 });
  }

  if (!SB_URL || !SB_SERVICE) {
    console.error("order request received but Supabase is not configured on this deployment");
    return NextResponse.json(
      { error: `We couldn't submit that automatically. ${FALLBACK}`, fallback: true },
      { status: 503 }
    );
  }

  const sb = createClient(SB_URL, SB_SERVICE, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("web_orders")
    .insert(toRow(parsed.value))
    .select("ref")
    .single();

  if (error) {
    /* 23505 = unique violation. The only unique columns are `ref` (generated)
       and `idempotency_key`, so in practice this is the same submission
       arriving twice. Report the original as accepted rather than alarming
       someone who simply double-clicked. */
    if (error.code === "23505" && parsed.value.idempotencyKey) {
      const { data: prior } = await sb
        .from("web_orders")
        .select("ref")
        .eq("idempotency_key", parsed.value.idempotencyKey)
        .maybeSingle();
      return NextResponse.json({ ok: true, ref: prior?.ref ?? null, duplicate: true });
    }
    console.error(`web_orders insert failed: ${error.code ?? "?"} ${error.message}`);
    return NextResponse.json(
      { error: `We couldn't submit that automatically. ${FALLBACK}`, fallback: true },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, ref: data?.ref ?? null });
}
