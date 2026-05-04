'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const INTRO_DURATION = 6.4;
const TEXT_ASPECT = 4.7;
const CURSOR_START = { left: 11, top: 18 };
const CURSOR_TARGET = { left: 49, top: 46 };
const BACKGROUND_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BACKGROUND_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec2 gridUv = vUv * vec2(120.0, 64.0);
    vec2 grid = abs(fract(gridUv) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.028, min(grid.x, grid.y));
    float scan = 0.5 + 0.5 * sin((vUv.y + uTime * 0.035) * 980.0);
    float noise = hash(floor(vUv * vec2(360.0, 210.0)) + floor(uTime * 18.0));
    float pulse = smoothstep(0.04, 0.32, uProgress);

    vec3 base = vec3(0.006, 0.008, 0.007);
    vec3 green = vec3(0.10, 0.30, 0.11);
    float film = line * 0.045 + scan * 0.018 + noise * 0.026;
    vec3 color = base + green * film * pulse;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const TITLE_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float hit = 1.0 - smoothstep(0.08, 0.55, uProgress);
    pos.x += sin((uv.y * 42.0) + uTime * 34.0) * 0.012 * hit;
    pos.y += sin((uv.x * 28.0) - uTime * 18.0) * 0.004 * hit;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const TITLE_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;

  float band(vec2 uv) {
    float stripe = step(0.965, sin((uv.y * 72.0) + uTime * 28.0) * 0.5 + 0.5);
    return stripe * (1.0 - smoothstep(0.18, 0.72, uProgress));
  }

  void main() {
    float b = band(vUv);
    vec2 redUv = vUv + vec2(0.005 + b * 0.018, 0.0);
    vec2 blueUv = vUv - vec2(0.004 + b * 0.014, 0.0);
    vec4 base = texture2D(uTexture, vUv);
    float r = texture2D(uTexture, redUv).a;
    float g = base.a;
    float bl = texture2D(uTexture, blueUv).a;
    float alpha = max(max(r, g), bl);
    vec3 color = vec3(r, g * 0.97, bl * 0.90);
    color = mix(vec3(0.95, 0.93, 0.88), color, 0.22 + b * 0.38);
    gl_FragColor = vec4(color, alpha);
  }
`;

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function playClickSound() {
  if (typeof window === 'undefined') return;

  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;

  const audioWindow = window as Window & { __vampireSexAudioContext?: AudioContext };
  const ctx = audioWindow.__vampireSexAudioContext ?? new AudioContextCtor();
  audioWindow.__vampireSexAudioContext = ctx;

  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }

  const start = ctx.currentTime + 0.01;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(1800, start);
  osc.frequency.exponentialRampToValueAtTime(420, start + 0.045);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.14, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.09);
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  const glyphs = [...text];
  const widths = glyphs.map((glyph) => ctx.measureText(glyph).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + tracking * (glyphs.length - 1);
  let cursor = x - totalWidth / 2;

  glyphs.forEach((glyph, index) => {
    ctx.fillText(glyph, cursor + widths[index] / 2, y);
    cursor += widths[index] + tracking;
  });
}

function createNormalizeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#F2EDE4';
  ctx.shadowColor = 'rgba(74, 124, 63, 0.28)';
  ctx.shadowBlur = 18;

  let fontSize = 236;
  let tracking = 8;
  const text = 'NORMALIZE IT';

  while (fontSize > 120) {
    ctx.font = `400 ${fontSize}px Anton, Impact, sans-serif`;
    const measured = [...text].reduce((sum, glyph) => sum + ctx.measureText(glyph).width, 0);
    if (measured + tracking * (text.length - 1) < canvas.width * 0.88) break;
    fontSize -= 4;
    tracking = Math.max(2, tracking - 0.1);
  }

  ctx.font = `400 ${fontSize}px Anton, Impact, sans-serif`;
  drawTrackedText(ctx, text, canvas.width / 2, canvas.height / 2 + fontSize * 0.04, tracking);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
}

function BackgroundFilm({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startedAt = useRef<number | null>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(() => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;

    if (!active) {
      startedAt.current = null;
    } else if (startedAt.current === null) {
      startedAt.current = clock.getElapsedTime();
    }

    const elapsed = startedAt.current === null ? 0 : clock.getElapsedTime() - startedAt.current;
    const progress = Math.min(1, elapsed / INTRO_DURATION);

    materialRef.current.uniforms.uTime.value = elapsed;
    materialRef.current.uniforms.uProgress.value = progress;
    meshRef.current.scale.set(viewport.width, viewport.height, 1);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -0.15]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={BACKGROUND_VERTEX_SHADER}
        fragmentShader={BACKGROUND_FRAGMENT_SHADER}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function NormalizeTitlePlane({
  active,
  texture,
  clickPulse,
  coverPulse,
}: {
  active: boolean;
  texture: THREE.CanvasTexture;
  clickPulse: number;
  coverPulse: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const startedAt = useRef<number | null>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(() => ({
      uTexture: { value: texture },
      uTime: { value: 0 },
      uProgress: { value: 0 },
  }), [texture]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;

    if (!active) {
      startedAt.current = null;
    } else if (startedAt.current === null) {
      startedAt.current = clock.getElapsedTime();
    }

    const elapsed = startedAt.current === null ? 0 : clock.getElapsedTime() - startedAt.current;
    const progress = Math.min(1, elapsed / INTRO_DURATION);
    const eased = easeOutCubic(progress);
    const width = Math.min(viewport.width * 0.72, 10.4);
    const height = width / TEXT_ASPECT;
    const zoom = 1.34 - eased * 0.31 + clickPulse * 0.48 + coverPulse * 0.36;

    materialRef.current.uniforms.uTime.value = elapsed;
    materialRef.current.uniforms.uProgress.value = progress;
    meshRef.current.scale.set(width * zoom, height * zoom, 1);
    meshRef.current.position.y = THREE.MathUtils.lerp(-viewport.height * 0.035, 0, eased);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={TITLE_VERTEX_SHADER}
        fragmentShader={TITLE_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function NormalizeScene({
  active,
  texture,
  clickPulse,
  coverPulse,
}: {
  active: boolean;
  texture: THREE.CanvasTexture;
  clickPulse: number;
  coverPulse: number;
}) {
  return (
    <>
      <BackgroundFilm active={active} />
      <NormalizeTitlePlane active={active} texture={texture} clickPulse={clickPulse} coverPulse={coverPulse} />
    </>
  );
}

export default function NormalizeIntroWebGL({
  active = true,
  onComplete,
  }: {
  active?: boolean;
  onComplete?: () => void;
}) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const [cursorPhase, setCursorPhase] = useState<'hidden' | 'travel' | 'click' | 'fade'>('hidden');
  const [clickPulse, setClickPulse] = useState(0);
  const [coverPulse, setCoverPulse] = useState(0);
  const [cursorTarget, setCursorTarget] = useState({ left: `${CURSOR_START.left}%`, top: `${CURSOR_START.top}%` });
  const [bgReady, setBgReady] = useState(false);

  // Delay dark background so splash cream can fade out without a flash
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setBgReady(true), 400);
    return () => window.clearTimeout(id);
  }, [active]);

  useEffect(() => {
    let disposed = false;
    let currentTexture: THREE.CanvasTexture | null = null;
    let completionTimer: number | undefined;
    let travelTimer: number | undefined;
    let clickTimer: number | undefined;
    let fadeTimer: number | undefined;

    const buildTexture = () => {
      if (disposed) return;
      const nextTexture = createNormalizeTexture();
      if (!nextTexture) return;
      currentTexture?.dispose();
      currentTexture = nextTexture;
      setTexture(nextTexture);
    };

    if (active && onComplete) {
      travelTimer = window.setTimeout(() => {
        if (!disposed) {
          setCursorPhase('travel');
          setCursorTarget({ left: `${CURSOR_TARGET.left}%`, top: `${CURSOR_TARGET.top}%` });
        }
      }, 1200);
      clickTimer = window.setTimeout(() => {
        if (disposed) return;
        setCursorPhase('click');
        setClickPulse(1);
        setCoverPulse(1);
        playClickSound();
        completionTimer = window.setTimeout(() => {
          if (!disposed) onComplete();
        }, 800);
      }, 3600);
      fadeTimer = window.setTimeout(() => {
        if (!disposed) {
          setCursorPhase('fade');
        }
      }, 4100);
    }

    buildTexture();
    document.fonts?.ready.then(buildTexture).catch(() => undefined);

    return () => {
      disposed = true;
      if (travelTimer) window.clearTimeout(travelTimer);
      if (clickTimer) window.clearTimeout(clickTimer);
      if (fadeTimer) window.clearTimeout(fadeTimer);
      if (completionTimer) {
        window.clearTimeout(completionTimer);
      }
      currentTexture?.dispose();
    };
  }, [active, onComplete]);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      aria-label="Normalize It cinematic intro"
      style={{
        backgroundColor: coverPulse ? '#E8DCC8' : bgReady ? '#050605' : '#E8DCC8',
        transition: 'background-color 600ms ease',
      }}
    >
      <h2 className="sr-only">Normalize It</h2>
      {texture ? (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 10], zoom: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="absolute inset-0 z-0"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <NormalizeScene active={active} texture={texture} clickPulse={clickPulse} coverPulse={coverPulse} />
        </Canvas>
      ) : (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#050605]">
          <span className="font-sans text-[12vw] leading-none tracking-tight text-[#F2EDE4] md:text-[7vw]">
            NORMALIZE IT
          </span>
        </div>
      )}
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-[#E8DCC8] transition-opacity duration-500 ${
          coverPulse ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 ${
          cursorPhase === 'fade' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className={`relative transition-[left,top,opacity,transform] duration-[2200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            cursorPhase === 'hidden' ? 'opacity-0' : cursorPhase === 'fade' ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            position: 'absolute',
            left: cursorPhase === 'hidden' ? `${CURSOR_START.left}%` : cursorTarget.left,
            top: cursorPhase === 'hidden' ? `${CURSOR_START.top}%` : cursorTarget.top,
            transform: `translate(-50%, -50%) scale(${cursorPhase === 'click' ? 0.82 : 1})`,
            width: 96,
            height: 96,
          }}
        >
          <div className={`absolute inset-0 rounded-full bg-[#F2EDE4]/10 blur-2xl transition-all duration-300 ${
            cursorPhase === 'click' ? 'scale-[1.65] opacity-70' : 'scale-100 opacity-40'
          }`} />
          <div className={`absolute left-1/2 top-1/2 -translate-x-[38%] -translate-y-[36%] transition-transform duration-300 ${
            cursorPhase === 'click' ? 'scale-105' : 'scale-100'
          }`}>
            <svg
              width="84"
              height="84"
              viewBox="0 0 66 66"
              style={{ filter: 'drop-shadow(10px 12px 0 rgba(0,0,0,0.58)) drop-shadow(0 0 10px rgba(242,237,228,0.08))' }}
            >
              <path d="M10 8l25 34 1-15 13-4L10 8Z" fill="#F2EDE4" stroke="#111111" strokeWidth="2.1" />
              <path d="M34 25l10 27" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
      <div className={`pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,rgba(242,237,228,0.2)_0%,rgba(242,237,228,0.1)_16%,transparent_44%)] transition-opacity duration-500 ${coverPulse ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.28)_78%,rgba(0,0,0,0.58)_100%)] transition-opacity duration-500 ${coverPulse ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`pointer-events-none absolute inset-x-0 top-1/2 z-40 h-px bg-[#4A7C3F]/10 transition-opacity duration-500 ${coverPulse ? 'opacity-0' : 'opacity-100'}`} />
    </div>
  );
}
