export type Move = 'rock' | 'paper' | 'scissors' | null;
export type GameResult = 'win' | 'loss' | 'draw' | null;
export type GameMode = 'single' | 'multi-ranked' | 'multi-private' | null;
export type Rank = 'Plastic' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Champion';

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  usernameLower: string; // Added for case-insensitive search
  photoURL: string;
  email: string;
  elo: number;
  rank: Rank;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  favoriteMove: Move;
  moveStats: {
    rock: number;
    paper: number;
    scissors: number;
  };
  matchesPlayed: number;
  botWins: number;
  botLosses: number;
  botDraws: number;
  createdAt: number;
  isGuest?: boolean;
}

export interface GameInvite {
  id: string;
  fromUid: string;
  fromDisplayName: string;
  fromUsername: string;
  fromPhotoURL: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  timestamp: any;
  matchId?: string;
}

export interface Friend {
  uid: string;
  displayName: string;
  username: string;
  photoURL: string;
  status: 'online' | 'offline' | 'in-game';
  elo: number;
  rank: Rank;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromDisplayName: string;
  fromUsername: string;
  fromPhotoURL: string;
  fromElo: number;
  fromRank: Rank;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: any;
}

export interface Match {
  id: string;
  players: string[]; // [player1Uid, player2Uid]
  moves: { [uid: string]: Move };
  scores: { [uid: string]: number }; // For Best of Three tracking
  status: 'waiting' | 'playing' | 'revealing' | 'round-end' | 'finished';
  winner: string | null;
  round: number;
  mode: GameMode;
  createdAt: number;
  updatedAt: number;
}

export interface MatchmakingRequest {
  uid: string;
  elo: number;
  createdAt: number;
  status: 'searching' | 'matched';
  matchId?: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  username: string;
  photoURL: string;
  elo: number;
  rank: Rank;
  wins: number;
  botWins?: number;
}
