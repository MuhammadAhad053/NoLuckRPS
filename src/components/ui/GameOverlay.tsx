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
}

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
  opponent
}) => {
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  return (
    <div className="absolute inset-0 z-20 flex flex-col pointer-events-none font-orbitron">
      
      {/* Top Bar: Opponent Info & Score */}
      <div className="p-8 flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="relative">
              <img 
                src={opponent?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.username || 'bot'}`} 
                alt="Opponent" 
                className="w-12 h-12 rounded-xl border border-red-500/20 bg-zinc-800"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse" />
            </div>
            <div>
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em]">Opponent</p>
              <h3 className="text-white font-black uppercase tracking-tight text-sm">{opponent?.displayName || 'CyberBot v1.0'}</h3>
              <p className="text-red-500 text-[8px] font-black uppercase tracking-widest">ELO: {opponent?.elo || '???'}</p>
            </div>
          </div>

          {/* Match Score */}
          <div className="flex items-center gap-6 bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="text-center">
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1">Round</p>
              <p className="text-2xl font-black text-white italic">{round}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-red-500 text-[8px] font-black uppercase tracking-widest mb-1">You</p>
                <p className="text-3xl font-black text-white">{playerScore}</p>
              </div>
              <p className="text-zinc-600 font-black italic text-xl">VS</p>
              <div className="text-center">
                <p className="text-red-500 text-[8px] font-black uppercase tracking-widest mb-1">Opp</p>
                <p className="text-3xl font-black text-white">{opponentScore}</p>
              </div>
            </div>
          </div>

          {/* Turn Timer */}
          {turnTimer !== null && (
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 px-6 py-4 rounded-2xl flex flex-col items-center justify-center min-w-[100px] shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <p className="text-red-500 text-[8px] font-black uppercase tracking-widest mb-1">Time Left</p>
              <p className={cn(
                "text-2xl font-black italic",
                turnTimer <= 2 ? "text-red-500 animate-pulse" : "text-white"
              )}>{turnTimer}s</p>
            </div>
          )}
        </div>

        <Button 
          onClick={() => setShowExitConfirm(true)}
          variant="ghost" 
          size="sm" 
          className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 hover:bg-red-500/20 hover:text-red-500 font-black tracking-widest uppercase text-[10px]"
        >
          <X className="w-4 h-4 mr-2" />
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
              className="text-[15rem] font-black italic text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] uppercase tracking-tighter"
            >
              {countdown}
            </motion.div>
          )}

          {matchResult && (
            <motion.div
              key="match-result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-10 bg-zinc-950/90 backdrop-blur-3xl p-20 rounded-sm border-2 border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
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
                  matchResult === 'win' ? "bg-red-500" : "bg-red-600"
                )}
              />

              <div className="flex flex-col items-center gap-4">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "px-6 py-2 rounded-sm border text-[10px] font-black uppercase tracking-[0.5em]",
                    matchResult === 'win' ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-red-500/30 text-red-500 bg-red-500/5"
                  )}
                >
                  Match Protocol Concluded
                </motion.div>
                
                <motion.h2 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn(
                    "text-[12rem] font-black italic uppercase tracking-tighter leading-none drop-shadow-2xl",
                    matchResult === 'win' ? "text-white" : "text-white"
                  )}
                >
                  {matchResult === 'win' ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-red-500 to-red-700">VICTORY</span>
                  ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-red-600 to-red-900">DEFEAT</span>
                  )}
                </motion.h2>
              </div>

              <div className="grid grid-cols-3 gap-12 w-full max-w-2xl items-center">
                <div className="text-center space-y-2">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Your Score</p>
                  <p className="text-6xl font-black text-white italic">{playerScore}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-px w-full bg-white/10 mb-4" />
                  <p className="text-zinc-600 font-black italic text-2xl">FINAL</p>
                  <div className="h-px w-full bg-white/10 mt-4" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Opponent</p>
                  <p className="text-6xl font-black text-white italic">{opponentScore}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <Button 
                  onClick={onExit}
                  size="xl" 
                  className={cn(
                    "pointer-events-auto w-full py-8 font-black tracking-[0.3em] uppercase text-lg rounded-sm transition-all",
                    matchResult === 'win' 
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]" 
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
              className="flex flex-col items-center gap-6"
            >
              <h2 className={cn(
                "text-[8rem] font-black italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] leading-none",
                result === 'win' ? "text-red-500" : 
                result === 'loss' ? "text-red-600" : "text-zinc-400"
              )}>
                {result === 'win' ? 'ROUND WIN' : result === 'loss' ? 'ROUND LOSS' : 'DRAW'}
              </h2>
              <div className="px-10 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl">
                {playerMove} vs {opponentMove}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Bar: Controls */}
      <div className="p-16 flex flex-col items-center gap-10">
        <AnimatePresence>
          {!playerMove && !isRevealing && !matchResult && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="flex gap-8 pointer-events-auto"
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
              className="text-red-500 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse bg-red-500/5 px-8 py-3 rounded-full border border-red-500/20"
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
    className="group relative w-32 h-32 bg-zinc-950 border-2 border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all hover:border-red-500/50 hover:bg-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
  >
    <div className="text-zinc-500 group-hover:text-red-500 transition-colors">
      {move === 'rock' ? <Hand className="w-12 h-12 rotate-[-45deg]" /> : 
       move === 'paper' ? <Hand className="w-12 h-12" /> : 
       <Scissors className="w-12 h-12 rotate-90" />}
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-red-500 transition-colors">
      {move}
    </span>
    <div className="absolute inset-0 rounded-[2rem] bg-red-500/0 group-hover:bg-red-500/5 transition-colors" />
  </motion.button>
);

import { AlertTriangle } from 'lucide-react';
