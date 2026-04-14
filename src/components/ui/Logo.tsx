import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 200 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]"
      >
        {/* Background Glow */}
        <defs>
          <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle cx="100" cy="100" r="80" fill="url(#logoGlow)" />

        {/* Symmetrical Wings */}
        <g filter="url(#neonGlow)">
          {/* Left Wing */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M100 60 C70 40 30 50 20 90 C15 110 30 130 50 140 L100 110"
            stroke="url(#wingGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            d="M100 80 C80 65 50 70 40 100 C35 115 45 125 60 130 L100 110"
            stroke="url(#wingGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />

          {/* Right Wing (Perfectly Symmetrical) */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M100 60 C130 40 170 50 180 90 C185 110 170 130 150 140 L100 110"
            stroke="url(#wingGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            d="M100 80 C120 65 150 70 160 100 C165 115 155 125 140 130 L100 110"
            stroke="url(#wingGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* Central RPS Shield */}
        <motion.path
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          d="M100 45 L135 65 L135 115 L100 135 L65 115 L65 65 Z"
          fill="#000"
          stroke="#ef4444"
          strokeWidth="4"
        />

        {/* Clashing Swords */}
        <g transform="translate(100, 100) scale(0.6)">
          {/* Sword 1 */}
          <motion.g
            initial={{ x: -40, y: 40, rotate: -45, opacity: 0 }}
            animate={{ x: -10, y: 10, rotate: -45, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1, type: "spring" }}
          >
            <rect x="-2" y="-40" width="4" height="50" fill="#fff" rx="2" />
            <rect x="-8" y="10" width="16" height="4" fill="#ef4444" rx="2" />
            <rect x="-3" y="14" width="6" height="12" fill="#991b1b" rx="2" />
          </motion.g>
          {/* Sword 2 */}
          <motion.g
            initial={{ x: 40, y: 40, rotate: 45, opacity: 0 }}
            animate={{ x: 10, y: 10, rotate: 45, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1, type: "spring" }}
          >
            <rect x="-2" y="-40" width="4" height="50" fill="#fff" rx="2" />
            <rect x="-8" y="10" width="16" height="4" fill="#ef4444" rx="2" />
            <rect x="-3" y="14" width="6" height="12" fill="#991b1b" rx="2" />
          </motion.g>
          
          {/* Clash Sparkle */}
          <motion.circle
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, delay: 1.5, repeat: Infinity, repeatDelay: 2 }}
            cx="0"
            cy="0"
            r="10"
            fill="#fff"
            style={{ filter: 'blur(4px)' }}
          />
        </g>
        
        {/* Decorative Elements */}
        <motion.circle
          animate={{ r: [2, 4, 2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          cx="100"
          cy="40"
          r="3"
          fill="#ef4444"
        />
        <motion.circle
          animate={{ r: [2, 4, 2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          cx="100"
          cy="140"
          r="3"
          fill="#ef4444"
        />
      </svg>
    </div>
  );
};
