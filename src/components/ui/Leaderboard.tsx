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
  profile: UserProfile;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, sortBy, onSortChange, onClose, profile }) => {
  const userIndex = entries.findIndex(e => e.uid === profile.uid);
  const userEntry = userIndex !== -1 ? entries[userIndex] : null;
  const top5 = entries.slice(0, 5);
  const others = entries.slice(5);

  const renderRow = (entry: LeaderboardEntry, index: number, isUser: boolean = false) => (
    <motion.tr 
      key={entry.uid + (isUser ? '-user' : '')}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "hover:bg-white/5 transition-all group cursor-default",
        isUser ? "bg-red-500/10 border-y border-red-500/20" : ""
      )}
    >
      <td className="px-4 md:px-10 py-4 md:py-6">
        <div className="flex items-center gap-2 md:gap-4">
          <span className={cn(
            "text-xl md:text-3xl font-black italic tracking-tighter pr-2",
            index === 0 ? "text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" : 
            index === 1 ? "text-zinc-400" : 
            index === 2 ? "text-red-500" : "text-zinc-700",
            isUser && index > 2 ? "text-red-400" : ""
          )}>
            #{index + 1}
          </span>
        </div>
      </td>
      <td className="px-4 md:px-10 py-4 md:py-6">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="relative">
            <img 
              src={entry.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.uid}`} 
              alt="Avatar" 
              className={cn(
                "w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/10 p-0.5 md:p-1 bg-zinc-900 shadow-xl group-hover:border-red-500/50 transition-all",
                isUser ? "border-red-500/50" : ""
              )}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black uppercase italic tracking-tight text-xs md:text-lg group-hover:text-red-500 transition-colors truncate max-w-[100px] md:max-w-none pr-2">
              {entry.displayName}
              {isUser && <span className="ml-2 text-[8px] text-red-500 not-italic tracking-widest">(YOU)</span>}
            </span>
          </div>
        </div>
      </td>
      
      {sortBy === 'elo' && (
        <td className="px-4 md:px-10 py-4 md:py-6">
          <div className="flex items-center gap-1 md:gap-2">
            <Flame className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
            <span className="text-lg md:text-2xl font-black text-white italic tracking-tighter pr-2">{entry.elo}</span>
          </div>
        </td>
      )}

      {(sortBy === 'wins' || sortBy === 'botWins') && (
        <td className="px-4 md:px-10 py-4 md:py-6">
          <div className="flex flex-col">
            <span className="text-white font-black text-base md:text-xl italic tracking-tighter pr-2">
              {sortBy === 'botWins' ? (entry.botWins || 0) : entry.wins}
            </span>
          </div>
        </td>
      )}

      <td className="px-4 md:px-10 py-4 md:py-6">
        <RankBadge rank={entry.rank as Rank} size="xs" showName={false} className="shadow-lg md:hidden" />
        <RankBadge rank={entry.rank as Rank} size="sm" showName={false} className="shadow-lg hidden md:block" />
      </td>
    </motion.tr>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md font-orbitron"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-black border border-white/5 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-[90vh] md:h-[85vh]"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 md:p-10 border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-transparent gap-6 md:gap-8 flex-none">
          <div className="flex items-center gap-4 md:gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none pr-2">GLOBAL <span className="text-red-500">RANKINGS</span></h2>
              <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mt-2">The World's Most Lethal Players</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white/5 p-2 rounded-sm border border-white/5">
            <button 
              onClick={() => onSortChange('elo')}
              className={`flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 rounded-sm text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'elo' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 italic' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              ELO
            </button>
            <button 
              onClick={() => onSortChange('wins')}
              className={`flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 rounded-sm text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'wins' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 italic' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              WINS
            </button>
            <button 
              onClick={() => onSortChange('botWins')}
              className={`flex-1 md:flex-none px-3 md:px-6 py-2 md:py-3 rounded-sm text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'botWins' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 italic' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              BOT
            </button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="absolute top-4 right-4 lg:static p-2 md:p-3 rounded-sm bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead className="bg-zinc-950/90 backdrop-blur-md">
              <tr className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] border-b border-white/5">
                <th className="px-4 md:px-10 py-4 md:py-6">RANK</th>
                <th className="px-4 md:px-10 py-4 md:py-6">PLAYER</th>
                {sortBy === 'elo' && <th className="px-4 md:px-10 py-4 md:py-6">RATING</th>}
                {sortBy === 'wins' && <th className="px-4 md:px-10 py-4 md:py-6">WINS</th>}
                {sortBy === 'botWins' && <th className="px-4 md:px-10 py-4 md:py-6">BOT WINS</th>}
                <th className="px-4 md:px-10 py-4 md:py-6">TIER</th>
              </tr>
            </thead>
          </table>

          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
              <tbody className="divide-y divide-white/5">
                {/* Top 5 */}
                {top5.map((entry, index) => renderRow(entry, index))}

                {/* Separator and User Entry if rank > 5 */}
                {userIndex >= 5 && userEntry && (
                  <>
                    <tr className="bg-zinc-900/50">
                      <td colSpan={4} className="px-10 py-2 text-[8px] text-zinc-700 font-black tracking-[1em] text-center">
                        •••
                      </td>
                    </tr>
                    {renderRow(userEntry, userIndex, true)}
                  </>
                )}

                {/* The rest */}
                {others.map((entry, index) => {
                  const actualIndex = index + 5;
                  // Skip if it's the user entry we already rendered
                  if (actualIndex === userIndex) return null;
                  return renderRow(entry, actualIndex);
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 text-center flex-none">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">
            GRID SYNCHRONIZATION: <span className="text-red-500 animate-pulse">ACTIVE</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
