"use client";

/* "Design your layout" — drag-and-drop container floor planner (brief §7.2).
   All geometry runs on an INTEGER grid (1 cell = 5cm): no float residue, so
   snapping, collision and bounds checks are exact by construction.
   Deterministic by design: snap-to-grid, collision prevention, real fixture
   dimensions. Output (fixtures, partitions and positions) is attached to the
   enquiry.

   Drawn as a real plan: hatched walls, door swing, window openings,
   dimension lines, scale bar and a title block, with plan-view icons for
   every fixture. Customers can also drop internal partitions and drag their
   ends to leave a doorway. Alignment guides, a live measurement readout,
   undo/redo and PNG export sit on top of the same integer engine. */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FIXTURES, CAT_COLOURS, CAT_LABELS, CAT_ORDER, PRESETS, CELL, cellsOf,
  WALL_T_C, WALL_MIN_C, PARTITION_C, type PlacedItem, type Wall,
} from "@/lib/fixtures";
import FixtureIcon, { FixtureGlyph } from "@/lib/fixtureIcons";

const WALL_C = 2;        // shell wall thickness in cells (0.1m)
const WIDTH_C = 49;      // container outer width in cells (2.44m → 48.8, floor to 48; keep 49*0.05=2.45≈)
const PAD_L = 11, PAD_T = 10, PAD_R = 7, PAD_B = 33;  // bottom pad carries the OUTWARD door swing + annotations
const S = 5;             // svg units per cell (so 1m = 100 units)

type Props = {
  len20: boolean;
  colourHex: string;
  onChange: (items: PlacedItem[], summary: string, plan: string) => void;
};

type Sel = { k: "i" | "w"; id: number } | null;

type Drag =
  | { k: "item"; id: number; pid: number; dx: number; dy: number; cx: number; cy: number }
  | { k: "wall"; id: number; pid: number; off: number; c: number }
  | { k: "end"; id: number; pid: number; end: "a" | "b"; a: number; b: number };

const fixtureOf = (type: string) => FIXTURES.find((f) => f.type === type)!;
/* dimensions in cells, honouring rotation */
const dimsC = (it: { type: string; rot: boolean }) => {
  const f = fixtureOf(it.type);
  const w = cellsOf(f.w), h = cellsOf(f.h);
  return { w: it.rot ? h : w, h: it.rot ? w : h };
};
/* a partition's footprint in cells, so it can be tested like any other box */
const wallBox = (w: Wall) =>
  w.o === "v"
    ? { cx: w.c, cy: w.a, w: WALL_T_C, h: w.b - w.a }
    : { cx: w.a, cy: w.c, w: w.b - w.a, h: WALL_T_C };
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export default function LayoutDesigner({ len20, colourHex, onChange }: Props) {
  const LEN_C = len20 ? 121 : 243;         // 6.06m → 121.2, 12.19m → 243.8 (floored)
  const innerW = LEN_C - WALL_C * 2;       // usable cells along length
  const innerH = WIDTH_C - WALL_C * 2;     // usable cells across width (45 → 2.25m)

  const [items, setItems] = useState<PlacedItem[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const itemsRef = useRef<PlacedItem[]>([]); // synchronous source of truth — no stale closures
  const wallsRef = useRef<Wall[]>([]);
  const [sel, setSel] = useState<Sel>(null);
  const [dragSel, setDragSel] = useState<Sel>(null);
  const [invalidFlash, setInvalidFlash] = useState(false);
  const [histVer, setHistVer] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const idRef = useRef(1);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<Drag | null>(null);

  /* undo history — snapshots at meaningful boundaries, not every drag frame */
  const histRef = useRef<{ i: PlacedItem[]; w: Wall[] }[]>([{ i: [], w: [] }]);
  const hiRef = useRef(0);

  const pushHist = useCallback((i: PlacedItem[], w: Wall[]) => {
    histRef.current = histRef.current.slice(0, hiRef.current + 1);
    histRef.current.push({ i, w });
    if (histRef.current.length > 80) histRef.current.shift();
    hiRef.current = histRef.current.length - 1;
    setHistVer((v) => v + 1);
  }, []);

  const commit = useCallback((i: PlacedItem[], w: Wall[], record = true) => {
    itemsRef.current = i; wallsRef.current = w;
    setItems(i); setWalls(w);
    if (record) pushHist(i, w);
  }, [pushHist]);
  const commitItems = (next: PlacedItem[], record = true) => commit(next, wallsRef.current, record);
  const commitWalls = (next: Wall[], record = true) => commit(itemsRef.current, next, record);

  const applyHist = (idx: number) => {
    hiRef.current = idx;
    const s = histRef.current[idx];
    itemsRef.current = s.i; wallsRef.current = s.w;
    setItems(s.i); setWalls(s.w);
    setSel(null);
    setHistVer((v) => v + 1);
  };
  const undo = () => { if (hiRef.current > 0) applyHist(hiRef.current - 1); };
  const redo = () => { if (hiRef.current < histRef.current.length - 1) applyHist(hiRef.current + 1); };

  const summary = (list: PlacedItem[], wl: Wall[]) => {
    const counts = new Map<string, number>();
    list.forEach((it) => counts.set(it.type, (counts.get(it.type) || 0) + 1));
    const parts = Array.from(counts.entries())
      .map(([t, n]) => (n > 1 ? `${n}× ` : "") + fixtureOf(t).name);
    if (wl.length) parts.push(`${wl.length}× internal partition`);
    return parts.join(", ");
  };
  /* A finger drag used to die after a few events: the browser handed the
     gesture to the canvas pan instead. `touch-action` cannot fix it because it
     is ignored on SVG child elements, and changing it mid-gesture is too late.
     A non-passive touchmove listener that only cancels WHILE a drag is live
     stops the pan without costing the 40ft plan its sideways scroll. */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const block = (ev: TouchEvent) => { if (dragRef.current) ev.preventDefault(); };
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  /* human-readable plan with positions in metres — this reaches the enquiry */
  const plan = (list: PlacedItem[], wl: Wall[]) => {
    const f = list.map(
      (it) => `${fixtureOf(it.type).name}@${(it.cx * CELL).toFixed(2)},${(it.cy * CELL).toFixed(2)}m${it.rot ? " (rotated)" : ""}`
    );
    const w = wl.map((x) =>
      x.o === "v"
        ? `Partition across@${(x.c * CELL).toFixed(2)}m spanning ${(x.a * CELL).toFixed(2)}-${(x.b * CELL).toFixed(2)}m`
        : `Partition along@${(x.c * CELL).toFixed(2)}m spanning ${(x.a * CELL).toFixed(2)}-${(x.b * CELL).toFixed(2)}m`
    );
    return [...f, ...w].join("; ");
  };

  useEffect(() => { onChange(items, summary(items, walls), plan(items, walls)); }, [items, walls]); // eslint-disable-line react-hooks/exhaustive-deps

  /* exact integer AABB + bounds — touching edges are legal.
     Partitions are deliberately NOT part of this test: a customer should be
     able to draw where a wall goes before rearranging the furniture. Any
     fixture the wall lands on is flagged instead of blocked. */
  function collides(list: PlacedItem[], cand: { cx: number; cy: number; w: number; h: number }, ignoreId: number) {
    if (cand.cx < 0 || cand.cy < 0 || cand.cx + cand.w > innerW || cand.cy + cand.h > innerH) return true;
    return list.some((o) => {
      if (o.id === ignoreId) return false;
      const od = dimsC(o);
      return !(cand.cx + cand.w <= o.cx || o.cx + od.w <= cand.cx || cand.cy + cand.h <= o.cy || o.cy + od.h <= cand.cy);
    });
  }

  function flashInvalid() {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setInvalidFlash(true);
    flashTimer.current = setTimeout(() => setInvalidFlash(false), 350);
  }
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  /* palette tap → first free cell, scanning every cell */
  function addFixture(type: string) {
    const f = fixtureOf(type);
    const w = cellsOf(f.w), h = cellsOf(f.h);
    const list = itemsRef.current;
    for (let cy = 0; cy <= innerH - h; cy++) {
      for (let cx = 0; cx <= innerW - w; cx++) {
        if (!collides(list, { cx, cy, w, h }, -1)) {
          const it: PlacedItem = { id: idRef.current++, type, cx, cy, rot: false };
          commitItems([...list, it]);
          setSel({ k: "i", id: it.id });
          return;
        }
      }
    }
    flashInvalid();
  }

  /* partitions drop in the middle, full span, offset from any wall already
     sitting there so a second one is never hidden under the first */
  function addWall(o: "v" | "h") {
    const span = o === "v" ? innerH : innerW;
    const limit = (o === "v" ? innerW : innerH) - WALL_T_C;
    let c = clamp(Math.round(span === innerH ? innerW / 2 : innerH / 2) - 1, 0, limit);
    const list = wallsRef.current;
    for (let n = 0; n < 24 && list.some((x) => x.o === o && Math.abs(x.c - c) < WALL_T_C * 2); n++) {
      c = clamp(c + WALL_T_C * 4, 0, limit);
    }
    const w: Wall = { id: idRef.current++, o, c, a: 0, b: span };
    commitWalls([...list, w]);
    setSel({ k: "w", id: w.id });
  }

  function toCells(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const r = svgRef.current!.getBoundingClientRect();
    const vbWidth = (LEN_C + PAD_L + PAD_R) * S;
    const scale = vbWidth / r.width;
    return {
      x: ((e.clientX - r.left) * scale) / S - PAD_L - WALL_C,
      y: ((e.clientY - r.top) * scale) / S - PAD_T - WALL_C,
    };
  }

  function moveTo(id: number, rawX: number, rawY: number, record = true) {
    const list = itemsRef.current;
    const it = list.find((i) => i.id === id);
    if (!it) return;
    const d = dimsC(it);
    const nx = clamp(Math.round(rawX), 0, innerW - d.w);
    const ny = clamp(Math.round(rawY), 0, innerH - d.h);
    /* try full move, then per-axis fallback so items slide along obstacles/walls */
    const attempts: [number, number][] = [[nx, ny], [nx, it.cy], [it.cx, ny]];
    for (const [ax, ay] of attempts) {
      if (ax === it.cx && ay === it.cy) continue;
      if (!collides(list, { cx: ax, cy: ay, w: d.w, h: d.h }, id)) {
        commitItems(list.map((i) => (i.id === id ? { ...i, cx: ax, cy: ay } : i)), record);
        return;
      }
    }
  }

  function moveWall(id: number, rawC: number, record = true) {
    const list = wallsRef.current;
    const w = list.find((x) => x.id === id);
    if (!w) return;
    const limit = (w.o === "v" ? innerW : innerH) - WALL_T_C;
    const nc = clamp(Math.round(rawC), 0, limit);
    if (nc === w.c) return;
    commitWalls(list.map((x) => (x.id === id ? { ...x, c: nc } : x)), record);
  }

  function resizeWall(id: number, end: "a" | "b", rawV: number, record = true) {
    const list = wallsRef.current;
    const w = list.find((x) => x.id === id);
    if (!w) return;
    const span = w.o === "v" ? innerH : innerW;
    const v = Math.round(rawV);
    const next = end === "a"
      ? { ...w, a: clamp(v, 0, w.b - WALL_MIN_C) }
      : { ...w, b: clamp(v, w.a + WALL_MIN_C, span) };
    if (next.a === w.a && next.b === w.b) return;
    commitWalls(list.map((x) => (x.id === id ? next : x)), record);
  }

  function flipWall(id: number) {
    const list = wallsRef.current;
    const w = list.find((x) => x.id === id);
    if (!w) return;
    const o: "v" | "h" = w.o === "v" ? "h" : "v";
    const span = o === "v" ? innerH : innerW;
    const limit = (o === "v" ? innerW : innerH) - WALL_T_C;
    commitWalls(list.map((x) => (x.id === id ? { ...x, o, c: clamp(Math.round(limit / 2), 0, limit), a: 0, b: span } : x)));
  }

  function onItemDown(e: React.PointerEvent, it: PlacedItem) {
    if (dragRef.current) return; // one drag at a time — a second pointer can't hijack
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    /* preventDefault stops the click focusing this node, so the documented
       keyboard shortcuts would never reach it. Focus it by hand. */
    (e.currentTarget as SVGGElement).focus?.();
    setSel({ k: "i", id: it.id });
    setDragSel({ k: "i", id: it.id });
    const m = toCells(e);
    dragRef.current = { k: "item", id: it.id, pid: e.pointerId, dx: m.x - it.cx, dy: m.y - it.cy, cx: it.cx, cy: it.cy };
  }

  function onWallDown(e: React.PointerEvent, w: Wall) {
    if (dragRef.current) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    (e.currentTarget as SVGGElement).focus?.();
    setSel({ k: "w", id: w.id });
    setDragSel({ k: "w", id: w.id });
    const m = toCells(e);
    dragRef.current = { k: "wall", id: w.id, pid: e.pointerId, off: (w.o === "v" ? m.x : m.y) - w.c, c: w.c };
  }

  function onEndDown(e: React.PointerEvent, w: Wall, end: "a" | "b") {
    if (dragRef.current) return;
    e.preventDefault();
    e.stopPropagation();   // never start a move drag from an end handle
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setSel({ k: "w", id: w.id });
    setDragSel({ k: "w", id: w.id });
    dragRef.current = { k: "end", id: w.id, pid: e.pointerId, end, a: w.a, b: w.b };
  }

  function onDragMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pid) return;
    if (e.pointerType === "mouse" && (e.buttons & 1) === 0) { endDragState(); return; }
    const m = toCells(e);
    if (d.k === "item") moveTo(d.id, m.x - d.dx, m.y - d.dy, false);
    else if (d.k === "wall") {
      const w = wallsRef.current.find((x) => x.id === d.id);
      if (w) moveWall(d.id, (w.o === "v" ? m.x : m.y) - d.off, false);
    } else {
      const w = wallsRef.current.find((x) => x.id === d.id);
      if (w) resizeWall(d.id, d.end, w.o === "v" ? m.y : m.x, false);
    }
  }

  /* one history entry per drag, and only if something actually changed */
  function endDragState() {
    const d = dragRef.current;
    dragRef.current = null;
    setDragSel(null);
    if (!d) return;
    if (d.k === "item") {
      const it = itemsRef.current.find((i) => i.id === d.id);
      if (it && (it.cx !== d.cx || it.cy !== d.cy)) pushHist(itemsRef.current, wallsRef.current);
    } else {
      const w = wallsRef.current.find((x) => x.id === d.id);
      if (!w) return;
      const moved = d.k === "wall" ? w.c !== d.c : w.a !== d.a || w.b !== d.b;
      if (moved) pushHist(itemsRef.current, wallsRef.current);
    }
  }
  function endDrag(e: React.PointerEvent) {
    if (dragRef.current && e.pointerId === dragRef.current.pid) endDragState();
  }

  function rotateItem(id: number) {
    const list = itemsRef.current;
    const it = list.find((i) => i.id === id);
    if (!it) return;
    const f = fixtureOf(it.type);
    const nw = it.rot ? cellsOf(f.w) : cellsOf(f.h);
    const nh = it.rot ? cellsOf(f.h) : cellsOf(f.w);
    const nx = Math.min(it.cx, innerW - nw);
    const ny = Math.min(it.cy, innerH - nh);
    if (nx < 0 || ny < 0 || collides(list, { cx: nx, cy: ny, w: nw, h: nh }, id)) {
      flashInvalid();
      return;
    }
    commitItems(list.map((i) => (i.id === id ? { ...i, rot: !i.rot, cx: nx, cy: ny } : i)));
  }

  /* toolbar actions work on whatever is selected — fixture or partition */
  function rotateSel() {
    if (!sel) return;
    if (sel.k === "i") rotateItem(sel.id); else flipWall(sel.id);
  }
  function deleteSel() {
    if (!sel) return;
    if (sel.k === "i") commitItems(itemsRef.current.filter((i) => i.id !== sel.id));
    else commitWalls(wallsRef.current.filter((x) => x.id !== sel.id));
    setSel(null);
  }

  function loadPreset(key: string) {
    const p = PRESETS[key];
    /* presets are authored in-bounds, but validate anyway — never commit an invalid layout */
    const next: PlacedItem[] = [];
    p.items.forEach((raw) => {
      const cand = { ...raw, id: idRef.current++ };
      const d = dimsC(cand);
      if (!collides(next, { cx: cand.cx, cy: cand.cy, w: d.w, h: d.h }, -1)) next.push(cand);
    });
    commit(next, []);
    setSel(null);
  }

  /* keyboard: arrows move 1 cell (Shift = 5), R rotates, Delete removes */
  function onItemKey(e: React.KeyboardEvent, it: PlacedItem) {
    const step = e.shiftKey ? 5 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      moveTo(it.id, it.cx + moves[e.key][0], it.cy + moves[e.key][1]);
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      rotateItem(it.id);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      commitItems(itemsRef.current.filter((i) => i.id !== it.id));
      setSel(null);
    }
  }

  /* a partition only moves along its own axis; Shift+arrows trim the far end */
  function onWallKey(e: React.KeyboardEvent, w: Wall) {
    const along = w.o === "v" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
    const across = w.o === "v" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
    const neg = w.o === "v" ? "ArrowLeft" : "ArrowUp";
    if (along.includes(e.key)) {
      e.preventDefault();
      moveWall(w.id, w.c + (e.key === neg ? -1 : 1) * (e.shiftKey ? 5 : 1));
    } else if (across.includes(e.key)) {
      e.preventDefault();
      const negA = w.o === "v" ? "ArrowUp" : "ArrowLeft";
      resizeWall(w.id, "b", w.b + (e.key === negA ? -1 : 1) * (e.shiftKey ? 5 : 1));
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      flipWall(w.id);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      commitWalls(wallsRef.current.filter((x) => x.id !== w.id));
      setSel(null);
    }
  }

  function onWrapKey(e: React.KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
    else if (k === "y") { e.preventDefault(); redo(); }
  }

  /* Export the plan as a PNG. The live drawing themes itself with CSS
     variables, so the clone gets a fixed print palette — the drawing looks
     the same whoever downloads it, in whichever theme. */
  function exportPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const [, , vw, vh] = (svg.getAttribute("viewBox") || "0 0 1000 400").split(" ").map(Number);
    clone.setAttribute("width", String(vw));
    clone.setAttribute("height", String(vh));
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent =
      ".ld-label{font-family:Inter,system-ui,sans-serif;font-weight:600;fill:#1b1917}" +
      ".ld-note,.ld-dimtext,.ld-title{font-family:'IBM Plex Mono',ui-monospace,monospace;fill:#5E5E58}" +
      ".ld-hud,.ld-guide,.ld-endh{display:none}";
    clone.insertBefore(style, clone.firstChild);
    let str = new XMLSerializer().serializeToString(clone);
    const PRINT: Record<string, string> = {
      "--ld-floor": "#F7F7F6", "--ld-grid": "rgba(27,25,23,0.10)",
      "--text-mid": "#5E5E58", "--text-hi": "#2E2E2B",
      "--line": "#D6D6D1", "--accent": "#B5451B", "--bg-2": "#FFFFFF", "--warn": "#9E6B18",
    };
    Object.entries(PRINT).forEach(([k, v]) => { str = str.split(`var(${k})`).join(v); });

    const url = URL.createObjectURL(new Blob([str], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = vw * 2; c.height = vh * 2;
      const ctx = c.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); return; }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        const href = URL.createObjectURL(blob);
        a.href = href;
        a.download = `emg-layout-${len20 ? "20ft" : "40ft"}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(href), 2000);
      }, "image/png");
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  /* ---------- drawing geometry ---------- */
  const vbW = (LEN_C + PAD_L + PAD_R) * S;
  const vbH = (WIDTH_C + PAD_T + PAD_B) * S;
  const shellX = PAD_L * S, shellY = PAD_T * S;
  const shellW = LEN_C * S, shellH = WIDTH_C * S;
  const wallT = WALL_C * S;
  const OX = (PAD_L + WALL_C) * S, OY = (PAD_T + WALL_C) * S;   // usable-area origin
  const outX = shellX - wallT / 2, outY = shellY - wallT / 2;
  const inX = shellX + wallT / 2, inY = shellY + wallT / 2;
  const inW = shellW - wallT, inH = shellH - wallT;
  const southY = shellY + shellH - wallT / 2;                    // top edge of the south wall band

  /* entry door and glazing on the south side */
  const DOOR_A = 8, DOOR_B = 24;                                 // cells, 0.8m leaf
  const winCount = len20 ? 2 : 4;
  const windows: [number, number][] = Array.from({ length: winCount }, (_, i) => {
    const seg = (innerW - 40) / winCount;
    return [36 + i * seg + seg * 0.2, 36 + i * seg + seg * 0.8];
  });

  const usedCells = items.reduce((n, it) => { const d = dimsC(it); return n + d.w * d.h; }, 0);
  const usedM2 = usedCells * CELL * CELL;
  const freeM2 = innerW * innerH * CELL * CELL - usedM2;

  /* fixtures a partition lands on — flagged, never blocked */
  const crossing = new Set<number>();
  walls.forEach((w) => {
    const b = wallBox(w);
    items.forEach((it) => {
      const d = dimsC(it);
      if (!(b.cx + b.w <= it.cx || it.cx + d.w <= b.cx || b.cy + b.h <= it.cy || it.cy + d.h <= b.cy)) {
        crossing.add(it.id);
      }
    });
  });

  /* smart guides: exact integer edge matches while dragging */
  const dragItem = dragSel?.k === "i" ? items.find((i) => i.id === dragSel.id) : undefined;
  const dragWall = dragSel?.k === "w" ? walls.find((i) => i.id === dragSel.id) : undefined;
  const guideX = new Set<number>();
  const guideY = new Set<number>();
  if (dragItem) {
    const d = dimsC(dragItem);
    const mx = [dragItem.cx, dragItem.cx + d.w], my = [dragItem.cy, dragItem.cy + d.h];
    items.forEach((o) => {
      if (o.id === dragItem.id) return;
      const od = dimsC(o);
      [o.cx, o.cx + od.w].forEach((v) => { if (mx.includes(v)) guideX.add(v); });
      [o.cy, o.cy + od.h].forEach((v) => { if (my.includes(v)) guideY.add(v); });
    });
    walls.forEach((w) => {
      const b = wallBox(w);
      [b.cx, b.cx + b.w].forEach((v) => { if (mx.includes(v)) guideX.add(v); });
      [b.cy, b.cy + b.h].forEach((v) => { if (my.includes(v)) guideY.add(v); });
    });
    if (dragItem.cx === 0) guideX.add(0);
    if (dragItem.cx + d.w === innerW) guideX.add(innerW);
    if (dragItem.cy === 0) guideY.add(0);
    if (dragItem.cy + d.h === innerH) guideY.add(innerH);
  }
  if (dragWall) {
    const b = wallBox(dragWall);
    const set = dragWall.o === "v" ? guideX : guideY;
    const mine = dragWall.o === "v" ? [b.cx, b.cx + b.w] : [b.cy, b.cy + b.h];
    items.forEach((o) => {
      const od = dimsC(o);
      const edges = dragWall.o === "v" ? [o.cx, o.cx + od.w] : [o.cy, o.cy + od.h];
      edges.forEach((v) => { if (mine.includes(v)) set.add(v); });
    });
  }

  const presetKeys = Object.keys(PRESETS).filter((k) => PRESETS[k].len === (len20 ? 20 : 40));
  const canUndo = hiRef.current > 0;
  const canRedo = hiRef.current < histRef.current.length - 1;
  void histVer; // re-render hook for the undo/redo button states

  const dimText = (x: number, y: number, label: string, vertical = false) => (
    <text
      x={x} y={y} textAnchor="middle" className="ld-dimtext"
      transform={vertical ? `rotate(-90 ${x} ${y})` : undefined}
    >
      {label}
    </text>
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div className={`ld${invalidFlash ? " invalid" : ""}`} onKeyDown={onWrapKey}>
      <div className="ld-toolbar">
        {presetKeys.map((k) => (
          <button key={k} className="cfg-pill" onClick={() => loadPreset(k)}>
            Start from: {PRESETS[k].name}
          </button>
        ))}
        <button className="cfg-pill" onClick={() => { commit([], []); setSel(null); }}>Clear</button>
        <span className="ld-spacer" />
        <button className="cfg-pill" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">↶ Undo</button>
        <button className="cfg-pill" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Shift+Z)">↷ Redo</button>
        <button className="cfg-pill" disabled={!sel} onClick={rotateSel}>⟳ Rotate</button>
        <button className="cfg-pill" disabled={!sel} onClick={deleteSel}>✕ Remove</button>
        <button className="cfg-pill" onClick={exportPng} title="Download this plan as a PNG">↓ PNG</button>
      </div>

      <div className="ld-stats mono">
        <span><b>{items.length}</b> {items.length === 1 ? "fixture" : "fixtures"}</span>
        {walls.length > 0 && <span><b>{walls.length}</b> {walls.length === 1 ? "partition" : "partitions"}</span>}
        <span><b>{usedM2.toFixed(1)}</b> m² placed</span>
        <span><b>{freeM2.toFixed(1)}</b> m² floor free</span>
        {crossing.size > 0 && (
          <span className="ld-warn">{crossing.size} {crossing.size === 1 ? "fixture sits" : "fixtures sit"} on a partition</span>
        )}
        {/* a 40ft plan never fits the column at a readable scale — say so */}
        {!len20 && <span className="ld-pan">SCROLL THE PLAN SIDEWAYS TO PAN →</span>}
      </div>

      <div className="ld-canvas-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${vbW} ${vbH}`}
          className={`ld-canvas ${len20 ? "ld-canvas-20" : "ld-canvas-40"}`}
          role="group"
          aria-label={`Container floor plan, ${len20 ? "20" : "40"} foot. Use the fixture buttons below to add items or partitions; arrow keys move a focused item, R rotates, Delete removes.`}
        >
          <defs>
            <pattern id="ldHatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(24,22,20,0.5)" strokeWidth="3" />
            </pattern>
          </defs>

          {/* container shell: floor + walls in the chosen Colorbond colour */}
          <rect
            x={shellX} y={shellY}
            width={shellW} height={shellH}
            rx={4}
            fill="var(--ld-floor)"
            stroke={colourHex}
            strokeWidth={wallT}
          />
          {/* structural hatch across the wall band only (even-odd ring) */}
          <path
            d={`M ${outX} ${outY} h ${shellW + wallT} v ${shellH + wallT} h ${-(shellW + wallT)} Z
                M ${inX} ${inY} h ${inW} v ${inH} h ${-inW} Z`}
            fillRule="evenodd"
            fill="url(#ldHatch)"
            opacity={0.28}
            pointerEvents="none"
          />

          {/* floor grid: 0.5m minor, 1m major */}
          <g pointerEvents="none">
            {Array.from({ length: Math.floor(innerW / 10) }, (_, i) => {
              const c = (i + 1) * 10;
              return (
                <line
                  key={`gx${i}`}
                  x1={OX + c * S} y1={OY} x2={OX + c * S} y2={OY + innerH * S}
                  stroke="var(--ld-grid)" strokeWidth={c % 20 === 0 ? 2 : 1}
                />
              );
            })}
            {Array.from({ length: Math.floor(innerH / 10) }, (_, i) => {
              const c = (i + 1) * 10;
              return (
                <line
                  key={`gy${i}`}
                  x1={OX} y1={OY + c * S} x2={OX + innerW * S} y2={OY + c * S}
                  stroke="var(--ld-grid)" strokeWidth={c % 20 === 0 ? 2 : 1}
                />
              );
            })}
          </g>

          {/* openings in the south wall: entry door with swing, plus glazing */}
          <g pointerEvents="none">
            <rect x={OX + DOOR_A * S} y={southY} width={(DOOR_B - DOOR_A) * S} height={wallT} fill="var(--ld-floor)" />
            {/* swings OUTWARDS (Ben's standing rule for every door):
               leaf perpendicular to the wall on the outside, arc back to the
               far jamb */}
            <path
              d={`M ${OX + DOOR_A * S} ${southY + wallT} L ${OX + DOOR_A * S} ${southY + wallT + (DOOR_B - DOOR_A) * S}
                  A ${(DOOR_B - DOOR_A) * S} ${(DOOR_B - DOOR_A) * S} 0 0 0 ${OX + DOOR_B * S} ${southY + wallT}`}
              fill="none" stroke="var(--text-mid)" strokeWidth={1.5} opacity={0.8}
            />
            {windows.map(([a, b], i) => (
              <g key={`win${i}`}>
                <rect x={OX + a * S} y={southY} width={(b - a) * S} height={wallT} fill="var(--ld-floor)" />
                <line x1={OX + a * S} y1={southY + wallT * 0.36} x2={OX + b * S} y2={southY + wallT * 0.36} stroke="var(--text-mid)" strokeWidth={1.5} />
                <line x1={OX + a * S} y1={southY + wallT * 0.68} x2={OX + b * S} y2={southY + wallT * 0.68} stroke="var(--text-mid)" strokeWidth={1.5} />
              </g>
            ))}
          </g>

          {/* dimension lines — overall length above, overall width to the left */}
          <g className="ld-dim" pointerEvents="none" stroke="var(--text-mid)" strokeWidth={1} opacity={0.85}>
            <line x1={outX} y1={outY} x2={outX} y2={shellY - 6 * S} />
            <line x1={outX + shellW + wallT} y1={outY} x2={outX + shellW + wallT} y2={shellY - 6 * S} />
            <line x1={outX} y1={shellY - 5 * S} x2={outX + shellW + wallT} y2={shellY - 5 * S} />
            <path d={`M ${outX} ${shellY - 6.4 * S} l ${1.4 * S} ${2.8 * S} M ${outX + shellW + wallT} ${shellY - 6.4 * S} l ${1.4 * S} ${2.8 * S}`} />
            <line x1={outX} y1={outY} x2={shellX - 6 * S} y2={outY} />
            <line x1={outX} y1={outY + shellH + wallT} x2={shellX - 6 * S} y2={outY + shellH + wallT} />
            <line x1={shellX - 5 * S} y1={outY} x2={shellX - 5 * S} y2={outY + shellH + wallT} />
          </g>
          {dimText(shellX + shellW / 2, shellY - 6.2 * S, len20 ? "6.06 m" : "12.19 m")}
          {dimText(shellX - 6.2 * S, shellY + shellH / 2, "2.44 m", true)}

          {/* usable-area note under the entry side */}
          <text x={shellX + shellW / 2} y={shellY + shellH + 21.4 * S} textAnchor="middle" className="ld-note">
            ENTRY &amp; GLAZING SIDE
          </text>

          {/* scale bar */}
          <g pointerEvents="none">
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={`sb${i}`}
                x={shellX + i * 25} y={shellY + shellH + 24.2 * S}
                width={25} height={7}
                fill={i % 2 ? "var(--ld-floor)" : "var(--text-mid)"}
                stroke="var(--text-mid)" strokeWidth={1}
              />
            ))}
            <text x={shellX} y={shellY + shellH + 27.6 * S} className="ld-note" textAnchor="start">0</text>
            <text x={shellX + 100} y={shellY + shellH + 27.6 * S} className="ld-note" textAnchor="middle">1 m</text>
          </g>

          {/* title block */}
          <g pointerEvents="none">
            <line
              x1={shellX} y1={shellY + shellH + 29 * S}
              x2={shellX + shellW + wallT} y2={shellY + shellH + 29 * S}
              stroke="var(--line)" strokeWidth={1}
            />
            <text x={shellX} y={shellY + shellH + 31.4 * S} className="ld-title" textAnchor="start">
              ELITE MANUFACTURING GROUP
            </text>
            <text x={shellX + shellW / 2} y={shellY + shellH + 31.4 * S} className="ld-title" textAnchor="middle">
              {len20 ? "20FT" : "40FT"} · {items.length} FIXTURES
            </text>
            {/* kept short: at 20ft the three title texts share only 6m of width
               (mono at 11px with 0.14em tracking runs ~8.1 units per character) */}
            <text x={shellX + shellW + wallT} y={shellY + shellH + 31.4 * S} className="ld-title" textAnchor="end">
              NOT FOR CONSTRUCTION
            </text>
          </g>

          {/* alignment guides while dragging */}
          <g className="ld-guide" pointerEvents="none">
            {[...guideX].map((c) => (
              <line key={`vx${c}`} x1={OX + c * S} y1={OY - 2 * S} x2={OX + c * S} y2={OY + innerH * S + 2 * S} />
            ))}
            {[...guideY].map((c) => (
              <line key={`hy${c}`} x1={OX - 2 * S} y1={OY + c * S} x2={OX + innerW * S + 2 * S} y2={OY + c * S} />
            ))}
          </g>

          {items.map((it) => {
            const f = fixtureOf(it.type);
            const d = dimsC(it);
            const nw = cellsOf(f.w) * S, nh = cellsOf(f.h) * S;   // natural, unrotated
            const x = OX + it.cx * S, y = OY + it.cy * S;
            const bw = d.w * S, bh = d.h * S;
            /* draw the icon in its natural orientation, rotated about the box centre */
            const t = it.rot
              ? `translate(${x + bw / 2} ${y + bh / 2}) rotate(90) translate(${-nw / 2} ${-nh / 2})`
              : `translate(${x} ${y})`;
            const fs = Math.max(12, Math.min(14, nh * 0.3));
            const label = nw >= 100 ? f.name : f.short;
            const isSel = sel?.k === "i" && sel.id === it.id;
            const clash = crossing.has(it.id);
            return (
              <g
                key={it.id}
                className={`ld-item${isSel ? " sel" : ""}${dragSel?.k === "i" && dragSel.id === it.id ? " dragging" : ""}`}
                tabIndex={0}
                role="button"
                aria-label={`${f.name} at ${(it.cx * CELL).toFixed(2)} by ${(it.cy * CELL).toFixed(2)} metres${it.rot ? ", rotated" : ""}${clash ? ", sitting on a partition" : ""}`}
                onPointerDown={(e) => onItemDown(e, it)}
                onPointerMove={onDragMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onFocus={() => setSel({ k: "i", id: it.id })}
                onKeyDown={(e) => onItemKey(e, it)}
              >
                <title>{`${f.name}, ${f.w}m × ${f.h}m${clash ? " (sits on a partition)" : ""}`}</title>
                <rect
                  x={x} y={y} width={bw} height={bh} rx={4}
                  fill={CAT_COLOURS[f.cat]}
                  fillOpacity={0.95}
                  stroke={isSel ? "var(--accent)" : clash ? "var(--warn)" : "rgba(0,0,0,0.4)"}
                  strokeWidth={isSel ? 4 : clash ? 3 : 1.5}
                  strokeDasharray={!isSel && clash ? "8 5" : undefined}
                />
                <g transform={t} pointerEvents="none">
                  <FixtureIcon type={it.type} w={nw} h={nh} />
                  <text
                    x={nw / 2} y={nh * 0.9} textAnchor="middle"
                    className="ld-label" fontSize={fs}
                    stroke="rgba(255,255,255,0.8)" strokeWidth={fs * 0.32}
                    paintOrder="stroke" strokeLinejoin="round"
                  >
                    {label}
                  </text>
                </g>
                {isSel && (
                  <g className="ld-handles" pointerEvents="none">
                    {[[x, y, 1, 1], [x + bw, y, -1, 1], [x, y + bh, 1, -1], [x + bw, y + bh, -1, -1]].map(([hx, hy, sx, sy], i) => (
                      <path key={i} d={`M ${hx} ${hy + sy * 9} L ${hx} ${hy} L ${hx + sx * 9} ${hy}`} />
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          {/* internal partitions — drawn over the furniture so a clash is obvious */}
          {walls.map((w) => {
            const b = wallBox(w);
            const x = OX + b.cx * S, y = OY + b.cy * S;
            const bw = b.w * S, bh = b.h * S;
            const isSel = sel?.k === "w" && sel.id === w.id;
            const lenM = ((w.b - w.a) * CELL).toFixed(2);
            return (
              <g
                key={w.id}
                className={`ld-wall${isSel ? " sel" : ""}${dragSel?.k === "w" && dragSel.id === w.id ? " dragging" : ""}`}
                data-o={w.o}
                tabIndex={0}
                role="button"
                aria-label={`Partition ${w.o === "v" ? "across the width" : "along the length"} at ${(w.c * CELL).toFixed(2)} metres, ${lenM} metres long`}
                onPointerDown={(e) => onWallDown(e, w)}
                onPointerMove={onDragMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onFocus={() => setSel({ k: "w", id: w.id })}
                onKeyDown={(e) => onWallKey(e, w)}
              >
                <title>{`Partition, ${lenM}m long${(w.b - w.a) < (w.o === "v" ? innerH : innerW) ? " (leaves an opening)" : ""}`}</title>
                <rect x={x} y={y} width={bw} height={bh} fill={PARTITION_C} />
                <rect x={x} y={y} width={bw} height={bh} fill="url(#ldHatch)" opacity={0.3} />
                <rect x={x} y={y} width={bw} height={bh} fill="none" stroke="rgba(24,22,20,0.75)" strokeWidth={1.5} />
                {/* selection sits OUTSIDE the wall — at 0.1m thick an overlapping
                   stroke would cover the whole partition */}
                {isSel && (
                  <rect
                    x={x - 3.5} y={y - 3.5} width={bw + 7} height={bh + 7} rx={2}
                    fill="none" stroke="var(--accent)" strokeWidth={2.5}
                  />
                )}
                {isSel && (
                  <>
                    {(["a", "b"] as const).map((end) => {
                      const hx = w.o === "v" ? x + bw / 2 : end === "a" ? x : x + bw;
                      const hy = w.o === "v" ? (end === "a" ? y : y + bh) : y + bh / 2;
                      return (
                        <circle
                          key={end}
                          className="ld-endh"
                          cx={hx} cy={hy} r={8}
                          onPointerDown={(e) => onEndDown(e, w, end)}
                          onPointerMove={onDragMove}
                          onPointerUp={endDrag}
                          onPointerCancel={endDrag}
                          onLostPointerCapture={endDrag}
                        />
                      );
                    })}
                  </>
                )}
              </g>
            );
          })}

          {/* live measurement readout while dragging */}
          {(dragItem || dragWall) && (() => {
            let cx: number, cy: number, txt: string;
            if (dragItem) {
              const f = fixtureOf(dragItem.type);
              const d = dimsC(dragItem);
              cx = OX + (dragItem.cx + d.w / 2) * S;
              cy = dragItem.cy > 9 ? OY + dragItem.cy * S - 5.5 * S : OY + (dragItem.cy + d.h) * S + 8 * S;
              txt = `X ${(dragItem.cx * CELL).toFixed(2)}  ·  Y ${(dragItem.cy * CELL).toFixed(2)}  ·  ${f.w}×${f.h}m`;
            } else {
              const w = dragWall!;
              const b = wallBox(w);
              cx = OX + (b.cx + b.w / 2) * S;
              cy = b.cy > 9 ? OY + b.cy * S - 5.5 * S : OY + (b.cy + b.h) * S + 8 * S;
              txt = `PARTITION  ·  ${(w.c * CELL).toFixed(2)}m  ·  ${((w.b - w.a) * CELL).toFixed(2)}m long`;
            }
            return (
              <g className="ld-hud" pointerEvents="none">
                <rect x={cx - 130} y={cy - 20} width={260} height={26} rx={3} fill="#171715" opacity={0.94} />
                <text x={cx} y={cy - 2} textAnchor="middle" className="ld-hudtext">{txt}</text>
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="ld-palette" role="group" aria-label="Add fixtures and partitions">
        {CAT_ORDER.map((cat) => (
          <div className="ld-cat" key={cat}>
            <p className="ld-cat-lbl mono" style={{ ["--swatch" as string]: CAT_COLOURS[cat] }}>{CAT_LABELS[cat].toUpperCase()}</p>
            <div className="ld-cat-chips">
              {FIXTURES.filter((f) => f.cat === cat).map((f) => (
                <button
                  key={f.type}
                  className="ld-chip"
                  onClick={() => addFixture(f.type)}
                  style={{ color: CAT_COLOURS[cat] }}
                >
                  <FixtureGlyph type={f.type} />
                  <span className="ld-chip-txt">
                    {f.name}
                    <span className="dim mono">{f.w}×{f.h}m</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="ld-cat">
          <p className="ld-cat-lbl mono" style={{ ["--swatch" as string]: PARTITION_C }}>PARTITIONS</p>
          <div className="ld-cat-chips">
            <button className="ld-chip" onClick={() => addWall("v")} style={{ color: PARTITION_C }}>
              <svg className="ld-glyph" width={26} height={17} viewBox="0 0 26 17" aria-hidden="true">
                <rect x="11" y="1" width="4" height="15" rx="1" fill="currentColor" />
              </svg>
              <span className="ld-chip-txt">
                Wall across
                <span className="dim mono">SPLITS INTO ROOMS</span>
              </span>
            </button>
            <button className="ld-chip" onClick={() => addWall("h")} style={{ color: PARTITION_C }}>
              <svg className="ld-glyph" width={26} height={17} viewBox="0 0 26 17" aria-hidden="true">
                <rect x="1" y="7" width="24" height="4" rx="1" fill="currentColor" />
              </svg>
              <span className="ld-chip-txt">
                Wall along
                <span className="dim mono">MAKES A CORRIDOR</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      <p className="cfg-hint" style={{ marginTop: "0.6rem" }}>
        Tap a fixture to drop it in, then drag it into place. Everything snaps
        to a 5cm grid, nothing can overlap, and guides appear when edges line
        up. Add a partition to show us how you want the space divided: drag it
        along the container, then drag either round end handle to shorten it
        and leave a doorway. Keyboard works too: arrows move, Shift+arrows move
        faster, R rotates, Delete removes, Ctrl+Z undoes. The plan is
        indicative only (we&apos;ll confirm the buildable version with you)
        and it travels with your quote.
      </p>
    </div>
  );
}
