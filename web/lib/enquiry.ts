/* Order-request validation — pure, so it can be reasoned about and tested
   without a database or a network.

   Everything here runs on the SERVER (app/api/order/route.ts). The browser is
   never trusted: it supplies the numbers it showed the customer, and we keep
   them only as a record of what they were shown, never as an agreed price. */

export type OrderRequest = {
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  model: string | null;
  modelId: string | null;
  spec: string | null;
  layoutPlan: string | null;
  totalAud: number | null;
  deliveryKm: number | null;
  message: string | null;
  page: string | null;
  idempotencyKey: string | null;
  payload: Record<string, unknown>;
};

export type Validated =
  | { ok: true; value: OrderRequest }
  | { ok: false; error: string; field?: string };

/** Longest we will store for a single free-text field. Anything past this is a
    paste bomb, not a customer telling us about their block. */
const MAX_TEXT = 4000;
const MAX_SHORT = 200;

const str = (v: unknown, max = MAX_SHORT): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
};

/* Deliberately permissive: one @, a dot after it, no spaces. Anything stricter
   rejects real addresses, and a wrong address costs us a customer while a
   junk one costs a CSR ten seconds. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Australian mobile/landline as people actually type it: +61, spaces, dashes,
    brackets. We only check there are enough digits to ring. */
const digitsOf = (s: string) => s.replace(/\D/g, "");

export function validateOrderRequest(raw: unknown): Validated {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Nothing was submitted." };
  const b = raw as Record<string, unknown>;

  /* Honeypot: a field no human sees and no human fills. Bots fill everything.
     We answer 200 at the route so the bot learns nothing, but nothing is
     stored. */
  const name = str(b.name);
  if (!name) return { ok: false, error: "Please tell us your name.", field: "name" };

  const email = str(b.email);
  const phone = str(b.phone);
  if (!email && !phone) {
    return { ok: false, error: "Please leave an email address or a phone number so we can reply.", field: "email" };
  }
  if (email && !EMAIL.test(email)) {
    return { ok: false, error: "That email address doesn't look right.", field: "email" };
  }
  if (phone && digitsOf(phone).length < 8) {
    return { ok: false, error: "That phone number looks too short.", field: "phone" };
  }

  /* The total is the figure the customer was shown. We clamp it into a sane
     range rather than trusting it: a negative or absurd number in the CSR's
     list is worse than no number at all. */
  const rawTotal = typeof b.totalAud === "number" ? b.totalAud : Number(b.totalAud);
  const totalAud =
    Number.isFinite(rawTotal) && rawTotal > 0 && rawTotal < 10_000_000
      ? Math.round(rawTotal)
      : null;

  const rawKm = typeof b.deliveryKm === "number" ? b.deliveryKm : Number(b.deliveryKm);
  const deliveryKm =
    Number.isFinite(rawKm) && rawKm >= 0 && rawKm <= 20_000 ? Math.round(rawKm) : null;

  const payload =
    b.payload && typeof b.payload === "object" && !Array.isArray(b.payload)
      ? (b.payload as Record<string, unknown>)
      : {};

  return {
    ok: true,
    value: {
      name,
      email: email ? email.toLowerCase() : null,
      phone,
      location: str(b.location),
      model: str(b.model),
      modelId: str(b.modelId, 40),
      spec: str(b.spec, MAX_TEXT),
      layoutPlan: str(b.layoutPlan, MAX_TEXT),
      totalAud,
      deliveryKm,
      message: str(b.message, MAX_TEXT),
      page: str(b.page, 120),
      idempotencyKey: str(b.idempotencyKey, 80),
      payload,
    },
  };
}

/** True when the honeypot was filled — a bot. */
export function isBot(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const v = (raw as Record<string, unknown>).company;
  return typeof v === "string" && v.trim().length > 0;
}

/** Row shape for the portal's `web_orders` table (snake_case, as the DB wants). */
export function toRow(v: OrderRequest) {
  return {
    name: v.name,
    email: v.email,
    phone: v.phone,
    location: v.location,
    model: v.model,
    model_id: v.modelId,
    spec: v.spec,
    layout_plan: v.layoutPlan,
    total_aud: v.totalAud,
    delivery_km: v.deliveryKm,
    message: v.message,
    payload: v.payload,
    source: "website",
    page: v.page,
    idempotency_key: v.idempotencyKey,
  };
}
