"use client";

/* Tour cinema: the walkthrough video presented as an instrument, not a bare
   <video controls>. Plays muted while in view (pauses off-screen), custom
   chrome — HUD label, laterite progress rail, timecode, sound + fullscreen —
   and a caption strip that hands off to the configurator. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function TourCinema() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  /* play only while on screen — a tour shouldn't run to an empty room */
  useEffect(() => {
    const v = videoRef.current!;
    v.muted = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.45 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = videoRef.current!;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current!;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const fullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = frameRef.current!;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };
  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current!;
    const r = e.currentTarget.getBoundingClientRect();
    if (dur) v.currentTime = ((e.clientX - r.left) / r.width) * dur;
  };

  const pct = dur ? (time / dur) * 100 : 0;

  return (
    <figure className="tour-cinema">
      <div className="tour-frame" ref={frameRef} onClick={toggle}>
        <video
          ref={videoRef}
          loop
          playsInline
          preload="metadata"
          poster="/cfg/tour_poster.jpg"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        >
          <source src="/cfg/tour_video.mp4" type="video/mp4" />
        </video>

        <div className="tour-hud mono" aria-hidden="true">
          <span>WALKTHROUGH</span>
          <span>40FT ONE — ONE BEDROOM</span>
        </div>

        {!playing && (
          <span className="tour-bigplay" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        )}

        <div className="tour-controls">
          <button
            className="tour-btn"
            onClick={(e) => { e.stopPropagation(); toggle(); }}
            aria-label={playing ? "Pause tour video" : "Play tour video"}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <span className="tour-time mono">{fmt(time)} / {fmt(dur)}</span>
          <span className="tour-spacer" />
          <button className="tour-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            )}
          </button>
          <button className="tour-btn" onClick={fullscreen} aria-label="Fullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" />
              <path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            </svg>
          </button>
        </div>

        <div className="tour-progress" onClick={scrub} aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <figcaption className="tour-caption">
        <span className="mono">40FT ONE · 1 BED · FROM $57,900 INC GST</span>
        <Link className="btn btn-accent" href="/build-your-own?model=one" onClick={(e) => e.stopPropagation()}>
          Build &amp; price ↗
        </Link>
      </figcaption>
    </figure>
  );
}
