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

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const textSizes = {
    xs: 'text-[6px]',
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-sm',
  };

  // Helper to get rank-specific styling based on the reference image
  const getRankStyle = () => {
    switch (rank) {
      case 'Plastic':
        return {
          frame: 'M12 2L15 4L20 7L21 12L19 18L12 22L5 18L3 12L4 7L9 4L12 2Z',
          color: '#52525b',
          accent: '#a1a1aa',
          hasWings: false,
          isSpiky: false,
          hideStar: true
        };
      case 'Bronze':
        return {
          frame: 'M12 2L4 5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V5l-8-3z',
          color: '#78350f',
          accent: '#a1a1aa',
          hasWings: false,
          isSpiky: false,
          hideStar: false
        };
      case 'Silver':
        return {
          frame: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
          color: '#475569',
          accent: '#cbd5e1',
          hasWings: false,
          isSpiky: false,
          hideStar: false
        };
      case 'Gold':
        return {
          frame: 'M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z',
          color: '#854d0e',
          accent: '#facc15',
          hasWings: false,
          isSpiky: true,
          hideStar: false
        };
      case 'Platinum':
      case 'Diamond':
        return {
          frame: 'M12 2L4 5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V5l-8-3z',
          color: rank === 'Platinum' ? '#0e7490' : '#1e40af',
          accent: rank === 'Platinum' ? '#22d3ee' : '#60a5fa',
          hasWings: true,
          isSpiky: false,
          hideStar: false
        };
      case 'Champion':
        return {
          frame: 'M12 2L4 5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V5l-8-3z',
          color: '#991b1b',
          accent: '#fbbf24', // Golden accent
          hasWings: true,
          isSpiky: true,
          hideStar: false
        };
      default:
        return {
          frame: 'M12 2L4 5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12V5l-8-3z',
          color: '#52525b',
          accent: '#a1a1aa',
          hasWings: false,
          isSpiky: false,
          hideStar: false
        };
    }
  };

  const style = getRankStyle();

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Wings for high ranks */}
        {style.hasWings && (
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: rank === 'Champion' ? 1.6 : 1.4, opacity: rank === 'Champion' ? 1 : 0.8 }}
              transition={{ repeat: Infinity, duration: 3, repeatType: 'reverse' }}
              className="w-full h-full"
            >
              <svg viewBox="0 0 24 24" fill={rank === 'Champion' ? '#fbbf24' : style.accent} className={cn("w-full h-full", rank === 'Champion' ? "opacity-90 drop-shadow-[0_0_15px_rgba(251,191,36,1)]" : "opacity-60")}>
                {rank === 'Champion' ? (
                  <path d="M12 12c2-2 5-3 8-3 1 0 2 0 3 .5-1 2-2 5-4 7-2 2-4 3-7 3.5M12 12c-2-2-5-3-8-3-1 0-2 0-3 .5 1 2 2 5 4 7 2 2 4 3 7 3.5M12 12c3-5 7-7 11-7-1 3-2 7-5 10-3 3-6 4-6 4M12 12c-3-5-7-7-11-7 1 3 2 7 5 10 3 3 6 4 6 4" />
                ) : (
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                )}
              </svg>
            </motion.div>
          </div>
        )}

        {/* Glow for Champion */}
        {rank === 'Champion' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-yellow-500/40 blur-3xl rounded-full -z-20"
          />
        )}

        {/* Main Badge Shape */}
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`grad-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={style.accent} />
              <stop offset="50%" stopColor={style.color} />
              <stop offset="100%" stopColor={style.accent} />
            </linearGradient>
          </defs>
          
          {/* Outer Frame */}
          <path 
            d={style.frame} 
            fill={`url(#grad-${rank})`}
            stroke="white"
            strokeWidth="0.5"
          />
          
          {/* Inner Shape */}
          <path 
            d={style.frame} 
            fill={style.color}
            transform="scale(0.85) translate(2, 2)"
            className="opacity-80"
          />

          {/* Central Star - Consistent across all ranks like the reference image */}
          {!style.hideStar && (
            <path 
              d="M12 7.5l1.2 3.6h3.8l-3 2.4 1.2 3.6-3.2-2.4-3.2 2.4 1.2-3.6-3-2.4h3.8z" 
              fill={style.accent}
              stroke="white"
              strokeWidth="0.2"
            />
          )}

          {/* Spikes for higher ranks */}
          {style.isSpiky && (
            <g fill={style.accent} opacity="0.6">
              <circle cx="12" cy="3" r="0.8" />
              <circle cx="12" cy="21" r="0.8" />
              <circle cx="3" cy="12" r="0.8" />
              <circle cx="21" cy="12" r="0.8" />
            </g>
          )}
        </svg>

        {/* Crown for Champion */}
        {rank === 'Champion' && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: -4 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-500 drop-shadow-lg"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
            </svg>
          </motion.div>
        )}
      </div>

      {showName && (
        <span className={cn(
          "mt-1 font-black uppercase tracking-tighter italic",
          textSizes[size]
        )} style={{ color: style.accent }}>
          {rank}
        </span>
      )}
    </div>
  );
};
