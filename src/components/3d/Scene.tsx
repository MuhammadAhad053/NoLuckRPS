import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Arena } from './Arena';
import { Hand } from './Hand';
import { Move } from '@/src/types';

interface SceneProps {
  playerMove: Move;
  opponentMove: Move;
  isRevealing?: boolean;
  isMatchmaking?: boolean;
}

export const Scene: React.FC<SceneProps> = ({ playerMove, opponentMove, isRevealing, isMatchmaking }) => {
  return (
    <div className="absolute inset-0 z-0 bg-[#050505]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 15, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#f97316" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ef4444" />
        <pointLight position={[10, 5, -5]} intensity={0.5} color="#f59e0b" />
        
        <Suspense fallback={null}>
          <Arena />
          
          {/* Player Hand */}
          <Hand 
            position={[0, -1, 3]} 
            rotation={[0, Math.PI, 0]} 
            move={playerMove} 
            isRevealing={isRevealing} 
          />
          
          {/* Opponent Hand */}
          <Hand 
            position={[0, 1, -3]} 
            rotation={[0, 0, 0]} 
            move={opponentMove} 
            isOpponent 
            isRevealing={isRevealing} 
          />

          {/* Background Atmosphere */}
          <Stars radius={150} depth={100} count={3000} factor={6} saturation={0} fade speed={0.5} />
          <Environment preset="city" />
        </Suspense>

        {/* Post-processing */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={2} 
            radius={0.6} 
          />
        </EffectComposer>

        {/* Controls (Disabled during game, enabled for menu/matchmaking) */}
        {isMatchmaking && <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />}
      </Canvas>
    </div>
  );
};
