/* One place that knows how to stop the page scrolling.

   `document.body.style.overflow = "hidden"` does nothing here: the site drives
   scrolling with Lenis, which moves the window programmatically and ignores
   overflow entirely. So the smooth scroller registers itself and anything that
   needs a modal lock (today: the mobile menu) asks through here. The html class
   also lets CSS get the floating buttons out of the way. */

type Scroller = {
  stop: () => void;
  start: () => void;
  scrollTo?: (target: number | HTMLElement, opts?: { immediate?: boolean; force?: boolean }) => void;
};

let scroller: Scroller | null = null;

export function registerScroller(s: Scroller | null) {
  scroller = s;
}

/* Jump the page NOW, killing any easing still in flight. window.scrollTo is
   not enough here: Lenis animates toward its own internal target, so a plain
   jump gets overridden on the next frame by wherever Lenis was still heading —
   which is exactly how a new page opened at the bottom. `force` matters too:
   the mobile menu navigates with the scroller stopped, and without it the
   reset is silently ignored. */
export function jumpTo(target: number | HTMLElement) {
  if (scroller?.scrollTo) scroller.scrollTo(target, { immediate: true, force: true });
  else window.scrollTo(0, typeof target === "number" ? target : target.offsetTop);
}

/* The act-snap glide animates window scroll directly; if Lenis keeps easing
   toward its own stale target underneath it, the two fight and the glide
   stutters. Halt it for the glide's duration, nothing else. */
export function haltScroller() { scroller?.stop(); }
export function resumeScroller() { scroller?.start(); }

export function lockScroll() {
  scroller?.stop();
  document.documentElement.classList.add("nav-open");
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  scroller?.start();
  document.documentElement.classList.remove("nav-open");
  document.body.style.overflow = "";
}
