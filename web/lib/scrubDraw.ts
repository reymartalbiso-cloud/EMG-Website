/* Sub-frame blending for the scroll-scrub sequences.
 *
 * The three sequences (Hero 719, CampHero 479, JourneySequence 719) each drew
 * Math.round(playhead) and redrew only when that integer changed. Measured on
 * 28 Aug, that leaves the picture standing still for most of a slow scroll:
 *
 *   desktop, 15s scrub   361/361 frames shown, 63% of paints repeat a frame
 *   desktop, 5s  scrub   301/361 shown, 22% repeat, 16% skip ahead
 *   desktop, 1.5s flick   92/361 shown, 51% skip ahead
 *
 * The 63% is the stepping you feel when scrubbing slowly. Two things fix it,
 * and both shipped: blending between the frames either side of the playhead
 * (the in-between positions become real pictures instead of a held one), and
 * — 4 Sep — motion-interpolating the sequences themselves to 48fps, which
 * halves how far apart those two pictures are. An earlier version of this
 * comment argued that adding frames cannot help because flicks skip frames
 * anyway; that is true at flick speed and beside the point in the crawl
 * regime where the stepping complaint actually lived, and the camp sequence
 * (interpolated, densest on the site) was always the one Ben called smooth.
 *
 * The second draw is not free, so it is spent only where it buys something:
 * while the playhead is crawling (a fast scrub is already skipping, and the
 * blend would be invisible), and only while the device is keeping up.
 */

import { haltScroller, resumeScroller } from "@/lib/scrollLock";

export type FrameRenderer = {
  /** draw at a fractional frame position */
  draw(exact: number): void;
  /** redraw the current position, e.g. after a resize */
  redraw(): void;
  /** true when this renderer is currently blending */
  blending(): boolean;
};

/** how far the playhead may move between paints and still be worth blending
    when the sequence is dense. Beyond this we are skipping frames anyway and
    the blend is invisible. Does not apply when frames are still arriving —
    see MAX_SPAN. */
const CRAWL = 1.35;
/** Reymart, 31 Aug: "it feels like freezing... like I'm scrolling every
    picture, no transition."

    Measured: scrolling the moment the page appears, with 1 of 361 frames in,
    gives 34 distinct pictures across the whole sequence, 89% of paints
    repeating, and holds of up to 700ms. Four seconds later it is 0% repeats.
    So the stepping he feels is the loading window, not the scrub — and the
    blend as first written could not help, because it required frame N and N+1
    and the interleaved loader delivers every 16th first.

    Blending between the two nearest LOADED frames instead covers the gap
    whatever its size: at 1-in-16 density the playhead crossfades from frame 16
    to frame 32 rather than snapping. Capped, because past about a coarse step
    apart the two pictures differ enough that a crossfade reads as a dissolve
    rather than as movement. */
const MAX_SPAN = 16;
/** Measured 28 Aug: watching draw DURATION was the wrong signal. On a 4x
    throttled phone the two draws stayed under budget individually, yet the
    paint interval stretched and slow scrub came out worse blended (60% ->
    64% repeats, 36.6 -> 34.7fps) than not. Watch the interval between paints
    instead — that is the thing the viewer actually feels. Above ~22ms the
    device is already under 45fps and has nothing spare to give a second draw. */
const SLOW_PAINT_MS = 22;
/** consecutive slow paints before blending backs off */
const STRIKES = 6;
/** Ignore the first stretch of draws. The guard used to judge the device
    during start-up, when hydration and frame decoding make paints slow for
    reasons that have nothing to do with blending. On production that was
    enough to condemn a desktop that then held 60fps all day: crawl came out
    63% -> 57% with fps 59.2 -> 50.3, against 63% -> 9% with fps held locally,
    where start-up is never slow enough to trip it. */
const WARMUP_PAINTS = 45;
/** A latching switch cannot recover from a transient stall, so back off for a
    while and try again instead. A genuinely slow device simply re-trips, at a
    cost of one extra draw every couple of seconds. */
const BACKOFF_MS = 2500;
/** A gap this long is a background tab or an unrelated long task, not us. */
const NOT_OUR_FAULT_MS = 200;

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

  /* A pre-decoded ImageBitmap window was built and measured here on 4 Sep
     and REJECTED: per-draw decode drops 9.5ms -> 0.6ms in a microbench, but
     system-level the decode pump competes with raster for the same throttled
     CPU — flick regime 29fps -> 6fps even with the pump gated to the crawl,
     and the crawl regime (54fps, 0 long gaps WITHOUT it) picked up 8 long
     gaps WITH it. Decode-at-paint at crawl is one decode per new frame, which
     the plain path already does; the window only added lookahead waste and
     create/close churn. Do not rebuild it without new evidence from a real
     weak device rather than a throttled emulation. */
  function paint(index: number, alpha: number) {
    const img = images[index]!;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / iw, ch / ih);
    const w = iw * s, h = ih * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }

  let last = 0;
  /* ?blend=0 gives a true A/B against the old draw-on-integer-change
     behaviour. Read once here rather than per paint. */
  const blendWanted = blendFromUrl();
  let strikes = 0;
  let lastPaintAt = 0;
  let paintCount = 0;
  let blendPausedUntil = 0;
  let painted = false;

  function draw(exact: number) {
    const clamped = Math.max(0, Math.min(count - 1, exact));
    const lo = Math.floor(clamped);
    const base = nearestLoaded(lo);
    if (base < 0) return;

    /* the two loaded frames the playhead currently sits between */
    let below = lo, above = -1;
    while (below >= 0 && !loaded(below)) below--;
    for (let i = Math.max(lo + 1, below + 1); i < count && i - Math.max(below, 0) <= MAX_SPAN; i++) {
      if (loaded(i)) { above = i; break; }
    }

    /* where between them we are — with every frame loaded this is just the
       fractional part, and while the sequence is still arriving it is the
       position across whatever gap exists */
    const span = above > below ? above - below : 0;
    const t = span > 0 ? (clamped - below) / span : 0;

    /* Crawling gates WHETHER to blend; the span decides WHAT to blend between.
       Letting a sparse sequence blend at any speed was measurably worse: on a
       desktop flick it took repeats from 49% to 56% and cost 8fps, because at
       that pace the second draw loses more paints than the crossfade adds
       pictures. The gap-spanning is the win; doing it during a flick is not. */
    const crawling = Math.abs(clamped - last) <= CRAWL;
    const now = performance.now();
    const wantBlend =
      blendWanted && now >= blendPausedUntil &&
      below >= 0 && span > 0 && t > 0.02 && t < 0.995 && crawling;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paint(wantBlend ? below : base, 1);
    if (wantBlend) paint(above, t);

    /* self-tuning: a device that cannot hold ~45fps has nothing spare for the
       second draw. Judged only once past warm-up, and only while we are
       actually blending — otherwise we would blame the blend for stalls it
       had no part in. */
    paintCount++;
    if (wantBlend && paintCount > WARMUP_PAINTS && lastPaintAt) {
      const gap = now - lastPaintAt;
      if (gap > SLOW_PAINT_MS && gap < NOT_OUR_FAULT_MS) {
        if (++strikes >= STRIKES) { blendPausedUntil = now + BACKOFF_MS; strikes = 0; }
      } else if (strikes > 0) strikes--;
    }
    lastPaintAt = now;
    last = clamped;
    if (!painted) { painted = true; onFirstPaint?.(); }
  }

  return {
    draw,
    redraw: () => draw(last),
    blending: () => blendWanted && performance.now() >= blendPausedUntil,
  };
}

/* Scrub feel, overridable per visit so Ben can compare without a deploy.
   `?scrub=0.4` tracks the finger tightly; `?scrub=1.5` glides. Out-of-range
   or missing values fall back to whatever the component ships with, and the
   parameter is only read once at mount. `?blend=0` turns the cross-fade off
   for an A/B against the old behaviour. */
export function scrubFromUrl(fallback: number): number {
  if (typeof window === "undefined") return fallback;
  /* Number(null) === 0, and 0 is inside the valid range — so before this
     guard, a page with NO ?scrub param silently ran scrub 0 and the fallback
     was dead code. That shipped on 31 Aug and is what everyone, Ben included,
     has been scrolling since. The 4 Sep audit measured it (no-param behaved
     identically to ?scrub=0 on every metric) and nobody had complained about
     tightness, so the heroes now pass 0 EXPLICITLY as their fallback — this
     guard exists so the URL override works as documented, not to change the
     shipped feel. */
  const raw = new URLSearchParams(window.location.search).get("scrub");
  if (raw === null) return fallback;
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 && v <= 4 ? v : fallback;
}

/* Act snapping — Reymart, 5 Sep: "when a customer will scroll down once it
   should go to 'Or fifty' directly, however the movement should still be
   there." A reader can otherwise stop anywhere, including resting on a
   between-frames cross-fade, which reads as a blurry nothing with no caption
   fully on. So when scrolling ends, the page glides to the next act in the
   direction of travel: the frames play through the glide (the movement he
   wants kept) and the resting position is quantized to an EXACT frame, so
   nobody ever parks on a blend. ?snap=0 turns it off for A/B. */
export function actSnap(
  ranges: { from: number; to: number }[],
  count: number
): object | undefined {
  if (typeof window === "undefined") return undefined;
  if (new URLSearchParams(window.location.search).get("snap") === "0") return undefined;
  const mids = ranges.map((r) => {
    const p = Math.min(1, (r.from + r.to) / 2);
    return Math.round(p * (count - 1)) / (count - 1);
  });
  /* 0 and 1 stay snap points so the hero never traps a reader at either
     edge: leaving the pin is always "the next stop" in their direction */
  const points = [0, ...mids, 1];
  return {
    snapTo: points,
    duration: { min: 0.35, max: 0.9 },
    delay: 0.06,
    ease: "power2.inOut",
    directional: true,
    /* no velocity projection: a hard flick would otherwise sail past every
       act and collapse the hero to its final frame. Land where the scroll
       actually stops, then glide to the next act from there. */
    inertia: false,
    onStart: haltScroller,
    onComplete: resumeScroller,
    onInterrupt: resumeScroller,
  };
}

export function blendFromUrl(): boolean {
  if (typeof window === "undefined") return true;
  return new URLSearchParams(window.location.search).get("blend") !== "0";
}

/* How far the hero pins, as a percentage of viewport height, overridable per
   visit the same way `scrub` is.
 *
 * The source film is 24fps and the sequence already uses every frame it has,
 * so there is no more temporal detail to extract. What decides whether it
 * reads as motion or as steps is how fast the scroll traverses those frames:
 * at the shipped 500%, a normal five-second scroll covers the whole sequence
 * in about a third of the film's real running time, so you are watching 24fps
 * footage at 3x speed and it strobes.
 *
 * Measured over a fixed 4,000px gesture, mean pixel change between paints:
 *
 *   500% pin   20.8   p95 44.3
 *   900% pin   14.2   p95 29.3
 *
 * A third less jump for nothing, and the cost is that the hero takes almost
 * twice as much scrolling to get past. That is a feel decision rather than a
 * correct answer, so it stays where Ben can try it. */
export function pinFromUrl(fallbackDesktop: number, fallbackMobile: number): string {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches;
  const fallback = mobile ? fallbackMobile : fallbackDesktop;
  if (typeof window === "undefined") return `+=${fallback}%`;
  const v = Number(new URLSearchParams(window.location.search).get("pin"));
  const pct = Number.isFinite(v) && v >= 200 && v <= 1600
    ? (mobile ? Math.round(v * (fallbackMobile / fallbackDesktop)) : v)
    : fallback;
  return `+=${pct}%`;
}
