import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Trophy, Target, Clock } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrorHandler';

interface MatchHistoryProps {
  profile: UserProfile;
  onClose: () => void;
}

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

export const MatchHistory: React.FC<MatchHistoryProps> = ({ profile, onClose }) => {
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile.uid) return;

    const historyRef = collection(db, 'users', profile.uid, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));

    const unsub = onSnapshot(q, (snapshot) => {
      const entries: MatchHistoryEntry[] = [];
      snapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as MatchHistoryEntry);
      });
      setHistory(entries);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/history`);
      setLoading(false);
    });

    return () => unsub();
  }, [profile.uid]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl font-orbitron">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-sm overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tighter text-white uppercase not-italic">Match History</h2>
              <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Recent Combat Logs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-sm transition-colors text-zinc-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <p className="text-[10px] text-zinc-500 font-black tracking-[0.3em] uppercase">Retrieving Logs...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 border-2 border-dashed border-white/5 rounded-sm">
              <History className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">No matches recorded yet</p>
            </div>
          ) : (
            history.map((match) => (
              <motion.div 
                key={match.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-sm border flex items-center justify-between transition-all hover:translate-x-1 bg-zinc-900/50 border-white/5`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-black italic text-lg ${
                    match.result === 'win' ? 'text-green-500 bg-green-500/10' : 
                    match.result === 'loss' ? 'text-red-500 bg-red-500/10' : 
                    'text-zinc-400 bg-white/5'
                  }`}>
                    {match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : 'D'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white uppercase tracking-tight">vs {match.opponentName}</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded-sm text-zinc-500 font-black uppercase tracking-widest">
                        {match.mode === 'single' ? 'PRACTICE' : match.mode === 'multi-ranked' ? 'RANKED' : 'PRIVATE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {match.timestamp?.toMillis ? new Date(match.timestamp.toMillis()).toLocaleDateString() : 'Recent'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Score: {match.playerScore} - {match.opponentScore}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`text-xs font-black italic ${
                  match.result === 'win' ? 'text-green-500' : 
                  match.result === 'loss' ? 'text-red-500' : 
                  'text-zinc-400'
                }`}>
                  {match.previousElo !== undefined ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500 opacity-50">{match.previousElo}</span>
                      <span className="text-[10px] text-zinc-400">{match.eloChange >= 0 ? '+' : ''}{match.eloChange}</span>
                    </div>
                  ) : (
                    match.result === 'win' ? '+25 ELO' : match.result === 'loss' ? '-15 ELO' : '+0 ELO'
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
