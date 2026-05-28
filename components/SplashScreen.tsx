'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── E8 Root System ─────────────────────────────────────────────────────────
// 2D Coxeter-plane projection approximation (8 concentric rings, ~280 edges).
// Each ring gets its own hue band so the lattice reads as a colored mandala
// rather than a flat green graph.
const RINGS = [
  { n: 8,  r: 0.08, phi: 0,             hue: 348 }, // deep crimson core
  { n: 16, r: 0.21, phi: Math.PI / 16,  hue:  18 }, // ember orange
  { n: 16, r: 0.33, phi: 0,             hue:  42 }, // amber
  { n: 24, r: 0.46, phi: Math.PI / 24,  hue:  68 }, // chartreuse
  { n: 24, r: 0.57, phi: 0,             hue: 110 }, // lime green
  { n: 16, r: 0.69, phi: Math.PI / 16,  hue: 145 }, // VS green band
  { n: 24, r: 0.81, phi: Math.PI / 24,  hue: 175 }, // teal
  { n: 8,  r: 0.93, phi: 0,             hue: 200 }, // electric cyan rim
];
const NODE_CH = ['◆', '◇', '●', '○', '◈', '✦', '✧', '◉'];

function buildE8() {
  type N = [number, number, number]; // x, y, ring index
  const nodes: N[] = [];
  const edges: [number, number, number][] = []; // a, b, kind (0=ring, 1=spoke, 2=chord)
  const starts: number[] = [];

  RINGS.forEach(({ n, r, phi }, ri) => {
    starts.push(nodes.length);
    for (let i = 0; i < n; i++) {
      const a = phi + (i / n) * Math.PI * 2;
      nodes.push([Math.cos(a) * r, Math.sin(a) * r, ri]);
    }
  });
  // Ring edges
  RINGS.forEach(({ n }, ri) => {
    const s = starts[ri];
    for (let i = 0; i < n; i++) edges.push([s + i, s + (i + 1) % n, 0]);
  });
  // Spoke edges (nearest neighbors between adjacent rings)
  for (let ri = 0; ri < RINGS.length - 1; ri++) {
    const sA = starts[ri], nA = RINGS[ri].n;
    const sB = starts[ri + 1], nB = RINGS[ri + 1].n;
    for (let i = 0; i < nA; i++) {
      const [ax, ay] = nodes[sA + i];
      const d = Array.from({ length: nB }, (_, j) => {
        const [bx, by] = nodes[sB + j];
        return { j, d: Math.hypot(ax - bx, ay - by) };
      }).sort((a, b) => a.d - b.d);
      edges.push([sA + i, sB + d[0].j, 1]);
      if (d[1]?.d < d[0].d * 1.28) edges.push([sA + i, sB + d[1].j, 1]);
    }
  }
  // Chord edges — extra cross-links between rings 2-apart for density
  for (let ri = 0; ri < RINGS.length - 2; ri += 2) {
    const sA = starts[ri], nA = RINGS[ri].n;
    const sB = starts[ri + 2], nB = RINGS[ri + 2].n;
    for (let i = 0; i < nA; i += 2) {
      const [ax, ay] = nodes[sA + i];
      let bestJ = 0, bestD = Infinity;
      for (let j = 0; j < nB; j++) {
        const [bx, by] = nodes[sB + j];
        const d = Math.hypot(ax - bx, ay - by);
        if (d < bestD) { bestD = d; bestJ = j; }
      }
      edges.push([sA + i, sB + bestJ, 2]);
    }
  }
  return { nodes, edges };
}

const E8 = buildE8();

// Brand palette — used in particle explosion
const PC: [number, number, number][] = [
  [255, 26, 26],   // crimson
  [255, 102, 51],  // ember
  [255, 200, 80],  // amber
  [110, 201, 96],  // VS green light
  [74, 124, 63],   // VS green
  [80, 220, 200],  // teal
  [232, 220, 200], // bone
  [255, 255, 255], // white
];

// ─── Boot data ──────────────────────────────────────────────────────────────
type BootLine = { t: string; c: string; tag?: string };
const BOOT: BootLine[] = [
  { t: 'VAMPIRE_SEX_OS v2.71 — kernel loaded',           c: '#6EC960', tag: 'OK'   },
  { t: 'mounting /dev/bloodline → ring0',                 c: '#6EC960', tag: 'OK'   },
  { t: 'loading E8 root system (240 roots)',              c: '#FFC850', tag: 'INIT' },
  { t: 'projecting 8D → coxeter plane (h=30)',            c: '#FFC850', tag: 'INIT' },
  { t: 'calibrating symmetry group W(E8)',                c: '#6EC960', tag: 'OK'   },
  { t: 'order |W| = 696,729,600',                          c: '#80DCC8', tag: '∴'    },
  { t: 'patching reflection generators α₁..α₈',           c: '#6EC960', tag: 'OK'   },
];

const STATS: [string, string, string][] = [
  ['STREAMS',          '2.9M',      '#FFC850'],
  ['VIDEO VIEWS',      '10.2M',     '#F2EDE4'],
  ['SHAZAMS',          '32.8K',     '#FFC850'],
  ['DJ SUPPORTS',      '306',       '#F2EDE4'],
  ['CHART PLACEMENTS', '47',        '#FFC850'],
  ['ADE 2025',         'CONFIRMED', '#6EC960'],
];

// Random root vectors for the right-side telemetry feed.
// These are real E8 root coordinate templates: (±1, ±1, 0…) and (±½)⁸ even-sum.
const ROOT_VECS = [
  '( +1, -1,  0,  0,  0,  0,  0,  0 )',
  '(  0, +1, -1,  0,  0,  0,  0,  0 )',
  '(  0,  0, +1, -1,  0,  0,  0,  0 )',
  '(  0,  0,  0, +1, -1,  0,  0,  0 )',
  '( +½, -½, +½, -½, +½, -½, +½, -½ )',
  '( -½, +½, +½, -½, +½, +½, -½, -½ )',
  '( +1, +1,  0,  0,  0,  0,  0,  0 )',
  '(  0,  0,  0,  0, +1, +1,  0,  0 )',
  '( +½, +½, +½, +½, -½, -½, -½, -½ )',
  '(  0,  0,  0,  0,  0,  0, +1, -1 )',
  '( +½, +½, -½, -½, +½, +½, -½, -½ )',
  '( -1,  0,  0, +1,  0,  0,  0,  0 )',
];

const HEX = '0123456789ABCDEF';
const randHex = (n: number) =>
  Array.from({ length: n }, () => HEX[Math.floor(Math.random() * 16)]).join('');

type SplashAudioWindow = Window & {
  __vampireSexAudioContext?: AudioContext;
};

type SplashAmbientAudio = {
  stop: () => void;
};

function primeAudioContext() {
  if (typeof window === 'undefined') return;

  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  const current = (window as SplashAudioWindow).__vampireSexAudioContext;
  const ctx = current ?? new AudioContextCtor();
  (window as SplashAudioWindow).__vampireSexAudioContext = ctx;

  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }
}

function playKeyboardStroke() {
  if (typeof window === 'undefined') return;

  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  const audioWindow = window as SplashAudioWindow;
  const ctx = audioWindow.__vampireSexAudioContext;
  if (!ctx || ctx.state === 'suspended') return;

  const start = ctx.currentTime + 0.005;
  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.055));
  const noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    const decay = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * decay * decay;
  }

  const noise = ctx.createBufferSource();
  const clickFilter = ctx.createBiquadFilter();
  const clickGain = ctx.createGain();
  const thock = ctx.createOscillator();
  const thockGain = ctx.createGain();

  noise.buffer = noiseBuffer;
  clickFilter.type = 'bandpass';
  clickFilter.frequency.setValueAtTime(1800 + Math.random() * 900, start);
  clickFilter.Q.setValueAtTime(3.2, start);

  clickGain.gain.setValueAtTime(0.0001, start);
  clickGain.gain.exponentialRampToValueAtTime(0.08, start + 0.003);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);

  thock.type = 'triangle';
  thock.frequency.setValueAtTime(115 + Math.random() * 35, start);
  thock.frequency.exponentialRampToValueAtTime(70, start + 0.045);
  thockGain.gain.setValueAtTime(0.0001, start);
  thockGain.gain.exponentialRampToValueAtTime(0.025, start + 0.004);
  thockGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);

  noise.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(ctx.destination);
  thock.connect(thockGain);
  thockGain.connect(ctx.destination);

  noise.start(start);
  noise.stop(start + 0.055);
  thock.start(start);
  thock.stop(start + 0.065);
}

function startAmbientCommandCenter(): SplashAmbientAudio | null {
  if (typeof window === 'undefined') return null;

  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;

  const audioWindow = window as SplashAudioWindow;
  const ctx = audioWindow.__vampireSexAudioContext;
  if (!ctx || ctx.state === 'suspended') return null;

  const master = ctx.createGain();
  const droneBus = ctx.createGain();
  const beepBus = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const compressors = ctx.createDynamicsCompressor();
  const oscillators: OscillatorNode[] = [];
  const timers: number[] = [];

  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.8);
  master.connect(compressors);
  compressors.connect(ctx.destination);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(260, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(1080, ctx.currentTime + 5.4);
  filter.Q.setValueAtTime(0.7, ctx.currentTime);

  droneBus.gain.setValueAtTime(0.18, ctx.currentTime);
  beepBus.gain.setValueAtTime(0.11, ctx.currentTime);
  filter.connect(droneBus);
  droneBus.connect(master);
  beepBus.connect(master);

  [55, 82.41, 110, 146.83].forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const detune = [-7, 4, 11, -13][index] ?? 0;

    osc.type = index === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.detune.setValueAtTime(detune, ctx.currentTime);
    gain.gain.setValueAtTime(index === 0 ? 0.22 : 0.08, ctx.currentTime);
    osc.connect(gain);
    gain.connect(filter);
    osc.start();
    oscillators.push(osc);
  });

  const playBeep = () => {
    if (ctx.state === 'closed') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const toneFilter = ctx.createBiquadFilter();
    const frequencies = [740, 880, 990, 1240, 660, 1320];
    const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];

    osc.type = Math.random() > 0.35 ? 'sine' : 'square';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * (0.96 + Math.random() * 0.08), now + 0.09);
    toneFilter.type = 'bandpass';
    toneFilter.frequency.setValueAtTime(frequency, now);
    toneFilter.Q.setValueAtTime(5.5, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04 + Math.random() * 0.035, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11 + Math.random() * 0.05);

    osc.connect(toneFilter);
    toneFilter.connect(gain);
    gain.connect(beepBus);
    osc.start(now);
    osc.stop(now + 0.18);
  };

  const scheduleBeeps = () => {
    const delay = 130 + Math.random() * 420;
    const timer = window.setTimeout(() => {
      playBeep();
      scheduleBeeps();
    }, delay);
    timers.push(timer);
  };

  scheduleBeeps();

  return {
    stop: () => {
      const now = ctx.currentTime;
      timers.forEach((timer) => window.clearTimeout(timer));
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      oscillators.forEach((osc) => {
        try {
          osc.stop(now + 0.5);
        } catch {
          // Oscillator may already be stopped during rapid skip.
        }
      });
      window.setTimeout(() => master.disconnect(), 620);
    },
  };
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const doneRef   = useRef(onDone);
  const ambientRef = useRef<SplashAmbientAudio | null>(null);
  doneRef.current = onDone;

  const [bootLines, setBootLines]   = useState<BootLine[]>([]);
  const [statLines, setStatLines]   = useState<{ label: string; val: string; c: string }[]>([]);
  const [memLines, setMemLines]     = useState<string[]>([]);
  const [rootFeed, setRootFeed]     = useState<{ idx: string; v: string }[]>([]);
  const [stage, setStage]           = useState<'waiting' | 'playing' | 'fading'>('waiting');
  const [answer, setAnswer]         = useState<string>('');
  const [bgColor, setBgColor]       = useState<string>('#000000');
  const [fadeOut, setFadeOut]       = useState<number>(1);

  // Live tickers (CPU/MEM bars + clock) — updated every 120ms during play
  const [telemetry, setTelemetry] = useState({
    cpu: 12, mem: 38, net: 4, sym: 0, roots: 0, clock: '00:00:00',
  });

	const beginSequence = useCallback(() => {
    if (stage !== 'waiting' || answer) return;

    primeAudioContext();
    ambientRef.current?.stop();
    ambientRef.current = startAmbientCommandCenter();
    setAnswer('Y');
    setBootLines(prev => [
      ...prev.slice(0, -1),
      { t: 'INITIALIZE E8 LATTICE SYSTEM? [Y/N]: Y', c: '#6EC960' },
      { t: 'CONFIRMED — opening bloodline',           c: '#FFC850', tag: 'GO' },
    ]);
    setTimeout(() => {
      setBootLines([]);
      setStage('playing');
    }, 500);
  }, [answer, stage]);

  const abortSequence = useCallback(() => {
    if (stage !== 'waiting' || answer) return;

    primeAudioContext();
    ambientRef.current?.stop();
    setAnswer('N');
    setBootLines(prev => [
      ...prev.slice(0, -1),
      { t: 'INITIALIZE E8 LATTICE SYSTEM? [Y/N]: N', c: '#6EC960' },
      { t: 'sequence aborted',                        c: '#FF3366', tag: 'ABRT' },
    ]);
    setTimeout(() => doneRef.current(), 600);
  }, [answer, stage]);

  const handleSplashTap = useCallback(() => {
    const shouldTapSkip =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);

    if (shouldTapSkip) {
      ambientRef.current?.stop();
      ambientRef.current = null;
      doneRef.current();
      return;
    }

    if (stage === 'waiting') {
      beginSequence();
      return;
    }

    ambientRef.current?.stop();
    ambientRef.current = null;
    doneRef.current();
  }, [beginSequence, stage]);

  useEffect(() => {
    if (stage !== 'fading') return;
    ambientRef.current?.stop();
    ambientRef.current = null;
  }, [stage]);

  useEffect(() => {
    return () => {
      ambientRef.current?.stop();
      ambientRef.current = null;
    };
  }, []);

  // ── Prompt phase — keyboard gate ────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'waiting') return;

    setBootLines([
      { t: 'VAMPIRE_SEX_OS v2.71',                       c: '#6EC960', tag: 'BOOT' },
      { t: '────────────────────────────────────────',   c: '#1A6B2A' },
      { t: 'INITIALIZE E8 LATTICE SYSTEM? [Y/N]:',        c: '#6EC960' },
    ]);

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === 'Y' || k === 'ENTER') {
        primeAudioContext();
        beginSequence();
      } else if (k === 'N' || k === 'ESCAPE') {
        primeAudioContext();
        abortSequence();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abortSequence, beginSequence, stage]);

  // Fallback autoplay so the cinematic sequence still runs if the page
  // doesn't receive focus immediately in the browser preview.
  useEffect(() => {
    if (stage !== 'waiting' || answer) return;

    const id = window.setTimeout(() => {
      beginSequence();
    }, 3500);

    return () => window.clearTimeout(id);
  }, [answer, beginSequence, stage]);

  // ── Telemetry tick ──────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'playing') return;
    const id = setInterval(() => {
      setTelemetry(t => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        return {
          cpu:   Math.max(8,  Math.min(99, t.cpu   + (Math.random() - 0.4) * 14)),
          mem:   Math.max(20, Math.min(94, t.mem   + (Math.random() - 0.5) * 6)),
          net:   Math.max(0,  Math.min(99, t.net   + (Math.random() - 0.4) * 22)),
          sym:   (t.sym + 1) % 696729600,
          roots: Math.min(240, t.roots + Math.ceil(Math.random() * 9)),
          clock: `${hh}:${mm}:${ss}`,
        };
      });
      // hex memory dump scroll
      setMemLines(prev => {
        const addr = randHex(4);
        const bytes = Array.from({ length: 8 }, () => randHex(2)).join(' ');
        const next = [`0x${addr}  ${bytes}`, ...prev];
        return next.slice(0, 6);
      });
      // root vector feed
      setRootFeed(prev => {
        const v = ROOT_VECS[Math.floor(Math.random() * ROOT_VECS.length)];
        const idx = String(Math.floor(Math.random() * 240)).padStart(3, '0');
        return [{ idx, v }, ...prev].slice(0, 9);
      });
    }, 120);
    return () => clearInterval(id);
  }, [stage]);

  // ── Animation phase — only runs after Y ─────────────────────────────────
  useEffect(() => {
    if (stage !== 'playing') return;
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d')!;

    const TITLE_BAR = 36;
    const W = window.innerWidth;
    const H = window.innerHeight - TITLE_BAR;
    canvas.width  = W;
    canvas.height = H;

    const CX = W / 2, CY = H / 2;
    const SCALE = Math.min(W, H) * 0.40;
    const CS    = Math.max(8, Math.floor(W / 95));

    const toC = (x: number, y: number, a: number): [number, number] => [
      CX + (x * Math.cos(a) - y * Math.sin(a)) * SCALE,
      CY + (x * Math.sin(a) + y * Math.cos(a)) * SCALE,
    ];

    const hueAt = (ri: number) => RINGS[ri].hue;
    const ringColor = (ri: number, l = 55, s = 90, alpha = 1) =>
      `hsla(${hueAt(ri)}, ${s}%, ${l}%, ${alpha})`;

    // Pre-compute projected positions per frame (rotation-dependent).
    const drawLattice = (
      prog: number,
      ang: number,
      sweepAng: number, // angle of the bright sweep (0..2π)
      pulse: number,    // 0..1 pulse phase for nodes
      alpha: number,
    ) => {
      ctx.globalAlpha = alpha;

      // 1) faint backdrop circles for each ring (subtle ambient color)
      ctx.lineWidth = 1;
      RINGS.forEach((R, ri) => {
        ctx.beginPath();
        ctx.arc(CX, CY, R.r * SCALE, 0, Math.PI * 2);
        ctx.strokeStyle = ringColor(ri, 28, 55, 0.18);
        ctx.stroke();
      });

      // 2) edges, drawn in order with progressive reveal
      const totalEdges = E8.edges.length;
      const nE = Math.floor(totalEdges * Math.min(1, prog));
      for (let i = 0; i < nE; i++) {
        const [aIdx, bIdx, kind] = E8.edges[i];
        const na = E8.nodes[aIdx], nb = E8.nodes[bIdx];
        const [ax, ay] = toC(na[0], na[1], ang);
        const [bx, by] = toC(nb[0], nb[1], ang);
        const ringA = na[2], ringB = nb[2];

        // sweep highlight: edges whose midpoint is near the sweep angle glow
        const mAng = Math.atan2((ay + by) / 2 - CY, (ax + bx) / 2 - CX);
        let dA = Math.abs(mAng - sweepAng);
        if (dA > Math.PI) dA = Math.PI * 2 - dA;
        const sweep = Math.max(0, 1 - dA / 0.5); // 0..1

        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        const baseL = kind === 0 ? 52 : kind === 1 ? 46 : 38;
        const baseA = kind === 0 ? 0.85 : kind === 1 ? 0.55 : 0.32;
        const hotL = baseL + sweep * 28;
        const hotA = Math.min(1, baseA + sweep * 0.55);
        grad.addColorStop(0, ringColor(ringA, hotL, 95, hotA));
        grad.addColorStop(1, ringColor(ringB, hotL, 95, hotA));
        ctx.strokeStyle = grad;
        ctx.lineWidth = kind === 0 ? 1.4 + sweep * 1.6 : kind === 1 ? 1.1 + sweep * 1.2 : 0.7 + sweep * 0.8;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // 3) nodes — appear after edges are well underway
      const nN = Math.floor(E8.nodes.length * Math.max(0, prog * 2 - 1));
      ctx.font = `${CS}px "Courier New",monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < nN; i++) {
        const n = E8.nodes[i];
        const [x, y] = toC(n[0], n[1], ang);
        const ri = n[2];
        // per-node pulse phase, offset by node index for shimmer
        const phase = (pulse + i * 0.073) % 1;
        const p = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
        const size = CS * (0.85 + p * 0.5);
        // sweep also brightens nodes
        const nodeAng = Math.atan2(y - CY, x - CX);
        let dA = Math.abs(nodeAng - sweepAng);
        if (dA > Math.PI) dA = Math.PI * 2 - dA;
        const sweep = Math.max(0, 1 - dA / 0.6);

        // outer halo
        ctx.fillStyle = ringColor(ri, 60, 95, 0.15 + sweep * 0.35);
        ctx.beginPath();
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // glyph
        ctx.fillStyle = ringColor(ri, 70 + sweep * 20, 95, 0.95);
        ctx.font = `${size}px "Courier New",monospace`;
        ctx.fillText(NODE_CH[ri % NODE_CH.length], x, y);
      }
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = 1;
    };

    type Phase = 'boot' | 'draw' | 'stats' | 'accel' | 'unravel' | 'converge' | 'morph';
    type Pt = {
      x: number; y: number; vx: number; vy: number;
      tx: number; ty: number; // target for converge phase
      ch: string; r: number; g: number; b: number; a: number;
      size: number; rot: number; dRot: number;
    };

    let phase: Phase = 'boot', phaseStart = performance.now();
    let ang = 0, bootStep = 0, statsStep = 0;
    let pts: Pt[] = [];
    const D = { boot: 1.6, draw: 4.2, stats: 4.0, accel: 1.6, unravel: 1.6, converge: 1.4, morph: 1.0 };

    const go = (p: Phase, now: number) => { phase = p; phaseStart = now; };

    const pushBoot = (line: BootLine) => {
      playKeyboardStroke();
      setBootLines(prev => [...prev, line]);
    };

    const pushStat = (label: string, val: string, c: string) => {
      playKeyboardStroke();
      setStatLines(prev => [...prev, { label, val, c }]);
    };

    const tick = (now: number) => {
      const sec = (now - phaseStart) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Sweep angle: rotates faster than the lattice itself.
      const sweepAng = (now / 700) % (Math.PI * 2);
      const pulse = (now / 1800) % 1;

      // boot
      if (phase === 'boot') {
        const step = Math.floor(sec / (D.boot / BOOT.length));
        while (bootStep <= step && bootStep < BOOT.length) pushBoot(BOOT[bootStep++]);
        if (sec >= D.boot) go('draw', now);
      }

      // draw lattice
      if (phase === 'draw') {
        ang += 0.005;
        drawLattice(sec / D.draw, ang, sweepAng, pulse, 1);
        if (sec >= D.draw) {
          pushBoot({ t: 'lattice complete — running diagnostics', c: '#6EC960', tag: 'OK' });
          go('stats', now);
        }
      }

      // stats appear
      if (phase === 'stats') {
        ang += 0.0025;
        drawLattice(1, ang, sweepAng, pulse, 1);
        const step = Math.floor(sec / (D.stats / STATS.length));
        while (statsStep <= step && statsStep < STATS.length) {
          const [label, val, c] = STATS[statsStep++];
          pushStat(label, val, c);
        }
        if (sec >= D.stats) go('accel', now);
      }

      // spin up
      if (phase === 'accel') {
        const spin = sec / D.accel;
        ang += 0.007 + spin * 0.10;
        drawLattice(1, ang, sweepAng, pulse, 1);
        if (sec >= D.accel) {
          // Compute hero wordmark target rect (where "VAMPIRE SEX" will land
          // on the home page). Hero text is ~15vw, baseline near vertical
          // center. We precompute its center-x and a band around it so
          // particles can converge to that area, smoothing the handoff.
          const targetCY = H * 0.55;
          const targetW = W * 0.85;
          const targetH = H * 0.18;

          pts = [];
          E8.nodes.forEach((n, i) => {
            const [px, py] = toC(n[0], n[1], ang);
            const oa = Math.atan2(py - CY, px - CX);
            const spd = 0.4 + Math.random() * 1.3;
            const [r, g, b] = PC[i % PC.length];
            // Each node targets a random point inside the wordmark band
            const tx = (W - targetW) / 2 + Math.random() * targetW;
            const ty = targetCY - targetH / 2 + Math.random() * targetH;
            pts.push({
              x: px, y: py,
              vx: Math.cos(oa) * spd + (Math.random() - 0.5) * 0.8,
              vy: Math.sin(oa) * spd + (Math.random() - 0.5) * 0.8,
              tx, ty,
              ch: NODE_CH[n[2] % NODE_CH.length],
              r, g, b, a: 1,
              size: CS * (0.9 + Math.random() * 0.6),
              rot: 0, dRot: (Math.random() - 0.5) * 0.1,
            });
          });
          // Add edge-dust particles
          for (let i = 0; i < Math.min(220, E8.edges.length); i++) {
            const [aI, bI] = E8.edges[i];
            const [ax, ay] = toC(E8.nodes[aI][0], E8.nodes[aI][1], ang);
            const [bx, by] = toC(E8.nodes[bI][0], E8.nodes[bI][1], ang);
            const t = Math.random();
            const mx = ax + (bx - ax) * t;
            const my = ay + (by - ay) * t;
            const oa = Math.atan2(my - CY, mx - CX) + (Math.random() - 0.5) * 1.0;
            const spd = 0.3 + Math.random() * 0.9;
            const [r, g, b2] = PC[i % PC.length];
            const dustCh = ['.', '·', ',', ':', '*', '◦'][Math.floor(Math.random() * 6)];
            const tx = (W - targetW) / 2 + Math.random() * targetW;
            const ty = targetCY - targetH / 2 + Math.random() * targetH;
            pts.push({
              x: mx, y: my,
              vx: Math.cos(oa) * spd, vy: Math.sin(oa) * spd,
              tx, ty,
              ch: dustCh,
              r, g, b: b2, a: 0.85,
              size: CS * 0.45 + Math.random() * CS * 0.45,
              rot: Math.random() * Math.PI * 2,
              dRot: (Math.random() - 0.5) * 0.15,
            });
          }
          go('unravel', now);
        }
      }

      // unravel — lattice expands outward as fragments
      if (phase === 'unravel') {
        const p = Math.min(1, sec / D.unravel);
        const ease = 1 - Math.pow(1 - p, 3);
        ctx.save();
        pts.forEach(pt => {
          pt.x += pt.vx * (1 + ease * 1.6);
          pt.y += pt.vy * (1 + ease * 1.6);
          pt.vx *= 0.985;
          pt.vy *= 0.985;
          pt.rot += pt.dRot;
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot);
          ctx.font = `${pt.size}px "Courier New",monospace`;
          ctx.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${pt.a})`;
          ctx.fillText(pt.ch, -pt.size * 0.28, pt.size * 0.36);
          ctx.restore();
        });
        ctx.restore();
        if (sec >= D.unravel) go('converge', now);
      }

      // converge — particles arc toward the hero wordmark target zone
      // while the background gradient-shifts from black → cream
      if (phase === 'converge') {
        const p = Math.min(1, sec / D.converge);
        const ease = p * p * (3 - 2 * p); // smoothstep

        // Background fades black → cream. We do this on the wrapper
        // via state so React applies it. Avoids canvas-clearing color races.
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const r = Math.round(lerp(10, 232, ease));
        const g = Math.round(lerp(10, 220, ease));
        const b = Math.round(lerp(10, 200, ease));
        setBgColor(`rgb(${r},${g},${b})`);

        ctx.save();
        pts.forEach(pt => {
          // ease toward target
          pt.x = lerp(pt.x, pt.tx, 0.04 + ease * 0.06);
          pt.y = lerp(pt.y, pt.ty, 0.04 + ease * 0.06);
          pt.rot += pt.dRot * 0.5;
          // size shrinks as it converges
          const shrink = 1 - ease * 0.55;
          // alpha: as background brightens, fragments fade so they don't
          // muddy the cream → wordmark transition
          const a = (1 - ease) * pt.a;
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.rot);
          ctx.font = `${pt.size * shrink}px "Courier New",monospace`;
          ctx.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${a})`;
          ctx.fillText(pt.ch, -pt.size * 0.28, pt.size * 0.36);
          ctx.restore();
        });
        ctx.restore();

        if (sec >= D.converge) {
          setStage('fading');
          go('morph', now);
        }
      }

      // morph — final cross-fade. Wrapper opacity drops, background already
      // matches the hero so the page underneath shows through naturally.
      if (phase === 'morph') {
        const p = Math.min(1, sec / D.morph);
        const ease = p * p;
        setFadeOut(1 - ease);
        if (wrap) {
          wrap.style.opacity = String(1 - ease);
        }
        if (sec >= D.morph) {
          cancelAnimationFrame(rafRef.current);
          doneRef.current();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage]);

  // Helpers for building telemetry bars
  const bar = (pct: number, width = 10, ch = '█', empty = '░') => {
    const f = Math.round((pct / 100) * width);
    return ch.repeat(Math.max(0, f)) + empty.repeat(Math.max(0, width - f));
  };

  const tagColor = (tag?: string) => {
    if (tag === 'OK')   return '#6EC960';
    if (tag === 'INIT') return '#FFC850';
    if (tag === 'GO')   return '#80DCC8';
    if (tag === 'BOOT') return '#80DCC8';
    if (tag === 'ABRT') return '#FF3366';
    if (tag === '∴')    return '#80DCC8';
    return '#888';
  };

  return (
    <div
      ref={wrapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Vampire Sex E8 terminal splash"
      className="fixed inset-0 z-[9999] flex flex-col cursor-pointer"
      onClick={handleSplashTap}
      style={{
        fontFamily: '"Courier New",monospace',
        backgroundColor: bgColor,
        transition: 'background-color 80ms linear',
        opacity: fadeOut,
      }}
    >
      {/* macOS-style title bar */}
      <div className="shrink-0 bg-[#0e0e0e] border-b border-[#1e1e1e] px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
        <span className="text-[#444] text-[10px] tracking-widest uppercase ml-4 select-none">
          vampire_sex_os — e8 terminal — {telemetry.clock}
        </span>
        {/* Live status LEDs */}
        {stage === 'playing' && (
          <span className="ml-3 hidden sm:flex items-center gap-3 text-[9px] tracking-widest">
            <span style={{ color: '#6EC960' }}>● W(E8)</span>
            <span style={{ color: '#FFC850' }}>● {String(telemetry.roots).padStart(3, '0')}/240</span>
            <span style={{ color: '#80DCC8' }}>● SYNC</span>
          </span>
        )}
        <button
          onClick={(event) => {
            event.stopPropagation();
            doneRef.current();
          }}
          className="ml-auto text-[#333] hover:text-[#777] text-[10px] tracking-widest uppercase transition-colors"
        >
          skip ›
        </button>
      </div>

      {/* Canvas + overlays */}
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Vignette ring around the lattice for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, transparent 38%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.85) 100%)',
            opacity: stage === 'playing' ? 0.7 : 0,
            transition: 'opacity 600ms ease',
          }}
        />

        {/* Scanline overlay — fades out during morph for a clean handoff */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.10) 2px,rgba(0,0,0,0.10) 4px)',
            opacity: stage === 'fading' ? 0 : 1,
            transition: 'opacity 600ms ease',
            mixBlendMode: 'multiply',
          }}
        />

        {/* CRT corner brackets */}
        {stage === 'playing' && (
          <div className="absolute inset-3 pointer-events-none" aria-hidden="true">
            {(['tl', 'tr', 'bl', 'br'] as const).map(c => (
              <div
                key={c}
                className="absolute w-4 h-4 border-[#4A7C3F]/60"
                style={{
                  top:    c[0] === 't' ? 0 : 'auto',
                  bottom: c[0] === 'b' ? 0 : 'auto',
                  left:   c[1] === 'l' ? 0 : 'auto',
                  right:  c[1] === 'r' ? 0 : 'auto',
                  borderTopWidth:    c[0] === 't' ? 1 : 0,
                  borderBottomWidth: c[0] === 'b' ? 1 : 0,
                  borderLeftWidth:   c[1] === 'l' ? 1 : 0,
                  borderRightWidth:  c[1] === 'r' ? 1 : 0,
                }}
              />
            ))}
          </div>
        )}

        {/* TOP-LEFT — hex memory dump */}
        {stage === 'playing' && (
          <div className="absolute top-3 left-4 pointer-events-none space-y-[1px]" style={{ opacity: 0.55 }}>
            <div className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: '#80DCC8' }}>
              ── mem dump ─ ring0 ──
            </div>
            {memLines.map((l, i) => (
              <div
                key={i}
                className="text-[10px] tracking-wider"
                style={{
                  color: '#6EC960',
                  fontFamily: '"Courier New",monospace',
                  opacity: 1 - i * 0.13,
                }}
              >
                {l}
              </div>
            ))}
          </div>
        )}

        {/* TOP-RIGHT — telemetry / live tickers */}
        {stage === 'playing' && (
          <div
            className="absolute top-3 right-4 pointer-events-none text-right space-y-[2px]"
            style={{ minWidth: 240 }}
          >
            <div className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: '#80DCC8' }}>
              ── telemetry ──
            </div>
            <div className="text-[10px]" style={{ color: '#6EC960' }}>
              CPU [{bar(telemetry.cpu)}] {String(Math.round(telemetry.cpu)).padStart(2, '0')}%
            </div>
            <div className="text-[10px]" style={{ color: '#FFC850' }}>
              MEM [{bar(telemetry.mem)}] {String(Math.round(telemetry.mem)).padStart(2, '0')}%
            </div>
            <div className="text-[10px]" style={{ color: '#80DCC8' }}>
              NET [{bar(telemetry.net)}] {String(Math.round(telemetry.net)).padStart(2, '0')}%
            </div>
            <div className="text-[10px] mt-1" style={{ color: '#F2EDE4', opacity: 0.55 }}>
              W(E8) → {String(telemetry.sym).padStart(9, '0')}
            </div>
          </div>
        )}

        {/* MIDDLE-RIGHT — root vector feed */}
        {stage === 'playing' && (
          <div
            className="absolute right-4 pointer-events-none space-y-[1px] text-right"
            style={{ top: '38%', opacity: 0.7 }}
          >
            <div className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: '#80DCC8' }}>
              ── α-roots ──
            </div>
            {rootFeed.map((r, i) => (
              <div
                key={i}
                className="text-[10px] tracking-wider"
                style={{
                  color: i === 0 ? '#FFC850' : '#6EC960',
                  fontFamily: '"Courier New",monospace',
                  opacity: 1 - i * 0.10,
                }}
              >
                <span style={{ color: '#80DCC8' }}>r{r.idx}</span> {r.v}
              </div>
            ))}
          </div>
        )}

        {/* MIDDLE-LEFT — diagnostics list (during stats phase) */}
        {stage === 'playing' && statLines.length > 0 && (
          <div className="absolute left-4 pointer-events-none space-y-[2px]" style={{ top: '38%' }}>
            <div className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: '#80DCC8' }}>
              ── diagnostics ──
            </div>
            {statLines.map((s, i) => (
              <div
                key={i}
                className="text-[10px] tracking-wider"
                style={{ color: s.c, fontFamily: '"Courier New",monospace' }}
              >
                <span style={{ color: '#444' }}>›</span>{' '}
                {s.label.padEnd(18, '·')} <span style={{ color: '#F2EDE4' }}>{s.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM — boot console */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 space-y-[2px] pointer-events-none">
          {bootLines.map((l, i) => (
            <div
              key={i}
              className="text-[11px] tracking-wider truncate flex items-center gap-2"
              style={{ fontFamily: '"Courier New",monospace' }}
            >
              {l.tag && (
                <span
                  className="text-[9px] tracking-widest px-1.5 py-[1px] border"
                  style={{
                    color: tagColor(l.tag),
                    borderColor: `${tagColor(l.tag)}55`,
                    backgroundColor: `${tagColor(l.tag)}11`,
                  }}
                >
                  {l.tag}
                </span>
              )}
              <span
                style={{
                  color: l.c,
                  textShadow: `0 0 6px ${l.c}88`,
                }}
              >
                {l.t}
                {i === bootLines.length - 1 && stage === 'waiting' && !answer && (
                  <span style={{ animation: 'vs-blink 0.8s step-end infinite' }}>█</span>
                )}
              </span>
            </div>
          ))}

          {stage === 'waiting' && !answer && (
            <div
              className="text-[9px] tracking-[0.2em] mt-2 uppercase"
              style={{ color: '#333', fontFamily: '"Courier New",monospace' }}
            >
              <span className="hidden sm:inline">PRESS Y OR [ENTER] TO INITIALIZE · N TO SKIP</span>
              <span className="sm:hidden">TAP TO ENTER · SWIPE DOWN TO SKIP</span>
            </div>
          )}
        </div>

        {/* HANDOFF VEIL — once we hit the morph stage, paint a cream wash on
            top of the canvas to "swallow" the lattice into the hero color.
            Coupled with wrapper opacity fade, this produces a smooth dissolve
            instead of a hard cut. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 55%, rgba(232,220,200,0.95) 0%, rgba(232,220,200,0.85) 35%, rgba(232,220,200,0.6) 65%, rgba(232,220,200,0) 100%)',
            opacity: stage === 'fading' ? 1 : 0,
            transition: 'opacity 700ms ease',
          }}
        />
      </div>

      <style>{`
        @keyframes vs-blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
