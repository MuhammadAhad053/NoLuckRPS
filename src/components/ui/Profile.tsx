import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Shield, Flame, BarChart3, History, X, Edit2, Check, AlertCircle, User as UserIcon, Trophy, Zap } from 'lucide-react';
import { Button } from './Button';
import { UserProfile, Move } from '@/src/types';
import { RANKS } from '@/src/constants';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { cn } from '@/src/lib/utils';
import { RankBadge } from '../RankBadge';

interface MatchHistoryEntry {
  id: string;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  playerScore: number;
  opponentScore: number;
  mode: string;
  timestamp: any;
  previousElo?: number;
  eloChange?: number;
}

interface ProfileProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateUsername: (newUsername: string) => Promise<any>;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onClose, onUpdateUsername }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);

  useEffect(() => {
    setNewUsername(profile.username);
  }, [profile.username]);

  const currentRank = RANKS[profile.rank];
  const nextRank = currentRank.nextRank ? RANKS[currentRank.nextRank] : null;
  const eloProgress = nextRank ? ((profile.elo - currentRank.minElo) / (nextRank.minElo - currentRank.minElo)) * 100 : 100;

  useEffect(() => {
    if (!profile.uid) return;

    const historyRef = collection(db, 'users', profile.uid, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(10));

    const unsub = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MatchHistoryEntry[];
      setHistory(entries);
    });

    return () => unsub();
  }, [profile.uid]);

  const handleUpdateUsername = async () => {
    if (newUsername === profile.username) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await onUpdateUsername(newUsername);
    setLoading(false);

    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || 'Failed to update username');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md font-orbitron"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-zinc-950 border border-white/5 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-10 border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-transparent">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-sm flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
              <UserIcon className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase not-italic leading-none">PLAYER <span className="text-red-500">DOSSIER</span></h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Combat Statistics & Metadata</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="p-3 rounded-sm bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar">
          
          {/* Left: Avatar & Rank */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-500/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                alt="Avatar" 
                className="w-56 h-56 rounded-sm border-4 p-2 bg-zinc-900 relative z-10 shadow-2xl"
                style={{ borderColor: currentRank.color }}
              />
              <RankBadge 
                rank={profile.rank} 
                size="lg" 
                className="absolute -bottom-4 -right-4 z-20 shadow-2xl scale-125"
              />
            </div>
            
            <div className="space-y-4 w-full">
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{profile.displayName}</h3>
                
                <div className="flex items-center gap-3">
                  <AnimatePresence mode="wait">
                    {profile.isGuest ? (
                      <motion.div
                        key="guest"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <p className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px]">GUEST ACCOUNT</p>
                        <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest max-w-[200px]">
                          Sign in to save your progress and play online!
                        </p>
                      </motion.div>
                    ) : isEditing ? (
                      <motion.div 
                        key="edit"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-3"
                      >
                        <div className="relative">
                          <input 
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            className={cn(
                              "bg-zinc-900 border rounded-sm px-4 py-2 text-xs font-black text-red-500 focus:outline-none w-40 tracking-widest uppercase",
                              error ? "border-red-500" : "border-white/10 focus:border-red-500"
                            )}
                            placeholder="username"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
                          />
                          {error && (
                            <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-red-500 text-[8px] font-black uppercase tracking-widest">
                              <AlertCircle className="w-2.5 h-2.5" />
                              {error}
                            </div>
                          )}
                        </div>
                        <Button 
                          onClick={handleUpdateUsername}
                          disabled={loading}
                          size="sm" 
                          className="p-2 h-10 w-10 bg-green-600 hover:bg-green-700 border-none rounded-sm"
                        >
                          <Check className="w-5 h-5" />
                        </Button>
                        <Button 
                          onClick={() => { setIsEditing(false); setNewUsername(profile.username); setError(null); }}
                          variant="ghost" 
                          size="sm" 
                          className="p-2 h-10 w-10 bg-white/5 rounded-sm border border-white/5"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="view"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-3"
                      >
                        <p className="text-red-500 font-black uppercase tracking-[0.4em] text-xs">{profile.username}</p>
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="p-2 bg-white/5 rounded-sm border border-white/5 text-zinc-500 hover:text-white transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {error && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-red-500/5 px-4 py-2 rounded-sm border border-red-500/10">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="px-4 py-1.5 bg-white/5 rounded-sm border border-white/5">
                  <span className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">ELO: </span>
                  <span className="text-white font-black italic tracking-tighter text-lg">{profile.elo}</span>
                </div>
              </div>
            </div>

            <div className="w-full space-y-3 text-left bg-white/5 p-6 rounded-sm border border-white/5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                <span>RANK PROGRESSION</span>
                <span className="text-red-500">{nextRank ? `${nextRank.minElo - profile.elo} ELO TO ${nextRank.name}` : 'MAXIMUM RANK'}</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-sm overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, eloProgress))}%` }}
                  className="h-full rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  style={{ backgroundColor: currentRank.color }}
                />
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-sm border border-white/5 group hover:border-red-500/30 transition-all">
                <Flame className="w-6 h-6 text-red-500 mb-2 group-hover:scale-125 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">STREAK</span>
                <span className="text-white font-black text-2xl italic tracking-tighter">{profile.streak} 🔥</span>
              </div>
              <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-sm border border-white/5 group hover:border-red-500/30 transition-all">
                <Target className="w-6 h-6 text-red-500 mb-2 group-hover:scale-125 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">FAV MOVE</span>
                <span className="text-white font-black text-2xl italic tracking-tighter uppercase">{profile.favoriteMove || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right: Detailed Stats */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-8 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">WINS</p>
                <p className="text-5xl font-black text-green-500 italic tracking-tighter">{profile.wins}</p>
              </div>
              <div className="p-8 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">LOSSES</p>
                <p className="text-5xl font-black text-red-500 italic tracking-tighter">{profile.losses}</p>
              </div>
              <div className="p-8 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">WIN RATE</p>
                <p className="text-5xl font-black text-red-500 italic tracking-tighter">
                  {profile.matchesPlayed > 0 ? Math.round((profile.wins / profile.matchesPlayed) * 100) : 0}%
                </p>
              </div>
              <div className="p-8 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">MATCHES</p>
                <p className="text-5xl font-black text-white italic tracking-tighter">{profile.matchesPlayed}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h4 className="text-white font-black uppercase tracking-[0.3em] text-sm not-italic">COMBAT LOGS</h4>
                </div>
                <div className="h-px flex-1 bg-white/5 mx-6" />
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                {history.length > 0 ? (
                  history.map((entry, idx) => (
                    <motion.div 
                      key={entry.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 bg-white/5 rounded-sm border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-1 h-8 rounded-full",
                          entry.result === 'win' ? "bg-green-500" : 
                          entry.result === 'loss' ? "bg-red-500" : "bg-zinc-500"
                        )} />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-black text-sm uppercase italic tracking-tight">VS {entry.opponentName}</span>
                            <span className={cn(
                              "text-[8px] font-black px-2 py-0.5 rounded-sm border",
                              entry.result === 'win' ? "text-green-500 border-green-500/20 bg-green-500/5" : 
                              entry.result === 'loss' ? "text-red-500 border-red-500/20 bg-red-500/5" : "text-zinc-500 border-white/5 bg-white/5"
                            )}>
                              {entry.result === 'win' ? 'W' : entry.result === 'loss' ? 'L' : 'D'}
                            </span>
                          </div>
                          <span className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] mt-1">
                            {entry.mode.toUpperCase()} • {entry.playerScore}-{entry.opponentScore}
                          </span>
                        </div>
                      </div>
                      {entry.previousElo !== undefined && (
                        <div className="flex items-center gap-1.5 text-right">
                          <span className="text-[10px] text-zinc-500 opacity-50">{entry.previousElo}</span>
                          <span className={cn(
                            "text-[10px] font-black italic",
                            entry.eloChange >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {entry.eloChange >= 0 ? '+' : ''}{entry.eloChange}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="p-20 text-center bg-white/5 rounded-sm border border-dashed border-white/10">
                    <div className="w-16 h-16 bg-white/5 rounded-sm flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <BarChart3 className="w-8 h-8 text-zinc-800" />
                    </div>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">No combat data recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};
