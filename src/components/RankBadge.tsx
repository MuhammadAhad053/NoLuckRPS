import React from 'react';
import { motion } from 'motion/react';
import { RANKS } from '../constants';
import { Rank } from '../types';
import { cn } from '../lib/utils';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg' | 'xs';
  showName?: boolean;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md', showName = true, className }) => {
  const rankData = RANKS[rank] || RANKS['Plastic'];
  const Icon = rankData.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[6px] gap-0.5',
    sm: 'px-2 py-0.5 text-[8px] gap-1',
    md: 'px-3 py-1 text-[10px] gap-1.5',
    lg: 'px-6 py-2 text-sm gap-2',
  };

  const iconSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5',
  };

  const isChampion = rank === 'Champion';
  const isDiamond = rank === 'Diamond';
  const isPlatinum = rank === 'Platinum';
  const isPlastic = rank === 'Plastic';

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Champion Wings & Glow */}
      {isChampion && (
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.4 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
            className="absolute w-full h-full bg-orange-500/30 blur-2xl rounded-full"
          />
          {/* Wings */}
          <div className="absolute -inset-x-12 top-1/2 -translate-y-1/2 flex justify-between w-[calc(100%+6rem)]">
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: -20 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              className="w-12 h-12 text-orange-600"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20, rotate: 20 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              className="w-12 h-12 text-orange-600 scale-x-[-1]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </motion.div>
          </div>
          {/* Crown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -24 }}
            className="absolute top-0 text-yellow-500"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
            </svg>
          </motion.div>
        </div>
      )}

      <motion.div
        whileHover={{ scale: 1.05 }}
        className={cn(
          "relative font-black uppercase tracking-widest flex items-center justify-center shadow-xl",
          sizeClasses[size],
          isDiamond ? "rotate-45 rounded-sm" : "rounded-full",
          isChampion && "border-2 border-white/80 bg-gradient-to-b from-red-500 to-red-700",
          isDiamond && "border-2 border-blue-400 bg-gradient-to-br from-blue-600 to-blue-900",
          isPlatinum && "border-2 border-sky-300 bg-gradient-to-br from-sky-400 to-sky-600",
          isPlastic && "bg-zinc-500 opacity-80 grayscale-[0.3] border border-zinc-600"
        )}
        style={{ 
          backgroundColor: !isChampion && !isDiamond && !isPlatinum ? rankData.color : undefined,
          color: isChampion || isDiamond || isPlatinum ? 'white' : 'black',
        }}
      >
        <div className={cn("flex items-center gap-1.5", isDiamond && "-rotate-45")}>
          <Icon className={iconSizes[size]} />
          {showName && <span>{rank}</span>}
        </div>
      </motion.div>
    </div>
  );
};
