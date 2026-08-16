"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/shared";
import { PORTAL_URL } from "@/lib/links";

type Status = "idle" | "sending" | "sent" | "failed";

/** What the configurator hands over. Every field is optional on purpose — an
    older tab, or a browser that blocked storage, may carry less. */
type QuoteData = {
  model?: string;
  modelId?: string;
  size?: string;
  spec?: string;
  layoutPlan?: string;
  layoutSummary?: string;
  layout?: unknown[];
  totalAud?: number;
  deliveryKm?: number;
  custom?: string | null;
};

const money = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-AU");

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [ref, setRef] = useState<string | null>(null);
  const [sendError, setSendError] = useState("");
  const [message, setMessage] = useState("");
  const [fromQuote, setFromQuote] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  /* One key per submission attempt, so a double-click or a retry cannot create
     two jobs for one customer. Regenerated only after a successful send. */
  const idem = useRef("");

  /* inline validation on blur — never on keystroke (design doc §4.12) */
  function validateField(field: "name" | "email", value: string) {
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "name") {
        next.name = value.trim() ? undefined : "Please tell us your name.";
      }
      if (field === "email") {
        next.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? undefined
          : "That email address doesn't look right.";
      }
      return next;
    });
  }

  /* Configurator handoff: localStorage first; URL param fallback for
     storage-blocked browsers (private mode, in-app webviews) */
  useEffect(() => {
    idem.current = crypto.randomUUID();
    let q: string | null = null;
    let data: QuoteData | null = null;
    try {
      q = localStorage.getItem("emg-quote");
      if (q) localStorage.removeItem("emg-quote");
      const d = localStorage.getItem("emg-quote-data");
      if (d) {
        localStorage.removeItem("emg-quote-data");
        data = JSON.parse(d) as QuoteData;
        setQuoteData(data);
      }
    } catch {}
    if (!q) {
      q = new URLSearchParams(window.location.search).get("q");
    }
    if (q) {
      setFromQuote(true);
      /* Only prefill the message box when there is NO structured build to show.
         With one, the build gets its own summary and this box stays empty for
         the customer's own words. */
      if (!data) setMessage(q);
    }
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setSendError("");
    const q: QuoteData = quoteData ?? {};
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          phone: f.get("phone"),
          location: f.get("location"),
          model: q.model ?? f.get("building"),
          modelId: q.modelId ?? null,
          spec: q.spec ?? null,
          layoutPlan: q.layoutPlan ?? null,
          totalAud: q.totalAud ?? null,
          deliveryKm: q.deliveryKm ?? null,
          message: f.get("message"),
          page: fromQuote ? "/build-your-own" : "/contact",
          idempotencyKey: idem.current,
          company: f.get("company"), // honeypot — real people never see this
          payload: { ...q, building: f.get("building") },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError(json?.error || "Something went wrong sending that.");
        setStatus("failed");
        return;
      }
      setRef(json?.ref ?? null);
      setStatus("sent");
      idem.current = crypto.randomUUID();
    } catch {
      setSendError(
        "We couldn't reach our system just now. Please call 0420 251 550 or email admin@elitemanufacturing.com.au."
      );
      setStatus("failed");
    }
  }

  /* Never strand someone holding a configuration: if the server is unreachable
     they can still send exactly what they typed, by email, in one click. */
  function mailtoFallback() {
    const form = document.querySelector<HTMLFormElement>(".contact-form");
    if (!form) return "";
    const f = new FormData(form);
    const q = quoteData;
    const body = [
      `Name: ${f.get("name")}`,
      `Phone: ${f.get("phone")}`,
      `Email: ${f.get("email")}`,
      `Location: ${f.get("location")}`,
      /* the build no longer lives in the message box, so spell it out here or
         the email fallback would arrive with the order missing */
      ...(q
        ? [
            "",
            `Building: ${q.model ?? ""}${q.size ? ` (${q.size})` : ""}`,
            `Options: ${q.spec ?? ""}`,
            q.layoutSummary ? `Layout: ${q.layoutSummary}` : "",
            q.layoutPlan ? `Layout positions: ${q.layoutPlan}` : "",
            q.deliveryKm != null ? `Delivery: ${q.deliveryKm} km` : "",
            q.totalAud != null ? `Indicative total: ${money(q.totalAud)} inc GST` : "",
          ].filter(Boolean)
        : [`Building: ${f.get("building")}`]),
      "",
      `${f.get("message")}`,
    ].join("\n");
    return (
      "mailto:admin@elitemanufacturing.com.au?subject=" +
      encodeURIComponent(
        q ? `Order request — ${q.model ?? "configured build"}` : `Website enquiry — ${f.get("building") || "general"}`
      ) +
      "&body=" + encodeURIComponent(body)
    );
  }
  /* Three states: an order request with a build to show, the same arriving
     without structured data (storage-blocked browsers carry only the text),
     and a plain enquiry. */
  const orderMode = fromQuote && !!quoteData;

  return (
    <>
      <div className="page-hero">
        <Reveal>
          <p className="eyebrow mono">{orderMode ? "ALMOST THERE" : "TALK TO US"}</p>
          <h1 className="display">
            {orderMode ? "Send your order request." : "Tell us what you're building."}
          </h1>
          <p className="section-sub">
            {orderMode
              ? "Your build is below. Add your details and we'll confirm a firm quote, delivery access and dates — nothing is ordered until you've agreed it with us."
              : "A block location and a rough idea is plenty to start. We'll come back with real answers about access, timing and cost."}
          </p>
        </Reveal>
      </div>
      <div className="contact-layout">
        <Reveal>
          <form className="contact-form" onSubmit={submit}>
            <label>Name
              <input
                name="name" required autoComplete="name"
                className={errors.name ? "invalid" : undefined}
                onBlur={(e) => validateField("name", e.target.value)}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </label>
            <label>Phone<input name="phone" type="tel" autoComplete="tel" /></label>
            <label>Email
              <input
                name="email" type="email" required autoComplete="email"
                className={errors.email ? "invalid" : undefined}
                onBlur={(e) => validateField("email", e.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </label>
            <label>Property location (town / region)<input name="location" /></label>
            {/* They already chose it in the configurator — asking again invites
               an answer that contradicts their own build. */}
            {!orderMode && (
              <label>What are you building?
                <select name="building" defaultValue="">
                  <option value="" disabled>Choose one…</option>
                  <option>Slide-out container home</option>
                  <option>Two-bedroom container home</option>
                  <option>Expandable container home</option>
                  <option>Site accommodation / offices</option>
                  <option>Ablution block</option>
                  <option>Kitchen / mess unit</option>
                  <option>Container dome</option>
                  <option>Not sure yet</option>
                </select>
              </label>
            )}

            {orderMode && quoteData && (
              <div className="build-card">
                <p className="mono build-card-eyebrow">YOUR BUILD</p>
                <div className="build-card-head">
                  <h2 className="display">{quoteData.model}</h2>
                  {quoteData.size && <span className="mono build-chip">{quoteData.size.toUpperCase()}</span>}
                </div>
                <dl className="build-rows">
                  {quoteData.spec && (
                    <div><dt className="mono">OPTIONS</dt><dd>{quoteData.spec}</dd></div>
                  )}
                  {quoteData.layoutSummary && (
                    <div><dt className="mono">LAYOUT</dt><dd>{quoteData.layoutSummary}</dd></div>
                  )}
                  {quoteData.custom && (
                    <div><dt className="mono">YOUR BRIEF</dt><dd>{quoteData.custom}</dd></div>
                  )}
                  <div>
                    <dt className="mono">DELIVERY</dt>
                    <dd>
                      {quoteData.deliveryKm
                        ? `${quoteData.deliveryKm} km from Herbert${quoteData.deliveryKm <= 100 ? " — included" : ""}`
                        : "First 100 km included"}
                    </dd>
                  </div>
                </dl>
                {quoteData.totalAud != null && (
                  <p className="build-total">
                    <span className="mono">INDICATIVE TOTAL</span>
                    <strong>{money(quoteData.totalAud)}</strong>
                    <small>inc GST</small>
                  </p>
                )}
                <p className="build-note">
                  Indicative only — every job is quoted individually once we know
                  your site. <a href="/build-your-own">Change your build</a>.
                </p>
              </div>
            )}

            <label>
              {fromQuote && !orderMode ? "Your configured build (edit freely)" : "Anything else we should know?"}
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={orderMode ? "Site access, timing, anything we should know before we quote…" : undefined}
              />
            </label>
            {/* Honeypot: off-screen, not hidden, never announced or tabbed to.
               A person cannot fill it; a bot fills everything. */}
            <div className="hp" aria-hidden="true">
              <label>
                Company
                <input name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button className="btn btn-accent" type="submit" disabled={status === "sending"}>
              {status === "sending"
                ? "Sending…"
                : fromQuote
                  ? "Send my order request"
                  : "Send an enquiry"}
            </button>
            {status === "sent" && (
              <p className="form-ok" role="status">
                <strong>Thank you — that&apos;s with our team.</strong>
                {ref ? ` Your reference is ${ref}.` : ""} We&apos;ll be in touch
                shortly. If it&apos;s urgent, call 0420 251 550.
              </p>
            )}
            {status === "failed" && (
              <p className="field-error" role="alert">
                {sendError}{" "}
                <a href={mailtoFallback()} style={{ textDecoration: "underline" }}>
                  Send it by email instead
                </a>
                .
              </p>
            )}
          </form>
        </Reveal>
        <Reveal>
          <table className="spec-table">
            <tbody>
              <tr><th>PHONE</th><td><a href="tel:0420251550">0420 251 550</a></td></tr>
              <tr><th>EMAIL</th><td><a href="mailto:admin@elitemanufacturing.com.au">admin@elitemanufacturing.com.au</a></td></tr>
              <tr><th>YARD</th><td>Herbert, Northern Territory</td></tr>
              <tr><th>HOURS</th><td>Mon–Sun · 11am–6pm</td></tr>
              <tr><th>DELIVERY</th><td>NT &amp; QLD, including remote sites</td></tr>
              <tr><th>ORDERED?</th><td><a href={PORTAL_URL}>Track your order in the portal</a></td></tr>
            </tbody>
          </table>
        </Reveal>
      </div>
    </>
  );
}
