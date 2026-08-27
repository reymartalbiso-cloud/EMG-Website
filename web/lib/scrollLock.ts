/* One place that knows how to stop the page scrolling.

   `document.body.style.overflow = "hidden"` does nothing here: the site drives
   scrolling with Lenis, which moves the window programmatically and ignores
   overflow entirely. So the smooth scroller registers itself and anything that
   needs a modal lock (today: the mobile menu) asks through here. The html class
   also lets CSS get the floating buttons out of the way. */

type Scroller = { stop: () => void; start: () => void };

let scroller: Scroller | null = null;

export function registerScroller(s: Scroller | null) {
  scroller = s;
}

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
