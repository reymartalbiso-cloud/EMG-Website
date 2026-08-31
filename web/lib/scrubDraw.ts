/* Sub-frame blending for the scroll-scrub sequences.
 *
 * The three sequences (Hero 361, CampHero 479, JourneySequence 361) each drew
 * Math.round(playhead) and redrew only when that integer changed. Measured on
 * 28 Aug, that leaves the picture standing still for most of a slow scroll:
 *
 *   desktop, 15s scrub   361/361 frames shown, 63% of paints repeat a frame
 *   desktop, 5s  scrub   301/361 shown, 22% repeat, 16% skip ahead
 *   desktop, 1.5s flick   92/361 shown, 51% skip ahead
 *
 * The 63% is the stepping you feel when scrubbing slowly. Adding frames does
 * not fix it — at anything above a crawl we already skip frames, so a denser
 * sequence would just be skipped harder for double the bandwidth (all three
 * sequences are 51MB today). Blending between the two frames either side of
 * the playhead fixes it for nothing: the in-between positions become real
 * pictures instead of a held one.
 *
 * The second draw is not free, so it is spent only where it buys something:
 * while the playhead is crawling (a fast scrub is already skipping, and the
 * blend would be invisible), and only while the device is keeping up.
 */

export type FrameRenderer = {
  /** draw at a fractional frame position */
  draw(exact: number): void;
  /** redraw the current position, e.g. after a resize */
  redraw(): void;
  /** true when this renderer is currently blending */
  blending(): boolean;
};

/** how far the playhead may move between paints and still be worth blending.
    Beyond this we are skipping frames anyway and the blend is invisible. */
const CRAWL = 1.35;
/** Measured 28 Aug: watching draw DURATION was the wrong signal. On a 4x
    throttled phone the two draws stayed under budget individually, yet the
    paint interval stretched and slow scrub came out worse blended (60% ->
    64% repeats, 36.6 -> 34.7fps) than not. Watch the interval between paints
    instead — that is the thing the viewer actually feels. Above ~22ms the
    device is already under 45fps and has nothing spare to give a second draw. */
const SLOW_PAINT_MS = 22;
/** consecutive slow paints before blending switches off for good */
const STRIKES = 6;

export function makeFrameRenderer(
  canvas: HTMLCanvasElement,
  images: (HTMLImageElement | undefined)[],
  count: number,
  onFirstPaint?: () => void
): FrameRenderer {
  const ctx = canvas.getContext("2d")!;
  const loaded = (i: number) => {
    const im = images[i];
    return !!im && im.complete && im.naturalWidth > 0;
  };
  function nearestLoaded(index: number): number {
    if (loaded(index)) return index;
    for (let d = 1; d < count; d++) {
      if (index - d >= 0 && loaded(index - d)) return index - d;
      if (index + d < count && loaded(index + d)) return index + d;
    }
    return -1;
  }

  function paint(img: HTMLImageElement, alpha: number) {
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }

  let last = 0;
  /* ?blend=0 gives a true A/B against the old draw-on-integer-change
     behaviour. Read once here rather than per paint. */
  let allowBlend = blendFromUrl();
  let strikes = 0;
  let lastPaintAt = 0;
  let painted = false;

  function draw(exact: number) {
    const clamped = Math.max(0, Math.min(count - 1, exact));
    const lo = Math.floor(clamped);
    const t = clamped - lo;
    const base = nearestLoaded(lo);
    if (base < 0) return;

    /* blend only while crawling: a fast scrub already skips whole frames, so
       a second draw would cost a paint and change nothing on screen */
    const crawling = Math.abs(clamped - last) <= CRAWL;
    const next = lo + 1;
    const wantBlend =
      allowBlend && crawling && t > 0.02 && base === lo && next < count && loaded(next);

    const now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paint(images[base]!, 1);
    if (wantBlend) paint(images[next]!, t);

    /* self-tuning: a device that cannot hold ~45fps has nothing spare for the
       second draw, and blending there costs more pictures than it adds */
    if (allowBlend && lastPaintAt) {
      if (now - lastPaintAt > SLOW_PAINT_MS) {
        if (++strikes >= STRIKES) allowBlend = false;
      } else if (strikes > 0) strikes--;
    }
    lastPaintAt = now;
    last = clamped;
    if (!painted) { painted = true; onFirstPaint?.(); }
  }

  return {
    draw,
    redraw: () => draw(last),
    blending: () => allowBlend,
  };
}

/* Scrub feel, overridable per visit so Ben can compare without a deploy.
   `?scrub=0.4` tracks the finger tightly; `?scrub=1.5` glides. Out-of-range
   or missing values fall back to whatever the component ships with, and the
   parameter is only read once at mount. `?blend=0` turns the cross-fade off
   for an A/B against the old behaviour. */
export function scrubFromUrl(fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = Number(new URLSearchParams(window.location.search).get("scrub"));
  return Number.isFinite(v) && v >= 0 && v <= 4 ? v : fallback;
}

export function blendFromUrl(): boolean {
  if (typeof window === "undefined") return true;
  return new URLSearchParams(window.location.search).get("blend") !== "0";
}
