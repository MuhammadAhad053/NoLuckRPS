import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, User, Shield, Target, Flame, BarChart3, History } from 'lucide-react';
import { Button } from './Button';
import { UserProfile, LeaderboardEntry } from '@/src/types';
import { LeaderboardSort } from '@/src/hooks/useLeaderboard';
import { RANKS } from '@/src/constants';
import { RankBadge } from '../RankBadge';
import { Rank } from '@/src/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  sortBy: LeaderboardSort;
  onSortChange: (sort: LeaderboardSort) => void;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, sortBy, onSortChange, onClose }) => {
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
        className="relative w-full max-w-5xl bg-black border border-white/5 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-10 border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-transparent gap-8">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">GLOBAL <span className="text-orange-500">RANKINGS</span></h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">The World's Most Lethal Players</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-sm border border-white/5">
            <button 
              onClick={() => onSortChange('elo')}
              className={`px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'elo' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 italic' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              RATING (ELO)
            </button>
            <button 
              onClick={() => onSortChange('wins')}
              className={`px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'wins' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 italic' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              ONLINE WINS
            </button>
            <button 
              onClick={() => onSortChange('botWins')}
              className={`px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'botWins' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 italic' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              BOT WINS
            </button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="absolute top-6 right-6 lg:static p-3 rounded-sm bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md">
              <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                <th className="px-10 py-6">RANK</th>
                <th className="px-10 py-6">PLAYER</th>
                <th className="px-10 py-6">RATING</th>
                <th className="px-10 py-6">{sortBy === 'botWins' ? 'BOT WINS' : 'WINS'}</th>
                <th className="px-10 py-6">TIER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry, index) => (
                <motion.tr 
                  key={entry.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-white/5 transition-all group cursor-default"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-3xl font-black italic tracking-tighter",
                        index === 0 ? "text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" : 
                        index === 1 ? "text-zinc-400" : 
                        index === 2 ? "text-orange-500" : "text-zinc-700"
                      )}>
                        #{index + 1}
                      </span>
                      {index < 3 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Trophy className={cn(
                            "w-4 h-4",
                            index === 0 ? "text-yellow-500" : 
                            index === 1 ? "text-zinc-400" : 
                            index === 2 ? "text-orange-500" : "hidden"
                          )} />
                        </motion.div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <img 
                          src={entry.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.uid}`} 
                          alt="Avatar" 
                          className="w-12 h-12 rounded-full border-2 border-white/10 p-1 bg-zinc-900 shadow-xl group-hover:border-orange-500/50 transition-all"
                        />
                        {index === 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg">
                            <Trophy className="w-3 h-3 text-black" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-black uppercase italic tracking-tight text-lg group-hover:text-orange-500 transition-colors">{entry.displayName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-2xl font-black text-white italic tracking-tighter">{entry.elo}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-xl italic tracking-tighter">{sortBy === 'botWins' ? (entry.botWins || 0) : entry.wins}</span>
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">VICTORIES</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <RankBadge rank={entry.rank as Rank} size="sm" showName={false} className="shadow-lg" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-8 bg-black/40 border-t border-white/5 text-center">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">
            GRID SYNCHRONIZATION: <span className="text-orange-500 animate-pulse">ACTIVE</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
