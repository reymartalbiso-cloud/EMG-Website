"use client";

/* StatCounter (design doc §5): countTo on enter, tabular-nums, reserved width.
   Final value lives in the HTML for no-JS and screen readers. */

import { useEffect, useRef } from "react";

export default function CountStat({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / 1000);
        const eased = 1 - Math.pow(1 - p, 2);
        el.textContent = Math.round(value * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, suffix]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums", display: "inline-block", minWidth: `${String(value).length + suffix.length}ch` }}>
      {value}{suffix}
    </span>
  );
}