'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, Environment, Text3D } from '@react-three/drei';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import gsap from 'gsap';

type Props = { bgColor?: string };

// ─── Phase 1: Blob — same glass material as the hero, then implodes ───────────
function Blob({ onComplete, bgColor }: { onComplete: () => void; bgColor: string }) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const { pointer, viewport } = useThree();
  const noise3D  = useMemo(() => createNoise3D(), []);
  const stateRef = useRef({ scale: 1 });

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.6, 64);
    geo.userData.originalPositions = geo.attributes.position.clone();
    return geo;
  }, []);

  useEffect(() => {
    // After 1.8s of breathing, implode into text
    const id = setTimeout(() => {
      gsap.to(stateRef.current, {
        scale: 0,
        duration: 1.0,
        ease: 'power3.in',
        onComplete,
      });
    }, 1800);
    return () => clearTimeout(id);
  }, [onComplete]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;
    const orig = meshRef.current.geometry.userData.originalPositions;

    for (let i = 0; i < pos.count; i++) {
      const x = orig.getX(i), y = orig.getY(i), z = orig.getZ(i);
      const n = noise3D(x * 0.8 + t * 0.3, y * 0.8 + t * 0.3, z * 0.8 + t * 0.3);
      const d = 1 + n * 0.3;
      pos.setXYZ(i, x * d, y * d, z * d);
    }
    pos.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();

    meshRef.current.scale.setScalar(stateRef.current.scale);

    // Mouse follow
    const tx = (pointer.x * viewport.width)  / 10;
    const ty = (pointer.y * viewport.height) / 10;
    meshRef.current.rotation.x += (ty - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (tx - meshRef.current.rotation.y) * 0.05;
    meshRef.current.rotation.z += 0.002;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        background={new THREE.Color(bgColor)}
        transmission={1}
        roughness={0}
        thickness={1.5}
        ior={1.5}
        chromaticAberration={0.06}
        anisotropy={0.1}
        distortion={0.1}
        distortionScale={0.3}
        temporalDistortion={0.1}
        clearcoat={1}
        attenuationDistance={0.5}
        attenuationColor="#4A7C3F"
        color="#ffffff"
      />
    </mesh>
  );
}

// ─── Phase 2: 3D text — explodes outward from center, then cursor-tracks ──────
function VampireText({ bgColor }: { bgColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const scaleRef  = useRef(0);

  useEffect(() => {
    const obj = { val: 0 };
    // Elastic snap-in, like it's been compressed and released
    gsap.to(obj, {
      val: 1,
      duration: 1.4,
      ease: 'elastic.out(1, 0.55)',
      onUpdate: () => { scaleRef.current = obj.val; },
    });
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.scale.setScalar(scaleRef.current);

    // Subtle tilt follows cursor — same feel as hero blob
    const tx = -pointer.y * 0.18;
    const ty =  pointer.x * 0.18;
    groupRef.current.rotation.x += (tx - groupRef.current.rotation.x) * 0.07;
    groupRef.current.rotation.y += (ty - groupRef.current.rotation.y) * 0.07;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={0.72}
          height={0.2}
          bevelEnabled
          bevelSize={0.025}
          bevelThickness={0.03}
          bevelSegments={10}
          curveSegments={14}
        >
          {'VAMPIRE\nSEX'}
          <MeshTransmissionMaterial
            background={new THREE.Color(bgColor)}
            transmission={0.95}
            roughness={0.04}
            thickness={0.9}
            ior={1.6}
            chromaticAberration={0.05}
            clearcoat={1}
            attenuationDistance={0.6}
            attenuationColor="#4A7C3F"
            color="#e8dcc8"
          />
        </Text3D>
      </Center>
    </group>
  );
}

// ─── Scene: manages blob → text phase ─────────────────────────────────────────
function Scene({ bgColor }: { bgColor: string }) {
  const [phase, setPhase] = useState<'blob' | 'text'>('blob');
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]}  intensity={1.5} color="#4A7C3F" />
      <directionalLight position={[-10, -10, -5]} intensity={1}   color="#8B1A1A" />
      <Environment preset="city" />
      {phase === 'blob' && <Blob onComplete={() => setPhase('text')} bgColor={bgColor} />}
      {phase === 'text' && (
        <Suspense fallback={null}>
          <VampireText bgColor={bgColor} />
        </Suspense>
      )}
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function TextBlob({ bgColor = '#0A0A0A' }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true }}
    >
      <Scene bgColor={bgColor} />
    </Canvas>
  );
}
