'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

// Exit directions: top-left, top-right, bottom-left, bottom-right
const EXIT_DIRS: [number, number][] = [
  [-1,  1],
  [ 1,  1],
  [-1, -1],
  [ 1, -1],
];

function BlobMesh({ index = 0 }: { index?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const { viewport, pointer } = useThree();

  const noise3D = useMemo(() => createNoise3D(), []);
  const phaseOffset = useMemo(() => index * 1.7, [index]);

  const geometry = useMemo(() => {
    const detail = index === 0 ? 40 : 16;
    const geo = new THREE.IcosahedronGeometry(1.5, detail);
    geo.userData.originalPositions = geo.attributes.position.clone();
    return geo;
  }, [index]);

  const exitDir = EXIT_DIRS[index] || [0, 0];

  useFrame((state) => {
    if (!meshRef.current) return;

    // Read split progress from DOM (bridge between GSAP and Three.js)
    const blobEl = document.getElementById('blob-section');
    const progress = parseFloat(blobEl?.dataset.splitProgress || '0');

    // Satellites stay invisible (scale 0) until split begins — saves GPU work
    if (index > 0 && progress < 0.12) {
      meshRef.current.scale.setScalar(0);
      return;
    }

    const time = state.clock.getElapsedTime();
    const positions = meshRef.current.geometry.attributes.position;
    const originalPositions = meshRef.current.geometry.userData.originalPositions;

    // Animate vertices with simplex noise
    for (let i = 0; i < positions.count; i++) {
      const x = originalPositions.getX(i);
      const y = originalPositions.getY(i);
      const z = originalPositions.getZ(i);

      const noise = noise3D(
        x * 0.8 + (time + phaseOffset) * 0.3,
        y * 0.8 + (time + phaseOffset) * 0.3,
        z * 0.8 + (time + phaseOffset) * 0.3
      );

      const displacement = 1 + noise * 0.3;
      positions.setXYZ(i, x * displacement, y * displacement, z * displacement);
    }

    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();

    // ── Split animation ──
    // Phase 1 (0 → 0.15): all overlapping at center, user plays with blob
    // Phase 2 (0.15 → 0.55): blobs separate + shrink
    // Phase 3 (0.55 → 1.0): blobs accelerate out of frame
    const splitStart = 0.15;
    const t = Math.max(0, Math.min(1, (progress - splitStart) / (1 - splitStart)));

    // Ease: slow start, fast exit (power2 out)
    const eased = 1 - Math.pow(1 - t, 2.5);

    // Position: each blob heads toward its exit direction
    const maxDist = 9; // world units — far enough to leave viewport
    meshRef.current.position.x = exitDir[0] * maxDist * eased;
    meshRef.current.position.y = exitDir[1] * maxDist * eased;

    // Scale: start full size, shrink to 0.4 as they separate
    const scale = THREE.MathUtils.lerp(1, 0.4, eased);
    meshRef.current.scale.setScalar(scale);

    // Mouse interaction — only while blob is still mostly together
    if (progress < 0.25) {
      const targetX = (pointer.x * viewport.width) / 10;
      const targetY = (pointer.y * viewport.height) / 10;
      meshRef.current.rotation.x += (targetY - meshRef.current.rotation.x) * 0.05;
      meshRef.current.rotation.y += (targetX - meshRef.current.rotation.y) * 0.05;
    }

    // Base rotation
    meshRef.current.rotation.z += 0.002;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {index === 0 ? (
        <MeshTransmissionMaterial
          ref={materialRef}
          background={new THREE.Color('#E8DCC8')}
          transmission={1}
          roughness={0}
          thickness={1.5}
          ior={1.5}
          chromaticAberration={0.02}
          anisotropy={0}
          distortion={0.05}
          distortionScale={0.2}
          temporalDistortion={0}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#4A7C3F"
          color="#ffffff"
          samples={4}
          resolution={512}
        />
      ) : (
        <meshPhysicalMaterial
          ref={materialRef}
          transmission={1}
          roughness={0}
          thickness={1.5}
          ior={1.5}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor={new THREE.Color('#4A7C3F')}
          color={new THREE.Color('#ffffff')}
          transparent
        />
      )}
    </mesh>
  );
}

export default function HeroBlob() {
  return (
    <div className="w-full h-full relative overflow-visible pointer-events-none">
      <Canvas camera={{ position: [0, -2.4, 5.5], fov: 45 }} style={{ background: 'transparent' }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#4A7C3F" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#8B1A1A" />
        {[0, 1, 2, 3].map(i => (
          <BlobMesh key={i} index={i} />
        ))}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
