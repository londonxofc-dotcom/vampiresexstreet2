'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { createNoise3D } from 'simplex-noise';

function AnimatedBlob() {
  const meshRef  = useRef<Mesh>(null);
  const noise3D  = useMemo(() => createNoise3D(), []);
  const timeRef  = useRef(0);

  useEffect(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array;
    meshRef.current.geometry.userData.originalPositions = new Float32Array(pos);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    timeRef.current += 0.005;
    const t   = timeRef.current;
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const orig = geo.userData.originalPositions as Float32Array;

    for (let i = 0; i < pos.length; i += 3) {
      const x = orig[i], y = orig[i + 1], z = orig[i + 2];
      const n = noise3D(x * 0.5, y * 0.5, t) * 0.3 + noise3D(x * 1.5, y * 1.5, t * 0.7) * 0.2;
      const s = 1 + n;
      pos[i] = x * s; pos[i + 1] = y * s; pos[i + 2] = z * s;
    }
    geo.attributes.position.needsUpdate = true;
    meshRef.current.rotation.x += 0.0003;
    meshRef.current.rotation.y += 0.0005;
  });

  return (
    <mesh ref={meshRef} scale={2}>
      <icosahedronGeometry args={[1, 5]} />
      <meshPhongMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.3} />
    </mesh>
  );
}

export default function BlobHero() {
  return (
    <section className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, alpha: true }}>
          <pointLight position={[10, 10, 10]}   intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -10, 5]}  intensity={0.8} color="#ff1744" />
          <AnimatedBlob />
        </Canvas>
      </div>
      <div className="absolute top-8 right-8 text-white text-right z-10">
        <a href="mailto:vampiresexworldwide@gmail.com" className="text-xs uppercase tracking-widest hover:text-red-600 transition">
          VAMPIRESEXWORLDWIDE@GMAIL.COM
        </a>
      </div>
      <div className="absolute inset-0 flex items-end justify-center pb-20 z-10">
        <div className="text-center text-white max-w-2xl px-6">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-wider mb-4">A Living Entity</h1>
          <p className="text-xs md:text-sm uppercase tracking-widest text-gray-400">Scroll to explore the bloodline</p>
        </div>
      </div>
    </section>
  );
}
