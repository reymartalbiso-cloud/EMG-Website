/* Loading order for the scroll-scrub sequences.

   The ORDER matters more than the speed. Loading 0,1,2,...,n means a reader who
   scrolls faster than the download runs off the end of what exists, and the
   picture sticks on the last loaded frame until the download catches up. It
   reads as lag even at a locked 60fps, because the frame rate was never the
   problem: measured cold on 4G, a reader reached frame 361 of the hero with
   only 157 frames present, and 84 on a poor connection.

   So we load in interleaved passes: every 16th frame, then the midpoints of
   those, then theirs, down to every frame. After the first pass (a couple of
   dozen images) the WHOLE sequence can be scrubbed end to end; every later
   pass only makes the motion finer. The picture is never stuck, just briefly
   coarse, and it sharpens under the reader's thumb. */

export function interleavedOrder(count: number): number[] {
  const out: number[] = [];
  const seen = new Uint8Array(count);
  for (let step = 16; step >= 1; step >>= 1) {
    for (let i = 0; i < count; i += step) {
      if (!seen[i]) { seen[i] = 1; out.push(i); }
    }
  }
  const last = count - 1;
  if (last >= 0 && !seen[last]) out.push(last);
  return out;
}

/** Frames in the first pass: enough to scrub the whole thing end to end. */
export const coarseCount = (count: number) => Math.ceil(count / 16);

export type SequenceOpts = {
  count: number;
  src: (i: number) => string;
  images: (HTMLImageElement | undefined)[];
  concurrency?: number;
  /** a frame landed; i is its index, so the caller can redraw if it is near */
  onFrame?: (i: number, loaded: number) => void;
  /** the first pass is in: the reader can now scrub the entire sequence */
  onCoarse?: () => void;
};

export function loadSequence(opts: SequenceOpts): { cancel: () => void } {
  const { count, src, images, onFrame, onCoarse } = opts;
  const concurrency = opts.concurrency ?? 8;
  const order = interleavedOrder(count);
  const coarse = coarseCount(count);
  let inFlight = 0, next = 0, loaded = 0, killed = false, announced = false;

  const pump = () => {
    while (inFlight < concurrency && next < order.length && !killed) {
      const i = order[next++];
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        if (killed) return;
        inFlight--; loaded++;
        onFrame?.(i, loaded);
        if (!announced && loaded >= coarse) { announced = true; onCoarse?.(); }
        /* the first-visit veil watches this: `ready` means the whole sequence
           is scrubbable, which is a far better gate than a frame count */
        window.dispatchEvent(new CustomEvent("emg:preload", {
          detail: { loaded, total: count, ready: loaded >= coarse },
        }));
        pump();
      };
      img.src = src(i);
      images[i] = img;
      inFlight++;
    }
  };
  pump();
  return { cancel: () => { killed = true; } };
}

/* Phones get their own smaller frame set. A 390px screen at 2x needs 780px of
   picture; sending 1600px costs roughly twice the bytes to draw the same thing,
   and bytes are exactly what these sequences are short of.

   The test has to be in DEVICE pixels, not CSS pixels. The canvas is sized
   clientWidth x dpr (capped at 2), so a 768px tablet at 2x is really asking for
   1536px of picture and must get the full set; judging by CSS width alone would
   hand it the 900px frames and visibly soften them. */
export const wantsSmallFrames = () => {
  if (typeof window === "undefined") return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (window.innerWidth * dpr <= 1000) return true;

  /* Weak desktops get the small set too. The bottleneck on a slow CPU is not
     drawing the canvas, it is DECODING the source frames: at 4x CPU throttle
     the camp scrub ran 29fps with 12 visible hitches on the 1440px set and
     47-60fps with one hitch on the 900px set, same canvas, same code. A
     900px picture stretched to a big screen is softer, but the reader this
     fires for was getting a slideshow, and softness moves with the scroll
     while stutter is what the eye locks onto.

     deviceMemory is capped at 8 and missing outside Chromium, so treat both
     signals as "only trip on clear evidence": <= 4GB of RAM or <= 4 threads.
     (Save-data readers never reach this code — the heroes skip the sequence
     entirely and hold the poster.) */
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return true;
  return false;
};
