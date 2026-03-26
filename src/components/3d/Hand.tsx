import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Move } from '@/src/types';

interface HandProps {
  position: [number, number, number];
  rotation: [number, number, number];
  move: Move;
  isOpponent?: boolean;
  isRevealing?: boolean;
}

export const Hand: React.FC<HandProps> = ({ position, rotation, move, isOpponent, isRevealing }) => {
  const groupRef = useRef<THREE.Group>(null);

  const playerColor = "#f97316"; // Orange
  const opponentColor = "#dc2626"; // Red
  const activeColor = isOpponent ? opponentColor : playerColor;

  useFrame((state) => {
    if (groupRef.current) {
      if (!isRevealing) {
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        groupRef.current.rotation.y += 0.01;
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
        <group scale={isRevealing ? 1.2 : 1}>
          {!isRevealing ? (
            // Idle: A mysterious glowing crystal
            <mesh>
              <octahedronGeometry args={[0.8, 0]} />
              <MeshDistortMaterial
                color={activeColor}
                speed={4}
                distort={0.4}
                radius={1}
                emissive={activeColor}
                emissiveIntensity={0.5}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ) : (
            <>
              {move === 'rock' && (
                <mesh>
                  <icosahedronGeometry args={[0.8, 1]} />
                  <MeshDistortMaterial
                    color={activeColor}
                    speed={2}
                    distort={0.3}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
              )}
              {move === 'paper' && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <boxGeometry args={[1.2, 1.6, 0.05]} />
                  <MeshWobbleMaterial
                    color={activeColor}
                    speed={2}
                    factor={0.2}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
              )}
              {move === 'scissors' && (
                <group>
                  {/* Blade 1 */}
                  <mesh rotation={[0, 0, Math.PI / 6]} position={[-0.2, 0, 0]}>
                    <boxGeometry args={[0.15, 1.8, 0.1]} />
                    <meshStandardMaterial color={activeColor} metalness={0.9} roughness={0.1} />
                  </mesh>
                  {/* Blade 2 */}
                  <mesh rotation={[0, 0, -Math.PI / 6]} position={[0.2, 0, 0]}>
                    <boxGeometry args={[0.15, 1.8, 0.1]} />
                    <meshStandardMaterial color={activeColor} metalness={0.9} roughness={0.1} />
                  </mesh>
                  {/* Pivot */}
                  <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
                    <meshStandardMaterial color="#ffffff" />
                  </mesh>
                </group>
              )}
            </>
          )}
        </group>
      </Float>

      {/* Particle Effects */}
      <Sparkles 
        count={20} 
        scale={2} 
        size={2} 
        speed={0.5} 
        color={activeColor} 
        opacity={0.5}
      />

      {/* Glow Effect */}
      <pointLight 
        intensity={3} 
        distance={6} 
        color={activeColor} 
      />
    </group>
  );
};
