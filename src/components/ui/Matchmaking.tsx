import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, X, Shield, Trophy, Target, Zap, Search, AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from './Button';
import { UserProfile } from '@/src/types';
import { RANKS } from '@/src/constants';

interface MatchmakingProps {
  profile: UserProfile;
  onCancel: () => void;
  status: 'searching' | 'found' | 'error';
  opponent?: {
    displayName: string;
    username: string;
    elo: number;
    rank: string;
    photoURL?: string;
  };
  partyCode?: string;
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ profile, onCancel, status, opponent, partyCode }) => {
  const [searchTime, setSearchTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const currentRank = RANKS[profile.rank];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'searching') {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyCode = () => {
    if (!partyCode) return;
    navigator.clipboard.writeText(partyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black font-orbitron overflow-hidden"
    >
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-red-600/5 blur-[200px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center px-4">
        <AnimatePresence mode="wait">
          {status === 'searching' ? (
            <motion.div 
              key="searching"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center space-y-8 md:space-y-12"
            >
              {/* Searching Animation */}
              <div className="relative">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-red-500/10 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-t-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    className="absolute inset-2 md:inset-4 rounded-full border-4 border-b-red-500/30"
                  />
                  <img 
                    src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                    alt="Me" 
                    className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-zinc-950 bg-zinc-900 shadow-2xl"
                    style={{ borderColor: currentRank.color }}
                  />
                </div>
                <div 
                  className="absolute -bottom-3 md:-bottom-4 left-1/2 -translate-x-1/2 px-4 md:px-6 py-1 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border-2 border-zinc-950 shadow-xl"
                  style={{ backgroundColor: currentRank.color, color: profile.rank === 'Champion' ? 'white' : 'black' }}
                >
                  {profile.rank}
                </div>
              </div>

              <div className="text-center space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                    {partyCode ? 'WAITING FOR' : 'SEARCHING FOR'} <span className="text-red-500">{partyCode ? 'FRIEND' : 'OPPONENT'}</span>
                  </h2>
                  <p className="text-zinc-500 font-bold tracking-[0.4em] uppercase text-[8px] md:text-[10px] animate-pulse">
                    Tactical Protocol Active
                  </p>
                </div>
                
                {partyCode && (
                  <div className="flex flex-col items-center space-y-3 md:space-y-4">
                    <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Share Party Code</p>
                    <div 
                      onClick={copyCode}
                      className="group relative flex items-center gap-4 md:gap-6 bg-zinc-900/50 border border-white/5 px-6 md:px-10 py-3 md:py-5 rounded-2xl md:rounded-3xl cursor-pointer hover:bg-zinc-900 transition-all hover:border-red-500/30"
                    >
                      <span className="text-2xl md:text-5xl font-black tracking-[0.4em] text-white font-mono">{partyCode}</span>
                      {copied ? <Check className="w-5 h-5 md:w-8 md:h-8 text-green-500" /> : <Copy className="w-5 h-5 md:w-8 md:h-8 text-zinc-500 group-hover:text-white" />}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-6 md:gap-10 bg-white/5 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-white/5">
                  <div className="flex flex-col items-center">
                    <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2">Time Elapsed</p>
                    <p className="text-xl md:text-3xl font-black text-white font-mono italic">{formatTime(searchTime)}</p>
                  </div>
                  {!partyCode && (
                    <>
                      <div className="w-px h-8 md:h-12 bg-white/10" />
                      <div className="flex flex-col items-center">
                        <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2">ELO Range</p>
                        <p className="text-xl md:text-3xl font-black text-red-500 font-mono italic">±100</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button 
                onClick={onCancel}
                variant="ghost" 
                size="lg" 
                className="text-zinc-500 hover:text-red-500 hover:bg-red-500/5 border border-white/5 px-8 md:px-10 py-4 md:py-6 font-black tracking-widest uppercase text-[10px] md:text-xs"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Abort Protocol
              </Button>
            </motion.div>
          ) : status === 'found' ? (
            <motion.div 
              key="found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-8 md:space-y-16 w-full"
            >
              <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 md:gap-24">
                {/* ME */}
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                  className="flex flex-col items-center space-y-4 md:space-y-6"
                >
                  <div className="relative group">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-red-500 blur-3xl rounded-full"
                    />
                    <img 
                      src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                      alt="Me" 
                      className="w-32 h-32 md:w-48 md:h-48 rounded-sm border-4 p-2 bg-zinc-900 shadow-2xl relative z-10"
                      style={{ borderColor: currentRank.color }}
                    />
                    <div 
                      className="absolute -bottom-2 md:-bottom-3 -right-2 md:-right-3 px-3 md:px-5 py-1 md:py-2 rounded-sm text-[8px] md:text-[10px] font-black uppercase tracking-widest border-2 border-zinc-950 shadow-xl z-20"
                      style={{ backgroundColor: currentRank.color, color: profile.rank === 'Champion' ? 'white' : 'black' }}
                    >
                      {profile.rank}
                    </div>
                  </div>
                  <div className="text-center relative z-10">
                    <p className="text-white font-black text-xl md:text-3xl uppercase italic tracking-tighter">{profile.displayName}</p>
                    <p className="text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1 md:mt-2">{profile.username}</p>
                  </div>
                </motion.div>

                {/* VS */}
                <div className="relative flex flex-col items-center justify-center">
                  <motion.div 
                    initial={{ scale: 5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                    className="text-6xl md:text-[12rem] font-black text-white italic uppercase leading-none tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                  >
                    VS
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Zap className="w-12 h-12 md:w-24 md:h-24 text-red-500 fill-red-500 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]" />
                  </motion.div>
                </div>

                {/* OPPONENT */}
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                  className="flex flex-col items-center space-y-4 md:space-y-6"
                >
                  <div className="relative group">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                      className="absolute inset-0 bg-red-500 blur-3xl rounded-full"
                    />
                    <img 
                      src={opponent?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.username}`} 
                      alt="Opponent" 
                      className="w-32 h-32 md:w-48 md:h-48 rounded-sm border-4 p-2 bg-zinc-900 shadow-2xl relative z-10"
                      style={{ borderColor: opponent ? RANKS[opponent.rank as keyof typeof RANKS]?.color : '#dc2626' }}
                    />
                    <div 
                      className="absolute -bottom-2 md:-bottom-3 -right-2 md:-right-3 px-3 md:px-5 py-1 md:py-2 rounded-sm text-[8px] md:text-[10px] font-black uppercase tracking-widest border-2 border-zinc-950 shadow-xl z-20"
                      style={{ 
                        backgroundColor: opponent ? RANKS[opponent.rank as keyof typeof RANKS]?.color : '#dc2626',
                        color: opponent?.rank === 'Champion' ? 'white' : 'black'
                      }}
                    >
                      {opponent?.rank}
                    </div>
                  </div>
                  <div className="text-center relative z-10">
                    <p className="text-white font-black text-xl md:text-3xl uppercase italic tracking-tighter">{opponent?.displayName}</p>
                    <p className="text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1 md:mt-2">{opponent?.username}</p>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center space-y-4"
              >
                <h3 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">MATCH ESTABLISHED</h3>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-8 md:w-12 bg-red-500/50" />
                  <p className="text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing Arena Parameters</p>
                  <div className="h-px w-8 md:w-12 bg-red-500/50" />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-10 text-center"
            >
              <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">PROTOCOL FAILURE</h3>
                <p className="text-zinc-500 text-sm max-w-xs uppercase tracking-wider font-bold">Connection to matchmaking grid was interrupted. Please re-initialize.</p>
              </div>
              <Button 
                onClick={onCancel}
                className="bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 px-12 py-6 font-black tracking-widest uppercase text-xs"
              >
                Return to Base
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
