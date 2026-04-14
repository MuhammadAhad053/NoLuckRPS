import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, MeshReflectorMaterial, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const Arena: React.FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);
  const platformRef = useRef<THREE.Group>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = -2;
      gridRef.current.material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
    if (platformRef.current) {
      platformRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group>
      {/* Background Atmosphere */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      <Sparkles count={150} scale={30} size={3} speed={0.3} opacity={0.1} color="#f97316" />
      
      {/* Main Platform Group */}
      <group ref={platformRef} position={[0, -2.1, 0]}>
        {/* Reflective Floor - Simplified for mobile */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[15, isMobile ? 32 : 64]} />
          {isMobile ? (
            <meshStandardMaterial 
              color="#050505" 
              metalness={0.8} 
              roughness={0.2} 
            />
          ) : (
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={512}
              mixBlur={1}
              mixStrength={60}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.8}
              mirror={0.5}
            />
          )}
        </mesh>

        {/* Inner Neon Ring (Orange) */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[14.8, 15, 64]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.6} />
        </mesh>

        {/* Outer Glow Ring (Red) */}
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[15.2, 15.6, 64]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.2} />
        </mesh>

        {/* Tactical Grid Overlay */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[14.5, 64]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.05} wireframe />
        </mesh>

        {/* Decorative Pillars (Monoliths) */}
        {Array.from({ length: 12 }).map((_, i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 6, 0]}>
            <mesh position={[18, 5, 0]}>
              <boxGeometry args={[0.8, 15, 0.8]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Neon Strip on Pillar */}
            <mesh position={[17.5, 5, 0]}>
              <boxGeometry args={[0.1, 15, 0.2]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#f97316" : "#dc2626"} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Grid */}
      <gridHelper 
        ref={gridRef} 
        args={[120, 60, "#f97316", "#1e0b0b"]} 
      >
        <meshBasicMaterial attach="material" transparent opacity={0.05} />
      </gridHelper>

      {/* Floating Tactical Elements */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
          <mesh 
            position={[
              (Math.random() - 0.5) * 40,
              Math.random() * 15 + 3,
              (Math.random() - 0.5) * 40
            ]}
          >
            {i % 4 === 0 ? (
              <octahedronGeometry args={[0.4]} />
            ) : i % 4 === 1 ? (
              <tetrahedronGeometry args={[0.3]} />
            ) : i % 4 === 2 ? (
              <torusGeometry args={[0.2, 0.05, 16, 32]} />
            ) : (
              <dodecahedronGeometry args={[0.3]} />
            )}
            <MeshDistortMaterial 
              color={i % 2 === 0 ? "#f97316" : "#dc2626"}
              speed={3}
              distort={0.4}
              transparent
              opacity={0.3}
              emissive={i % 2 === 0 ? "#f97316" : "#dc2626"}
              emissiveIntensity={0.2}
            />
          </mesh>
        </Float>
      ))}

      {/* Distant Structural Monoliths */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i * Math.PI) / 4) * 60,
            20,
            Math.sin((i * Math.PI) / 4) * 60
          ]}
        >
          <boxGeometry args={[4, 60, 4]} />
          <meshStandardMaterial color="#050505" metalness={1} roughness={0} />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#f97316" />
      <pointLight position={[-10, 10, -10]} intensity={1} color="#dc2626" />
    </group>
  );
};
