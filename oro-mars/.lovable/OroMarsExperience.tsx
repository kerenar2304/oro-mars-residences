import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

/** assets are served from the public GitHub repo via jsDelivr */
const CDN = "https://cdn.jsdelivr.net/gh/kerenar2304/oro-mars-residences@main/oro-mars/public";

/**
 * ORO — Mars Residences · scroll-driven image-sequence experience.
 *
 * Assets expected in `public/` :
 *   public/hero.png
 *   public/frames/seq02..seq10/0001.jpg …           (extracted at 16 fps, 1440px wide)
 *   public/fonts/Sansation-{Light,Regular,Bold}.ttf
 *
 * Add to index.css (Lovable design tokens, HSL):
 *   @font-face { font-family:'Sansation'; src:url('/fonts/Sansation-Light.ttf') format('truetype');   font-weight:300; font-display:swap; }
 *   @font-face { font-family:'Sansation'; src:url('/fonts/Sansation-Regular.ttf') format('truetype'); font-weight:400; font-display:swap; }
 *   @font-face { font-family:'Sansation'; src:url('/fonts/Sansation-Bold.ttf') format('truetype');    font-weight:700; font-display:swap; }
 *   @import url('https://fonts.googleapis.com/css2?family=Bruno+Ace&display=swap');
 *
 *   :root {
 *     --oro-ink:      12 39% 2%;      · #070503
 *     --oro-sand:     29 46% 88%;     · #EFE3D4
 *     --oro-terra:    21 51% 51%;     · #C4693F
 *     --oro-gold:     31 66% 67%;     · #E3B072
 *   }
 *
 * tailwind.config.ts → theme.extend:
 *   colors: {
 *     oro: {
 *       ink:   "hsl(var(--oro-ink))",
 *       sand:  "hsl(var(--oro-sand))",
 *       terra: "hsl(var(--oro-terra))",
 *       gold:  "hsl(var(--oro-gold))",
 *     },
 *   },
 *   fontFamily: {
 *     display: ["Bruno Ace", "Sansation", "sans-serif"],
 *     body:    ["Sansation", "system-ui", "sans-serif"],
 *   },
 *   keyframes: {
 *     "oro-drop": {
 *       "0%":   { transform: "scaleY(0)", transformOrigin: "top" },
 *       "45%":  { transform: "scaleY(1)", transformOrigin: "top" },
 *       "55%":  { transform: "scaleY(1)", transformOrigin: "bottom" },
 *       "100%": { transform: "scaleY(0)", transformOrigin: "bottom" },
 *     },
 *     "oro-pip": {
 *       "0%, 100%": { boxShadow: "0 0 0 4px hsl(var(--oro-gold)/.16), 0 0 14px hsl(var(--oro-gold)/.6)" },
 *       "50%":      { boxShadow: "0 0 0 9px hsl(var(--oro-gold)/.04), 0 0 22px hsl(var(--oro-gold)/.95)" },
 *     },
 *   },
 */

type Section = {
  key: string;
  n?: number;
  still?: string;
  vh: number;
  label: string;
  nav: string;
  /** small gold chapter line — omit for a frame with no copy at all */
  ch?: string;
  /** short caption — line 2 rendered dimmed */
  cap?: string;
  cap2?: string;
  /** tiny words that drift in over the frame as the section scrolls */
  words?: { t: [number, number]; x: string; y: string; text: string }[];
  /** play the sequence over the first slice of the section, then hold the frame */
  scrubTo?: number;
  /** pan the cover-crop toward this horizontal anchor (0 = left edge, .5 = centre) */
  panTo?: number;
  /**
   * Annotation callouts. `a` (anchor) and `l` (label) are normalised IMAGE
   * coordinates, so they stay pinned to the building through any cover-crop.
   */
  notes?: { t: number; a?: [number, number]; l: [number, number]; title: string }[];
  /** the closing slide: oversized copy + call to action */
  final?: boolean;
  /** label of the primary call-to-action button */
  cta?: string;
  loop?: boolean;
};

const SECTIONS: Section[] = [
  {
    key: "hero",
    still: `${CDN}/hero.png`,
    vh: 85,
    label: "Origin",
    nav: "Origin",
    ch: "Aurora Vallis",
    cap: "Good morning.",
    cap2: "You\u2019re not on Earth anymore.",
  },
  { key: "seq02", n: 97, vh: 170, label: "Arrival",   nav: "The Arrival",     ch: "01 · The Arrival",    cap: "Morning looks different here", cap2: "And this is only the view" },
  { key: "seq03", n: 97, vh: 170, label: "Threshold", nav: "The Threshold",   ch: "02 · The Threshold",   cap: "The view comes standard", cap2: "Floor to horizon windows.\nMars, uninterrupted." },
  {
    key: "seq04", n: 97, vh: 170, label: "Interiors", nav: "The Great Room",
    ch: "03 · The Great Room",
    cap: "Built for another planet,\nDesigned to feel like home.",
    words: [
      { t: [0.16, 0.4], x: "22%", y: "30%", text: "Warm stone" },
      { t: [0.32, 0.56], x: "70%", y: "22%", text: "Natural textures" },
      { t: [0.48, 0.72], x: "60%", y: "58%", text: "Quiet architecture" },
      { t: [0.62, 0.86], x: "30%", y: "66%", text: "Made for living" },
    ],
  },
  {
    key: "seq05", n: 97, vh: 170, label: "Promenade", nav: "The Promenade",
    ch: "04 · The Promenade",
    cap: "A residential landscape,\ndesigned for life on Mars.",
  },
  {
    key: "seq06", n: 97, vh: 280, label: "Systems", nav: "The Systems",
    ch: "05 · The Systems",
    cap: "The best technology is invisible",
    cap2: "Until you want to see it.",
    scrubTo: 0.55,
    panTo: 0.12,
    notes: [
      { t: 0.58, a: [0.091, 0.334], l: [0.15, 0.2], title: "Solar Energy Network" },
      { t: 0.66, a: [0.129, 0.478], l: [0.235, 0.47], title: "Closed Loop Air System" },
      { t: 0.74, a: [0.319, 0.488], l: [0.392, 0.598], title: "Biophilic Food Production" },
      { t: 0.82, a: [0.15, 0.593], l: [0.185, 0.7], title: "Water Recovery & Filtration" },
    ],
  },
  { key: "seq07", n: 65, vh: 115, label: "Residence", nav: "The Residence" },
  { key: "seq08", n: 97, vh: 170, label: "Community", nav: "The Community",   ch: "06 · The Community",  cap: "A village under a foreign sun." },
  { key: "seq09", n: 105, vh: 185, label: "Valley",    nav: "The Valley",      ch: "07 · The Valley", cap: "Yours to the horizon." },
  {
    key: "seq10", n: 97, vh: 175, label: "Reserve", nav: "Reserve",
    ch: "08 · The Reserve",
    cap: "Your next address is\nalready on the map",
    cap2: "ORO Mars Residences,\nNow all that’s missing is you.",
    final: true,
    cta: "Find Your Residence",
    loop: true,
  },
];

/**
 * Main navigation. Entries with `href` leave for their own page; entries with
 * `section` jump to that moment in this page's scroll.
 */
const MENU: { label: string; href?: string; section?: number }[] = [
  { label: "ORO", section: 0 },
  { label: "The Collection", href: "/collection" },
  { label: "Life on Mars", href: "/life" },
  { label: "Reserve Your View", section: 9 },
];

const frameSrc = (key: string, k: number) =>
  `${CDN}/frames/${key}/${String(k).padStart(4, "0")}.jpg`;

export default function OroMarsExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const blinkRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const blinking = useRef(false);
  const wordRefs = useRef<(HTMLSpanElement | null)[][]>(SECTIONS.map(() => []));
  const noteBoxRefs = useRef<(HTMLDivElement | null)[][]>(SECTIONS.map(() => []));
  const noteLineRefs = useRef<(SVGPolylineElement | null)[][]>(SECTIONS.map(() => []));
  const noteDotRefs = useRef<(SVGCircleElement | null)[][]>(SECTIONS.map(() => []));
  const noteTagRefs = useRef<(SVGTextElement | null)[][]>(SECTIONS.map(() => []));
  const notePillRefs = useRef<(SVGRectElement | null)[][]>(SECTIONS.map(() => []));
  const oroRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  const assets = useRef<(HTMLImageElement[] | null)[]>(SECTIONS.map(() => null));
  const bounds = useRef<[number, number][]>([]);
  const totalH = useRef(0);
  const lastPainted = useRef<HTMLImageElement | null>(null);
  const activeRef = useRef(-1);
  const loopIdx = useRef(0);
  const loopLast = useRef(0);
  const loadedCount = useRef(0);

  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [booted, setBooted] = useState(false);

  const bootTarget = useMemo(() => 1 + (SECTIONS[1].n ?? 1), []);

  /* ---------------- painting ---------------- */

  /* Horizontal anchor of the cover-crop. 0.5 centres; 0 hugs the left edge.
     On a wide viewport the frame barely overflows, so this does almost nothing —
     on a narrow one it is the difference between seeing the building and not. */
  const focusX = useRef(0.5);

  const focusFor = useCallback((i: number, t: number) => {
    const s = SECTIONS[i];
    if (s.panTo === undefined) return 0.5;
    const inEnd = s.scrubTo ?? 0.5;
    const outStart = 0.9;
    let k: number;
    if (t <= inEnd) k = t / inEnd;
    else if (t < outStart) k = 1;
    else k = Math.max(0, 1 - (t - outStart) / (1 - outStart));
    k = k * k * (3 - 2 * k); // smoothstep, so it drifts
    return 0.5 + (s.panTo - 0.5) * k;
  }, []);

  const paint = useCallback((img: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const use = img && img.naturalWidth ? img : lastPainted.current;
    if (!use || !use.naturalWidth) return;
    lastPainted.current = use;
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / use.naturalWidth, ch / use.naturalHeight);
    const w = use.naturalWidth * scale;
    const h = use.naturalHeight * scale;
    ctx.drawImage(use, (cw - w) * focusX.current, (ch - h) / 2, w, h);
  }, []);

  const pick = useCallback((i: number, t: number) => {
    const list = assets.current[i];
    if (!list || !list.length) return null;
    if (list.length === 1) return list[0];
    const k = Math.max(0, Math.min(list.length - 1, Math.round(t * (list.length - 1))));
    for (let j = k; j >= 0; j--) if (list[j]?.naturalWidth) return list[j];
    for (let j = k; j < list.length; j++) if (list[j]?.naturalWidth) return list[j];
    return null;
  }, []);

  /* the frames are driven by a smoothed scroll position rather than the raw one —
     this is what gives the sequence its weight instead of a 1:1 twitch */
  const sy = useRef(0);
  const snapScroll = useCallback(() => {
    sy.current = window.scrollY;
  }, []);

  const currentSection = useCallback((): [number, number] => {
    const y = sy.current;
    const b = bounds.current;
    for (let i = SECTIONS.length - 1; i >= 0; i--) {
      if (y >= b[i][0] - 1) {
        return [i, Math.max(0, Math.min(1, (y - b[i][0]) / b[i][1]))];
      }
    }
    return [0, 0];
  }, []);

  /* ---------------- loading ---------------- */
  const bump = useCallback(() => {
    loadedCount.current += 1;
    setProgress((p) => {
      const next = Math.min(100, Math.round((loadedCount.current / bootTarget) * 100));
      return next > p ? next : p;
    });
  }, [bootTarget]);

  const draw = useRef<(force?: boolean) => void>(() => {});

  const loadSection = useCallback(
    (i: number, onDone?: () => void) => {
      if (assets.current[i]) {
        onDone?.();
        return;
      }
      const s = SECTIONS[i];

      if (s.still) {
        const img = new Image();
        assets.current[i] = [img];
        img.onload = img.onerror = () => {
          bump();
          draw.current(true);
          onDone?.();
        };
        img.src = s.still;
        return;
      }

      const n = s.n ?? 0;
      const list: HTMLImageElement[] = new Array(n);
      assets.current[i] = list;
      let left = n;
      let next = 0;
      const CONC = 8;

      const fire = (k: number) => {
        const im = new Image();
        list[k] = im;
        im.onload = im.onerror = () => {
          bump();
          if (k < 2) draw.current(true);
          if (--left === 0) onDone?.();
          if (next < n) fire(next++);
        };
        im.src = frameSrc(s.key, k + 1);
      };
      for (let c = 0; c < CONC && next < n; c++) fire(next++);
    },
    [bump]
  );

  /* annotations live in IMAGE space, so they stay pinned to the building
     no matter how the cover-fit crops the frame at this viewport */
  const layoutNotes = useCallback((i: number, t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = lastPainted.current;
    const sw = canvas.clientWidth;
    const sh = canvas.clientHeight;
    const k = img?.naturalWidth ? Math.max(sw / img.naturalWidth, sh / img.naturalHeight) : 1;
    const dw = img?.naturalWidth ? img.naturalWidth * k : sw;
    const dh = img?.naturalHeight ? img.naturalHeight * k : sh;
    const ox = (sw - dw) * focusX.current;
    const oy = (sh - dh) / 2;
    const narrow = sw < 820;
    const LEG_X = 16;
    const LEG_ROW = 38;

    SECTIONS.forEach((sec, si) => {
      if (!sec.notes) return;
      // rows are centred on their y, so add half a row to clear the header properly
      const firstBox = noteBoxRefs.current[si]?.[0];
      const boxH = firstBox ? firstBox.offsetHeight : 30;
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 88;
      const LEG_TOP = headerBottom + 22 + boxH / 2;

      sec.notes.forEach((def, nj) => {
        const box = noteBoxRefs.current[si]?.[nj];
        const line = noteLineRefs.current[si]?.[nj];
        const dot = noteDotRefs.current[si]?.[nj];
        const tag = noteTagRefs.current[si]?.[nj];
        const pill = notePillRefs.current[si]?.[nj];
        if (!box) return;

        let o = 0;
        if (si === i && t > def.t) {
          o = Math.min((t - def.t) / 0.05, t > 0.95 ? Math.max(0, 1 - (t - 0.95) / 0.04) : 1);
          o = Math.max(0, Math.min(1, o));
        }
        box.style.opacity = String(o);
        if (line) line.style.opacity = String(o);
        if (dot) dot.style.opacity = String(o);
        if (o <= 0.01) return;

        const ax = def.a ? ox + def.a[0] * dw : 0;
        const ay = def.a ? oy + def.a[1] * dh : 0;

        if (narrow) {
          /* A phone has no room for a label beside the building. The markers stay
             on the systems and carry a number; the labels become a legend. */
          box.style.left = `${LEG_X}px`;
          box.style.top = `${LEG_TOP + nj * LEG_ROW}px`;
          if (line) line.style.opacity = "0";
          if (def.a && dot && tag && pill) {
            dot.setAttribute("cx", String(ax));
            dot.setAttribute("cy", String(ay));
            pill.setAttribute("x", String(ax + 10));
            pill.setAttribute("y", String(ay - 9));
            tag.setAttribute("x", String(ax + 24));
            tag.setAttribute("y", String(ay + 3.5));
            pill.style.opacity = String(o);
            tag.style.opacity = String(o);
          }
          return;
        }

        if (tag) tag.style.opacity = "0";
        if (pill) pill.style.opacity = "0";
        const bw = box.offsetWidth;
        const lx = Math.max(12, Math.min(ox + def.l[0] * dw, sw - bw - 12));
        const ly = oy + def.l[1] * dh;
        box.style.left = `${lx}px`;
        box.style.top = `${ly}px`;
        if (!def.a || !line || !dot) return;

        dot.setAttribute("cx", String(ax));
        dot.setAttribute("cy", String(ay));
        // the leader leaves from whichever edge of the label faces the anchor
        const right = ax > lx + bw / 2;
        const attach = right ? lx + bw + 8 : lx - 8;
        const elbow = right ? lx + bw + 24 : lx - 24;
        line.setAttribute("points", `${attach},${ly} ${elbow},${ly} ${ax},${ay}`);
      });
    });
  }, []);

  /* lock "MARS RESIDENCES" to the exact width of "ORO" */
  const fitLockup = useCallback(() => {
    const oro = oroRef.current;
    const sub = subRef.current;
    if (!oro || !sub) return;
    sub.style.transform = "none";
    const a = oro.getBoundingClientRect().width;
    const b = sub.getBoundingClientRect().width;
    if (a > 0 && b > 0) sub.style.transform = `scaleX(${a / b})`;
  }, []);

  /* ---------------- geometry ---------------- */
  const layout = useCallback(() => {
    const vh = window.innerHeight;
    let y = 0;
    bounds.current = SECTIONS.map((s) => {
      const len = (s.vh / 100) * vh;
      const b: [number, number] = [y, len];
      y += len;
      return b;
    });
    totalH.current = y;
    if (spacerRef.current) spacerRef.current.style.height = `${Math.round(y)}px`;

    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(vh * dpr);
    }
    fitLockup();
    snapScroll();
    draw.current(true);
  }, [fitLockup, snapScroll]);

  const goTo = useCallback(
    (i: number) => {
      const b = bounds.current[i];
      if (!b) return;
      const target = Math.min(b[0] + (i === 0 ? 0 : b[1] * 0.42), totalH.current - 1);

      // neighbouring chapters scroll; anything further cuts across with a blink,
      // so you never watch the frames in between flick past
      if (Math.abs(i - activeRef.current) <= 1) {
        window.scrollTo({ top: target, behavior: "smooth" });
        return;
      }
      if (blinking.current) return;
      blinking.current = true;

      loadSection(i);
      if (blinkRef.current) blinkRef.current.style.opacity = "1";
      window.setTimeout(() => {
        window.scrollTo(0, target);
        snapScroll();
        draw.current(true);
        window.setTimeout(() => {
          // let the new frame decode behind the black
          draw.current(true);
          if (blinkRef.current) blinkRef.current.style.opacity = "0";
          blinking.current = false;
        }, 300);
      }, 260);
    },
    [loadSection, snapScroll]
  );

  /* ---------------- main effect ---------------- */
  useEffect(() => {
    draw.current = (force?: boolean) => {
      const [i, t] = currentSection();
      focusX.current = focusFor(i, t);

      if (SECTIONS[i].loop) {
        const len = assets.current[i]?.length ?? 1;
        paint(pick(i, loopIdx.current / Math.max(1, len - 1)));
      } else {
        const scrubTo = SECTIONS[i].scrubTo;
        paint(pick(i, scrubTo ? Math.min(1, t / scrubTo) : t));
      }

      layoutNotes(i, t);

      slideRefs.current.forEach((el, s) => {
        if (!el) return;
        let o = 0;
        if (s === i) {
          if (s === 0) {
            // nothing on the very first frame — the line arrives after a small scroll
            o = t < 0.05 ? 0 : t < 0.15 ? (t - 0.05) / 0.1 : t > 0.72 ? Math.max(0, 1 - (t - 0.72) / 0.18) : 1;
          } else if (SECTIONS[s].loop || SECTIONS[s].notes) {
            o = t < 0.12 ? t / 0.12 : 1;
          } else {
            o = t < 0.12 ? t / 0.12 : t > 0.78 ? Math.max(0, 1 - (t - 0.78) / 0.18) : 1;
          }
        }
        el.style.opacity = String(o);
        el.style.visibility = o > 0.02 ? "visible" : "hidden";
        // the children stagger themselves in off this flag — see group-data-[in=1] below
        el.dataset.in = o > 0.35 ? "1" : "0";
      });

      SECTIONS.forEach((sec, si) => {
        if (!sec.words) return;
        sec.words.forEach((w, wj) => {
          const el = wordRefs.current[si]?.[wj];
          if (!el) return;
          let o = 0;
          if (si === i) {
            const [a, b] = w.t;
            const f = 0.07;
            if (t > a && t < b) o = Math.min(1, Math.min((t - a) / f, (b - t) / f));
          }
          el.style.opacity = String(o);
          el.style.transform = `translateY(${(1 - o) * 10}px) scale(${0.94 + 0.06 * o})`;
        });
      });

      if (cueRef.current) cueRef.current.style.opacity = i === 0 && t < 0.05 ? "1" : "0";
      if (washRef.current)
        washRef.current.style.opacity = SECTIONS[i].final ? String(t < 0.12 ? t / 0.12 : 1) : "0";
      if (railRef.current) {
        const p = Math.max(0, Math.min(1, sy.current / Math.max(1, totalH.current - window.innerHeight)));
        railRef.current.style.transform = `scaleY(${p})`;
      }
      if (hudRef.current) hudRef.current.style.opacity = i === 0 ? "1" : "0";

      if (i !== activeRef.current || force) {
        activeRef.current = i;
        setActive(i);
        if (i + 1 < SECTIONS.length && !assets.current[i + 1]) loadSection(i + 1);
      }
    };

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    layout();
    window.scrollTo(0, 0);
    snapScroll();
    document.fonts?.ready.then(fitLockup);
    const fitT1 = window.setTimeout(fitLockup, 400);
    const fitT2 = window.setTimeout(fitLockup, 1600);

    let bootLeft = 2;
    let bootDone = false;
    const finishBoot = () => {
      if (bootDone) return;
      bootDone = true;
      setProgress(100);
      setBooted(true);
      let i = 2;
      const chain = () => {
        if (i >= SECTIONS.length) return;
        loadSection(i++, chain);
      };
      chain();
    };
    const guard = window.setTimeout(finishBoot, 9000);
    loadSection(0, () => --bootLeft === 0 && finishBoot());
    loadSection(1, () => --bootLeft === 0 && finishBoot());

    const onScroll = () => {};
    const onResize = () => layout();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(Math.min(SECTIONS.length - 1, activeRef.current + 1));
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(Math.max(0, activeRef.current - 1));
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);

    // the closing sequence keeps playing, forever
    // one loop drives everything: eased scroll, the closing sequence, the rail
    let loopRaf = 0;
    const tick = (now: number) => {
      const target = window.scrollY;
      const d = target - sy.current;
      if (Math.abs(d) > 0.35) {
        sy.current += d * 0.135;
        draw.current(false);
      } else if (sy.current !== target) {
        sy.current = target;
        draw.current(false);
      }

      const i = activeRef.current;
      const list = assets.current[i];
      if (i >= 0 && SECTIONS[i]?.loop && list?.length && now - loopLast.current > 62) {
        loopLast.current = now;
        loopIdx.current = (loopIdx.current + 1) % list.length;
        paint(pick(i, loopIdx.current / Math.max(1, list.length - 1)));
      }
      loopRaf = requestAnimationFrame(tick);
    };
    loopRaf = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(guard);
      window.clearTimeout(fitT1);
      window.clearTimeout(fitT2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(loopRaf);
    };
  }, [currentSection, fitLockup, focusFor, goTo, layout, layoutNotes, loadSection, paint, pick, snapScroll]);

  /* ---------------- render ---------------- */
  return (
    <div className="relative w-full bg-oro-ink font-body font-light text-oro-sand antialiased">
      {/* stage — fixed, full viewport, image never distorts (canvas cover-fits) */}
      <div className="fixed inset-0 z-[1] overflow-hidden bg-oro-ink">
        <canvas ref={canvasRef} className="block h-full w-full" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 40%, transparent 40%, hsl(var(--oro-ink)/.55) 100%), linear-gradient(180deg, hsl(var(--oro-ink)/.78) 0%, transparent 26%, transparent 60%, hsl(var(--oro-ink)/.86) 100%)",
          }}
        />
      </div>

      {/* a whisper of film grain — it keeps the compressed frames from looking flat */}
      <div
        aria-hidden
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")",
          backgroundSize: "160px 160px",
          mixBlendMode: "overlay",
        }}
        className="pointer-events-none fixed inset-0 z-[12] opacity-[.05]"
      />

      {/* header */}
      <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-5 py-4 md:px-12 md:py-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-start gap-[0.42em] text-left leading-none"
          aria-label="ORO — top"
        >
          <span ref={oroRef} className="block font-display text-2xl tracking-[0.02em] md:text-[38px]">
            ORO
          </span>
          {/* scaled by fitLockup() to match the width of ORO exactly */}
          <span
            ref={subRef}
            className="block origin-left whitespace-nowrap text-[8px] tracking-[0.12em] text-oro-sand/60 md:text-[11px]"
          >
            MARS RESIDENCES
          </span>
        </button>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Menu"
          className="grid h-11 w-11 place-content-center text-oro-sand transition-opacity hover:opacity-70"
        >
          {menuOpen ? <X strokeWidth={1} className="h-6 w-6" /> : <Menu strokeWidth={1} className="h-6 w-6" />}
        </button>
      </header>

      {/* progress dots */}
      <div className="fixed right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-3 md:right-8 md:gap-5">
        {/* a hairline rail behind the dots that fills with overall progress */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-4 -top-4 right-[3px] w-px bg-oro-sand/[.14]"
        />
        <span
          ref={railRef}
          aria-hidden
          style={{ transform: "scaleY(0)" }}
          className="pointer-events-none absolute -top-4 right-[3px] h-[calc(100%+32px)] w-px origin-top bg-gradient-to-b from-oro-gold to-oro-gold/35"
        />
        {SECTIONS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => goTo(i)}
            aria-label={s.nav}
            aria-current={active === i}
            className="group flex items-center gap-2.5"
          >
            <span
              className={`hidden text-[9px] uppercase tracking-[0.28em] transition-all duration-300 md:block ${
                active === i
                  ? "translate-x-0 text-oro-sand opacity-100"
                  : "translate-x-1.5 text-oro-sand/60 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block h-[7px] w-[7px] rounded-full border transition-all duration-500 ${
                active === i
                  ? "scale-150 border-oro-gold bg-oro-gold"
                  : "border-oro-sand/45 bg-transparent"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Soft black wash behind the closing copy. It lives OUTSIDE the slide on
          purpose: draw() puts a transform on the slide, which would make it the
          containing block for any position:fixed child and clip this to its box. */}
      <div
        ref={washRef}
        aria-hidden
        style={{
          opacity: 0,
          // long multi-stop ramps — a short falloff bands into a visible contour line
          background: [
            "linear-gradient(to right, rgba(7,5,3,.50) 0%, rgba(7,5,3,.43) 13%, rgba(7,5,3,.35) 26%, rgba(7,5,3,.26) 39%, rgba(7,5,3,.18) 52%, rgba(7,5,3,.11) 65%, rgba(7,5,3,.05) 78%, rgba(7,5,3,.015) 90%, rgba(7,5,3,0) 100%)",
            "linear-gradient(to top, rgba(7,5,3,.80) 0%, rgba(7,5,3,.73) 8%, rgba(7,5,3,.65) 16%, rgba(7,5,3,.56) 24%, rgba(7,5,3,.47) 32%, rgba(7,5,3,.38) 40%, rgba(7,5,3,.30) 48%, rgba(7,5,3,.22) 56%, rgba(7,5,3,.16) 64%, rgba(7,5,3,.10) 72%, rgba(7,5,3,.06) 80%, rgba(7,5,3,.03) 88%, rgba(7,5,3,.01) 94%, rgba(7,5,3,0) 100%)",
          ].join(", "),
        }}
        className="pointer-events-none fixed inset-0 z-[15] transition-opacity duration-500"
      />

      {/* system annotations — leader lines + spec callouts */}
      <div className="pointer-events-none fixed inset-0 z-20">
        <svg className="absolute inset-0 h-full w-full overflow-visible">
          {/* the same warm glass as the closing CTA, so the markers belong to the set */}
          <defs>
            <linearGradient id="oroGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(150,72,42)" stopOpacity={0.78} />
              <stop offset="100%" stopColor="rgb(96,44,26)" stopOpacity={0.66} />
            </linearGradient>
          </defs>
          {SECTIONS.map((s, si) =>
            s.notes?.map((n, nj) =>
              n.a ? (
                <g key={`lead-${s.key}-${nj}`}>
                  <polyline
                    ref={(el) => {
                      if (!noteLineRefs.current[si]) noteLineRefs.current[si] = [];
                      noteLineRefs.current[si][nj] = el;
                    }}
                    fill="none"
                    stroke="hsl(var(--oro-sand)/.8)"
                    strokeWidth={1}
                    style={{ opacity: 0 }}
                  />
                  <circle
                    ref={(el) => {
                      if (!noteDotRefs.current[si]) noteDotRefs.current[si] = [];
                      noteDotRefs.current[si][nj] = el;
                    }}
                    r={2.5}
                    fill="hsl(var(--oro-gold))"
                    style={{ opacity: 0 }}
                  />
                  {/* the number that pairs a marker on the building with its legend
                      row, on a glass pill so it holds against a bright frame */}
                  <rect
                    ref={(el) => {
                      if (!notePillRefs.current[si]) notePillRefs.current[si] = [];
                      notePillRefs.current[si][nj] = el;
                    }}
                    rx={9}
                    ry={9}
                    width={30}
                    height={18}
                    fill="url(#oroGlass)"
                    stroke="hsl(var(--oro-gold)/.46)"
                    strokeWidth={1}
                    style={{ opacity: 0 }}
                  />
                  <text
                    textAnchor="middle"
                    ref={(el) => {
                      if (!noteTagRefs.current[si]) noteTagRefs.current[si] = [];
                      noteTagRefs.current[si][nj] = el;
                    }}
                    fill="hsl(var(--oro-sand)/.94)"
                    style={{
                      opacity: 0,
                      // the site's own numeral idiom: light, wide-tracked
                      font: "300 9px/1 Sansation, system-ui, sans-serif",
                      letterSpacing: ".3em",
                    }}
                  >
                    {String(nj + 1).padStart(2, "0")}
                  </text>
                </g>
              ) : null
            )
          )}
        </svg>

        {SECTIONS.map((s, si) =>
          s.notes?.map((n, nj) => (
            <div
              key={`note-${s.key}-${nj}`}
              ref={(el) => {
                if (!noteBoxRefs.current[si]) noteBoxRefs.current[si] = [];
                noteBoxRefs.current[si][nj] = el;
              }}
              style={{ opacity: 0, willChange: "opacity" }}
              className="absolute -translate-y-1/2"
            >
              <span
                style={{
                  background: "hsl(var(--oro-ink)/.55)",
                  backdropFilter: "blur(12px) saturate(1.15)",
                  boxShadow: "0 10px 34px hsl(var(--oro-ink)/.55), inset 0 1px 0 hsl(var(--oro-sand)/.07)",
                }}
                className="inline-flex items-center gap-[9px] whitespace-nowrap rounded-full border border-oro-sand/[.26] py-2 pl-[11px] pr-[14px] text-[11px] font-normal tracking-[0.02em] text-oro-sand min-[821px]:gap-3 min-[821px]:py-[11px] min-[821px]:pl-[17px] min-[821px]:pr-[21px] min-[821px]:text-[clamp(11.5px,0.92vw,13.5px)] min-[821px]:tracking-[0.05em]"
              >
                <i className="block h-[5px] w-[5px] shrink-0 animate-[oro-pip_2.6s_ease-in-out_infinite] rounded-full bg-oro-gold" />
                {/* the legend layout needs the number; the anchored layout does not */}
                <b className="mr-[11px] hidden text-[9px] font-light tracking-[0.3em] text-oro-sand/35 max-[820px]:inline">
                  {String(nj + 1).padStart(2, "0")}
                </b>
                {n.title}
              </span>
            </div>
          ))
        )}
      </div>

      {/* tiny words drifting over the frame */}
      <div className="pointer-events-none fixed inset-0 z-20">
        {SECTIONS.map((s, si) =>
          s.words?.map((w, wj) => (
            <div
              key={`${s.key}-${wj}`}
              style={{ left: w.x, top: w.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span
                ref={(el) => {
                  if (!wordRefs.current[si]) wordRefs.current[si] = [];
                  wordRefs.current[si][wj] = el;
                }}
                style={{
                  opacity: 0,
                  transform: "translateY(10px) scale(.94)",
                  willChange: "opacity, transform",
                  background: "hsl(var(--oro-ink)/.42)",
                  backdropFilter: "blur(12px) saturate(1.15)",
                  boxShadow: "0 10px 34px hsl(var(--oro-ink)/.55), inset 0 1px 0 hsl(var(--oro-sand)/.07)",
                }}
                className="inline-flex items-center gap-[11px] whitespace-nowrap rounded-full border border-oro-sand/20 py-2.5 pl-[15px] pr-[18px] text-[10px] uppercase tracking-[0.28em] text-oro-sand"
              >
                <i className="block h-[5px] w-[5px] animate-[oro-pip_2.6s_ease-in-out_infinite] rounded-full bg-oro-gold" />
                {w.text}
              </span>
            </div>
          ))
        )}
      </div>

      {/* left rail copy — small, at the side */}
      <div className="pointer-events-none fixed inset-0 z-20">
        {SECTIONS.map((s, i) => (
          <article
            key={s.key}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            data-in="0"
            style={{ opacity: 0, visibility: "hidden" }}
            className={`group absolute inset-x-0 px-5 md:px-12 ${
              s.final
                ? "bottom-[clamp(80px,12vh,132px)] flex flex-col items-start gap-[22px] md:flex-row md:items-end md:justify-between md:gap-[clamp(24px,5vw,90px)]"
                : "bottom-[clamp(84px,13vh,120px)] md:bottom-[clamp(74px,10.5vh,116px)]"
            }`}
          >
            <div>
              {s.ch && (
                <p
                  className={`relative mb-4 translate-y-4 pl-[34px] text-[9px] uppercase text-oro-gold opacity-0 transition-[opacity,transform] delay-[40ms] duration-[850ms] ease-out before:absolute before:left-0 before:top-1/2 before:h-px before:w-6 before:origin-left before:scale-x-0 before:bg-oro-gold before:transition-transform before:delay-100 before:duration-1000 group-data-[in=1]:translate-y-0 group-data-[in=1]:opacity-100 group-data-[in=1]:before:scale-x-100 ${
                    s.final ? "tracking-[0.44em]" : "tracking-[0.4em]"
                  }`}
                >
                  {s.ch}
                </p>
              )}
              {s.cap && (
                <p
                  className={`translate-y-4 whitespace-pre-line font-display leading-snug opacity-0 transition-[opacity,transform] delay-[140ms] duration-[950ms] ease-out group-data-[in=1]:translate-y-0 group-data-[in=1]:opacity-100 ${
                    s.final
                      ? "max-w-[18ch] text-[clamp(26px,3.4vw,52px)] leading-[1.08] tracking-normal"
                      : i === 0
                        ? "max-w-[34ch] text-[clamp(19px,2vw,29px)] leading-[1.3]"
                        : "max-w-[34ch] text-[clamp(16px,1.35vw,21px)]"
                  }`}
                >
                  {s.cap}
                  {s.cap2 && (
                    <span
                      className={`block whitespace-pre-line ${
                        s.final
                          ? "mt-[1.15em] max-w-[42ch] font-body text-[clamp(15px,1.15vw,19px)] font-light leading-[1.6] text-oro-sand/[.78]"
                          : i === 0
                            ? "text-oro-sand/60"
                            : // one type scale for every chapter between the first and last frame
                              "mt-[.55em] font-body text-[clamp(12.5px,1.02vw,16px)] leading-[1.5] text-oro-sand/60"
                      }`}
                    >
                      {s.cap2}
                    </span>
                  )}
                </p>
              )}
            </div>

            {s.cta && (
              <div className="pointer-events-auto shrink-0 translate-y-4 opacity-0 transition-[opacity,transform] delay-[280ms] duration-[950ms] ease-out group-data-[in=1]:translate-y-0 group-data-[in=1]:opacity-100 md:mb-[.4em]">
                <a
                  href="mailto:residences@oro.mars?subject=ORO%20Mars%20Residences%20—%20Private%20Consultation"
                  style={{
                    // no backdropFilter here — the closing sequence repaints the canvas
                    // 16x/sec and re-sampling the backdrop each time makes the button strobe
                    background: "linear-gradient(180deg, rgba(150,72,42,.62) 0%, rgba(96,44,26,.5) 100%)",
                    boxShadow: "0 12px 38px hsl(var(--oro-ink)/.45), inset 0 1px 0 hsl(var(--oro-sand)/.2)",
                  }}
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-oro-gold/[.46] px-[34px] py-[17px] text-[11px] uppercase tracking-[0.24em] text-oro-sand transition-all duration-300 hover:-translate-y-0.5 hover:border-oro-gold/80 hover:bg-[linear-gradient(180deg,rgba(203,142,84,.78)_0%,rgba(150,72,42,.66)_100%)]"
                >
                  {s.cta}
                </a>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* HUD */}
      <div
        ref={hudRef}
        className="pointer-events-none fixed bottom-6 left-5 z-30 flex flex-col gap-1.5 text-[9px] uppercase tracking-[0.34em] text-oro-sand/40 transition-opacity duration-500 md:bottom-10 md:left-12"
      >
        <b className="font-light tracking-[0.3em] text-oro-sand">AM 05:47</b>
        <span>ORO, Mars</span>
      </div>

      {/* scroll cue */}
      <div
        ref={cueRef}
        className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 transition-opacity duration-500 md:bottom-10"
      >
        <span className="block h-[46px] w-px animate-[oro-drop_2.4s_ease-in-out_infinite] bg-gradient-to-b from-oro-gold to-transparent" />
      </div>

      {/* menu */}
      <div
        className={`fixed inset-0 z-50 grid content-center px-6 py-24 backdrop-blur-2xl transition-all duration-500 md:px-[7vw] ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: "hsl(var(--oro-ink)/.92)" }}
      >
        <nav className="flex flex-col">
          {MENU.map((m, mi) => {
            const inner = (
              <>
                <span className="font-body text-[10px] font-light tracking-[0.3em] text-oro-sand/35">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <span>{m.label}</span>
              </>
            );
            const cls =
              "flex items-baseline gap-4 border-b border-oro-sand/10 py-3 text-left font-display text-xl leading-tight text-oro-sand opacity-55 transition-all duration-300 hover:pl-3.5 hover:text-oro-gold hover:opacity-100 md:gap-8 md:text-[44px]";

            return m.href ? (
              <a key={m.label} href={m.href} className={cls}>
                {inner}
              </a>
            ) : (
              <button
                key={m.label}
                onClick={() => {
                  setMenuOpen(false);
                  goTo(m.section ?? 0);
                }}
                className={cls}
              >
                {inner}
              </button>
            );
          })}
        </nav>
        <div className="mt-8 flex flex-wrap gap-6 text-[11px] tracking-[0.16em] text-oro-sand/60 md:mt-14 md:gap-16">
          <span>Sales Gallery · Aurora Vallis</span>
          <span>residences@oro.mars</span>
          <span>Launch Window 2041</span>
        </div>
      </div>

      {/* scroll driver */}
      <div ref={spacerRef} className="relative z-0 w-full" />

      {/* shutter for jumps between non-adjacent frames */}
      <div
        ref={blinkRef}
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-[70] bg-oro-ink transition-opacity duration-[260ms] ease-out"
      />

      {/* loader */}
      <div
        className={`fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-oro-ink transition-all duration-700 ${
          booted ? "invisible opacity-0" : "visible opacity-100"
        }`}
      >
        <div className="font-display text-3xl tracking-[0.04em] md:text-[52px]">ORO</div>
        <div className="h-px w-[min(220px,42vw)] overflow-hidden bg-oro-sand/15">
          <span
            className="block h-full bg-oro-gold transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[9px] tracking-[0.4em] text-oro-sand/60">
          PREPARING DESCENT · {progress}%
        </div>
      </div>
    </div>
  );
}
