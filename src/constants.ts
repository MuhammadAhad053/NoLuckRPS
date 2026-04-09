import { Rank } from './types';
import { Shield, Trophy, Star, Crown, Zap, Diamond } from 'lucide-react';

export interface RankMetadata {
  name: Rank;
  color: string;
  bgColor: string;
  borderColor: string;
  minElo: number;
  nextRank?: Rank;
  icon: any;
}

export const RANKS: Record<Rank, RankMetadata> = {
  'Plastic': {
    name: 'Plastic',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    minElo: 0,
    nextRank: 'Bronze',
    icon: Shield
  },
  'Bronze': {
    name: 'Bronze',
    color: '#a85732',
    bgColor: 'rgba(168, 87, 50, 0.1)',
    borderColor: 'rgba(168, 87, 50, 0.3)',
    minElo: 1050,
    nextRank: 'Silver',
    icon: Shield
  },
  'Silver': {
    name: 'Silver',
    color: '#e2e8f0',
    bgColor: 'rgba(226, 232, 240, 0.1)',
    borderColor: 'rgba(226, 232, 240, 0.3)',
    minElo: 1100,
    nextRank: 'Gold',
    icon: Zap
  },
  'Gold': {
    name: 'Gold',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    minElo: 1150,
    nextRank: 'Platinum',
    icon: Star
  },
  'Platinum': {
    name: 'Platinum',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    minElo: 1200,
    nextRank: 'Diamond',
    icon: Star
  },
  'Diamond': {
    name: 'Diamond',
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: 'rgba(37, 99, 235, 0.3)',
    minElo: 1300,
    nextRank: 'Champion',
    icon: Diamond
  },
  'Champion': {
    name: 'Champion',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
    minElo: 1400,
    icon: Crown
  }
};

export const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  MOVE: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  WIN: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  LOSS: 'https://assets.mixkit.co/active_storage/sfx/251/251-preview.mp3',
  DRAW: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  COUNTDOWN: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  MATCH_FOUND: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3'
};
