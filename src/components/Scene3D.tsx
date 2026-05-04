import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape: React.FC<{ position: [number, number, number]; color: string; speed?: number; scale?: number }> = ({ position, color, speed = 1, scale = 1 }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const scrollY = window.scrollY * 0.001;
    ref.current.rotation.x = t * 0.15 * speed + scrollY;
    ref.current.rotation.y = t * 0.2 * speed + scrollY * 0.5;
    ref.current.position.y = position[1] + Math.sin(t * speed) * 0.3 - scrollY * 2;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <Icosahedron ref={ref} args={[1, 1]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.6}
          transparent
          opacity={0.55}
        />
      </Icosahedron>
    </Float>
  );
};

const Scene3D: React.FC = () => {
  const shapes = useMemo(
    () => [
      { position: [-4, 2, -2] as [number, number, number], color: '#3a9eb5', speed: 0.8, scale: 1.2 },
      { position: [4, -1, -3] as [number, number, number], color: '#266b78', speed: 1.1, scale: 1.5 },
      { position: [0, 3, -5] as [number, number, number], color: '#5fb8cc', speed: 0.6, scale: 1 },
      { position: [-3, -3, -4] as [number, number, number], color: '#3a9eb5', speed: 1.3, scale: 0.8 },
      { position: [3, 4, -6] as [number, number, number], color: '#266b78', speed: 0.9, scale: 1.1 },
    ],
    []
  );

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.6 }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#5fb8cc" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#3a9eb5" />
        <Stars radius={50} depth={30} count={1500} factor={3} saturation={0} fade speed={0.5} />
        {shapes.map((s, i) => (
          <FloatingShape key={i} {...s} />
        ))}
      </Canvas>
    </div>
  );
};

export default Scene3D;
