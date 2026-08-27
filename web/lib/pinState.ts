/* Which pinned section, if any, currently owns the screen.

   The floating buttons are fixed and the heroes and the journey rail are
   pinned, so anything the buttons cover stays covered for the whole section:
   the reader cannot scroll it out from under them. Measured: 55% of the hero's
   progress counter and 42% of a rail caption's body text permanently hidden on
   a small phone, with the caption cut mid-sentence.

   Reserving space does not work here (the caption is `inset: 0` inside its
   parent, and the wide CTA would need 170px of a 390px screen). So during a
   pinned section the floating buttons simply stand down. Nothing is lost: the
   hero's closing act carries its own buttons, and they return the moment the
   pin releases.

   A counter, not a boolean: pins overlap at their boundaries, and the one
   leaving must not clear the flag the one arriving just set. */

let depth = 0;

function apply() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("pinned", depth > 0);
}

export function setPinned(active: boolean) {
  depth = Math.max(0, depth + (active ? 1 : -1));
  apply();
}

/** for unmount: drop this component's claim without going negative */
export function releasePin(wasActive: boolean) {
  if (wasActive) setPinned(false);
}
