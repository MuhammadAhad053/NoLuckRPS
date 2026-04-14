import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Move, GameResult, UserProfile } from '../../types';
import { Button } from './Button';
import { Trophy, Shield, Target, Zap, X, Hand, Scissors, Sword } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GameOverlayProps {
  countdown: number | null;
  turnTimer: number | null;
  playerMove: Move;
  opponentMove: Move;
  result: GameResult;
  onMove: (move: Move) => void;
  isRevealing: boolean;
  onExit: () => void;
  playerScore: number;
  opponentScore: number;
  round: number;
  matchResult: GameResult;
  opponent?: UserProfile | null;
  profile: UserProfile;
}

const COLOR_MAP: Record<string, { glow: string; gradient: string; button: string }> = {
  'text-red-500': { glow: 'bg-red-500', gradient: 'from-white via-red-500 to-red-700', button: 'bg-red-600 hover:bg-red-500 shadow-[0_0_30px_rgba(220,38,38,0.3)]' },
  'text-green-500': { glow: 'bg-green-500', gradient: 'from-white via-green-500 to-green-700', button: 'bg-green-600 hover:bg-green-500 shadow-[0_0_30px_rgba(22,163,74,0.3)]' },
  'text-blue-500': { glow: 'bg-blue-500', gradient: 'from-white via-blue-500 to-blue-700', button: 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]' },
  'text-purple-500': { glow: 'bg-purple-500', gradient: 'from-white via-purple-500 to-purple-700', button: 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.3)]' },
  'text-yellow-500': { glow: 'bg-yellow-500', gradient: 'from-white via-yellow-500 to-yellow-700', button: 'bg-yellow-600 hover:bg-yellow-500 shadow-[0_0_30px_rgba(202,138,4,0.3)]' },
  'text-red-600': { glow: 'bg-red-600', gradient: 'from-white via-red-600 to-red-900', button: 'bg-red-700 hover:bg-red-600 shadow-[0_0_30px_rgba(185,28,28,0.3)]' },
  'text-orange-600': { glow: 'bg-orange-600', gradient: 'from-white via-orange-600 to-orange-900', button: 'bg-orange-700 hover:bg-orange-600 shadow-[0_0_30_rgba(194,65,12,0.3)]' },
  'text-zinc-600': { glow: 'bg-zinc-600', gradient: 'from-white via-zinc-600 to-zinc-900', button: 'bg-zinc-700 hover:bg-zinc-600 shadow-[0_0_30px_rgba(82,82,82,0.3)]' },
  'text-lime-600': { glow: 'bg-lime-600', gradient: 'from-white via-lime-600 to-zinc-900', button: 'bg-lime-700 hover:bg-lime-600 shadow-[0_0_30px_rgba(77,124,15,0.3)]' },
  'text-blue-900': { glow: 'bg-blue-900', gradient: 'from-white via-blue-900 to-black', button: 'bg-blue-950 hover:bg-blue-900 shadow-[0_0_30px_rgba(30,58,138,0.3)]' },
};

export const GameOverlay: React.FC<GameOverlayProps> = ({ 
  countdown, 
  turnTimer,
  playerMove, 
  opponentMove, 
  result, 
  onMove, 
  isRevealing,
  onExit,
  playerScore,
  opponentScore,
  round,
  matchResult,
  opponent,
  profile
}) => {
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  const winVisuals = COLOR_MAP[profile.winColor || 'text-red-500'] || COLOR_MAP['text-red-500'];
  const lossVisuals = COLOR_MAP[profile.lossColor || 'text-red-600'] || COLOR_MAP['text-red-600'];

  return (
    <div className="absolute inset-0 z-20 flex flex-col pointer-events-none font-orbitron">
      
      {/* Top Bar: Opponent Info & Score */}
      <div className="p-4 md:p-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-8">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3 md:gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] w-full md:w-auto">
            <div className="relative">
              <img 
                src={opponent?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.username || 'bot'}`} 
                alt="Opponent" 
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border border-red-500/20 bg-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse" />
            </div>
            <div>
              <p className="text-zinc-500 text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em]">Opponent</p>
              <h3 className="text-white font-black uppercase tracking-tight text-xs md:text-sm truncate max-w-[100px] md:max-w-none">{opponent?.displayName || 'CyberBot v1.0'}</h3>
              <p className="text-red-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest">ELO: {opponent?.elo || '???'}</p>
            </div>
          </div>

          {/* Match Score */}
          <div className="flex items-center justify-center gap-4 md:gap-6 bg-black/60 backdrop-blur-xl border border-white/10 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] w-full md:w-auto">
            <div className="text-center">
              <p className="text-zinc-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-0.5 md:mb-1">Round</p>
              <p className="text-xl md:text-2xl font-black text-white italic leading-none">{round}</p>
            </div>
            <div className="w-px h-6 md:h-8 bg-white/10" />
            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-red-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-0.5 md:mb-1">You</p>
                <p className="text-2xl md:text-3xl font-black text-white leading-none">{playerScore}</p>
              </div>
              <p className="text-zinc-600 font-black italic text-lg md:text-xl">VS</p>
              <div className="text-center">
                <p className="text-red-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-0.5 md:mb-1">Opp</p>
                <p className="text-2xl md:text-3xl font-black text-white leading-none">{opponentScore}</p>
              </div>
            </div>
          </div>

          {/* Turn Timer */}
          {turnTimer !== null && (
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl flex flex-col items-center justify-center min-w-[80px] md:min-w-[100px] shadow-[0_0_20px_rgba(239,68,68,0.1)] w-full md:w-auto">
              <p className="text-red-500 text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-0.5 md:mb-1">Time Left</p>
              <p className={cn(
                "text-xl md:text-2xl font-black italic leading-none",
                turnTimer <= 2 ? "text-red-500 animate-pulse" : "text-white"
              )}>{turnTimer}s</p>
            </div>
          )}
        </div>

        <Button 
          onClick={() => setShowExitConfirm(true)}
          variant="ghost" 
          size="sm" 
          className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-red-500/20 hover:text-red-500 font-black tracking-widest uppercase text-[8px] md:text-[10px] w-full md:w-auto py-3 md:py-2"
        >
          <X className="w-3 h-3 md:w-4 md:h-4 mr-2" />
          Exit Match
        </Button>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 p-10 rounded-[2.5rem] max-w-md w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">Abandon Match?</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-10 uppercase tracking-wider font-bold">
                Leaving now will result in an <span className="text-red-500">automatic loss</span> and a reduction in your <span className="text-red-500">ELO rating</span>.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setShowExitConfirm(false)}
                  variant="ghost" 
                  className="flex-1 border border-white/10 py-6 uppercase tracking-widest font-black"
                >
                  Stay
                </Button>
                <Button 
                  onClick={onExit}
                  className="flex-1 bg-red-600 hover:bg-red-500 py-6 uppercase tracking-widest font-black"
                >
                  Forfeit
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Center: Countdown & Result */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {countdown !== null && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-[8rem] md:text-[15rem] font-black italic text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] uppercase tracking-tighter"
            >
              {countdown}
            </motion.div>
          )}

          {matchResult && (
            <motion.div
              key="match-result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 md:gap-10 bg-zinc-950/90 backdrop-blur-3xl p-6 md:p-16 lg:p-20 rounded-sm border-2 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden w-[95%] max-w-4xl mx-auto"
            >
              {/* Animated Background Glow */}
              <motion.div 
                animate={{ 
                   scale: [1, 1.2, 1],
                   opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
                className={cn(
                  "absolute inset-0 blur-[100px] -z-10",
                  matchResult === 'win' ? winVisuals.glow : lossVisuals.glow
                )}
              />

              <div className="flex flex-col items-center gap-2 md:gap-4">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "px-3 md:px-6 py-1 md:py-2 rounded-sm border text-[6px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em]",
                    matchResult === 'win' ? (profile.winColor || "text-red-500") : (profile.lossColor || "text-red-600")
                  )}
                >
                  Match Protocol Concluded
                </motion.div>
                
                <motion.h2 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn(
                    "text-4xl md:text-8xl lg:text-[10rem] font-black italic uppercase tracking-tighter leading-none drop-shadow-2xl",
                    "text-white"
                  )}
                >
                  {matchResult === 'win' ? (
                    <span className={cn("text-transparent bg-clip-text bg-gradient-to-b", winVisuals.gradient)}>VICTORY</span>
                  ) : (
                    <span className={cn("text-transparent bg-clip-text bg-gradient-to-b", lossVisuals.gradient)}>DEFEAT</span>
                  )}
                </motion.h2>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-12 w-full items-center">
                <div className="text-center space-y-0.5 md:space-y-2">
                  <p className="text-zinc-500 text-[6px] md:text-[10px] font-black uppercase tracking-widest">Your Score</p>
                  <p className="text-2xl md:text-6xl font-black text-white italic">{playerScore}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-px w-full bg-white/10 mb-1 md:mb-4" />
                  <p className="text-zinc-600 font-black italic text-[10px] md:text-2xl">FINAL</p>
                  <div className="h-px w-full bg-white/10 mt-1 md:mt-4" />
                </div>
                <div className="text-center space-y-0.5 md:space-y-2">
                  <p className="text-zinc-500 text-[6px] md:text-[10px] font-black uppercase tracking-widest">Opponent</p>
                  <p className="text-2xl md:text-6xl font-black text-white italic">{opponentScore}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Button 
                  onClick={onExit}
                  size="xl" 
                  className={cn(
                    "pointer-events-auto w-full py-4 md:py-8 font-black tracking-[0.1em] md:tracking-[0.3em] uppercase text-xs md:text-lg rounded-sm transition-all",
                    matchResult === 'win' 
                      ? winVisuals.button 
                      : "bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10"
                  )}
                >
                  Return to Base
                </Button>
              </div>
            </motion.div>
          )}

          {result && !matchResult && (
            <motion.div
              key="result"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-4 md:gap-6"
            >
              <h2 className={cn(
                "text-4xl md:text-[8rem] font-black italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] leading-none",
                result === 'win' ? (profile.winColor || "text-red-500") : 
                result === 'loss' ? (profile.lossColor || "text-red-600") : "text-zinc-400"
              )}>
                {result === 'win' ? 'ROUND WIN' : result === 'loss' ? 'ROUND LOSS' : 'DRAW'}
              </h2>
              <div className="px-6 md:px-10 py-2 md:py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full text-white font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px] shadow-2xl">
                {playerMove} vs {opponentMove}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar: Controls */}
      <div className="p-8 md:p-16 flex flex-col items-center gap-6 md:gap-10">
        <AnimatePresence>
          {!playerMove && !isRevealing && !matchResult && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="flex gap-4 md:gap-8 pointer-events-auto"
            >
              <MoveButton move="rock" onClick={() => onMove('rock')} />
              <MoveButton move="paper" onClick={() => onMove('paper')} />
              <MoveButton move="scissors" onClick={() => onMove('scissors')} />
            </motion.div>
          )}

          {playerMove && !isRevealing && !matchResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[8px] md:text-[10px] animate-pulse bg-red-500/5 px-6 md:px-8 py-2 md:py-3 rounded-full border border-red-500/20"
            >
              Waiting for reveal...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

const MoveButton = ({ move, onClick }: { move: Move; onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1, y: -15 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="group relative w-24 h-24 md:w-32 md:h-32 bg-zinc-950 border-2 border-white/5 rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-2 md:gap-3 transition-all hover:border-red-500/50 hover:bg-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
  >
    <div className="text-zinc-500 group-hover:text-red-500 transition-colors">
      {move === 'rock' ? <Hand className="w-8 h-8 md:w-12 md:h-12 rotate-[-45deg]" /> : 
       move === 'paper' ? <Hand className="w-8 h-8 md:w-12 md:h-12" /> : 
       <Scissors className="w-8 h-8 md:w-12 md:h-12 rotate-90" />}
    </div>
    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-red-500 transition-colors">
      {move}
    </span>
    <div className="absolute inset-0 rounded-2xl md:rounded-[2rem] bg-red-500/0 group-hover:bg-red-500/5 transition-colors" />
  </motion.button>
);

import { AlertTriangle } from 'lucide-react';
