import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, User, BarChart3, Play, Settings as SettingsIcon, LogOut, 
  Flame, Target, Shield, Users, UserPlus, Bell, ChevronRight, Sword, 
  Scissors, Hand, Search, Mail, X, UserMinus, Edit2, Check, AlertCircle
} from 'lucide-react';
import { UserProfile, GameMode, FriendRequest } from '../../types';
import { db, logout } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { RANKS } from '../../constants';
import { RankBadge } from '../RankBadge';
import { useSocial } from '../../hooks/useSocial';
import { cn } from '../../lib/utils';
import { Logo } from './Logo';

interface MenuProps {
  profile: UserProfile;
  onSelectMode: (mode: GameMode) => void;
  onJoinMatch?: (matchId: string) => void;
  onShowLeaderboard: () => void;
  onShowHistory: () => void;
  onShowSettings: () => void;
  onShowProfile: () => void;
  onStartMatchmaking: () => void;
  onCreatePrivateMatch: () => void;
  onJoinPrivateMatch: (code: string) => void;
  onLogout: () => void;
  onUpdateUsername: (newUsername: string) => Promise<{ success: boolean, error?: string }>;
}

export const Menu: React.FC<MenuProps> = ({ 
  profile, 
  onSelectMode, 
  onJoinMatch,
  onShowLeaderboard, 
  onShowHistory, 
  onShowSettings,
  onShowProfile,
  onStartMatchmaking,
  onCreatePrivateMatch,
  onJoinPrivateMatch,
  onLogout,
  onUpdateUsername
}) => {
  const [showPlayOptions, setShowPlayOptions] = useState(false);
  const [partyCode, setPartyCode] = useState('');
  const [socialTab, setSocialTab] = useState<'friends' | 'discover' | 'requests'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomCodeInput, setShowCustomCodeInput] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setNewUsername(profile.username);
  }, [profile.username]);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === profile.username) {
      setIsEditingUsername(false);
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    const result = await onUpdateUsername(newUsername);
    setIsUpdating(false);

    if (result.success) {
      setIsEditingUsername(false);
    } else {
      setUpdateError(result.error || 'Update failed');
    }
  };

  const { 
    friends, 
    friendRequests, 
    outgoingRequests,
    searchResults, 
    searchUsers, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    removeFriend,
    incomingInvites,
    sendInvite,
    acceptInvite,
    rejectInvite,
    deleteInvite,
    acceptedMatch,
    clearAcceptedMatch,
    loading: socialLoading 
  } = useSocial(profile);

  useEffect(() => {
    if (acceptedMatch && onJoinMatch) {
      onJoinMatch(acceptedMatch.matchId);
      deleteInvite(acceptedMatch.inviteId);
      clearAcceptedMatch();
    }
  }, [acceptedMatch, onJoinMatch, clearAcceptedMatch, deleteInvite]);
  
  const currentRank = RANKS[profile.rank] || RANKS['Plastic'];
  const nextRank = currentRank.nextRank ? RANKS[currentRank.nextRank] : null;
  const eloProgress = nextRank ? ((profile.elo - currentRank.minElo) / (nextRank.minElo - currentRank.minElo)) * 100 : 100;
  const eloToNext = nextRank ? nextRank.minElo - profile.elo : 0;

  const [unfriendConfirm, setUnfriendConfirm] = useState<{uid: string, username: string} | null>(null);

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-black text-white font-orbitron p-4 lg:p-8 gap-6 overflow-hidden">
      
      {/* Unfriend Confirmation Modal */}
      <AnimatePresence>
        {unfriendConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-sm max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                <UserMinus className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight">Unfriend Player?</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                  Are you sure you want to remove <span className="text-white">{unfriendConfirm.username}</span> from your tactical network?
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setUnfriendConfirm(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-sm font-black uppercase tracking-widest text-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    removeFriend(unfriendConfirm.uid);
                    setUnfriendConfirm(null);
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-sm font-black uppercase tracking-widest text-[10px] transition-colors"
                >
                  Unfriend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Incoming Invites Overlay */}
      <AnimatePresence>
        {incomingInvites.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-zinc-900 border-2 border-red-500 rounded-sm p-4 shadow-[0_0_50px_rgba(220,38,38,0.3)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                  {incomingInvites[0].fromPhotoURL ? (
                    <img src={incomingInvites[0].fromPhotoURL} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 m-3 text-zinc-600" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Game Invite</p>
                  <p className="text-sm font-black text-white uppercase">{incomingInvites[0].fromDisplayName} challenged you!</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => rejectInvite(incomingInvites[0].id)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={async () => {
                    const invite = incomingInvites[0];
                    const matchId = await acceptInvite(invite);
                    if (matchId && onJoinMatch) {
                      onJoinMatch(matchId);
                      // Delete the invite after joining
                      deleteInvite(invite.id);
                    }
                  }}
                  className="p-2 bg-red-600 hover:bg-red-500 rounded-sm text-white transition-colors"
                >
                  <Sword className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: Profile & Stats */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[400px] flex flex-col gap-6"
      >
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-red-500/20 rounded-sm p-6 flex flex-col gap-8 h-full">
          {/* User Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white/20" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {isEditingUsername ? (
                          <motion.div 
                            key="edit"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-2 w-full"
                          >
                            <div className="relative flex-1">
                              <input 
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                className={cn(
                                  "w-full bg-zinc-900 border rounded-sm px-3 py-1.5 text-sm font-black text-red-500 focus:outline-none uppercase tracking-widest",
                                  updateError ? "border-red-500" : "border-white/10 focus:border-red-500"
                                )}
                                placeholder="USERNAME"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
                              />
                              {updateError && (
                                <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-red-500 text-[8px] font-black uppercase tracking-widest">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  {updateError}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={handleUpdateUsername}
                              disabled={isUpdating}
                              className="p-1.5 bg-green-600 hover:bg-green-500 rounded-sm text-white transition-all disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => { setIsEditingUsername(false); setNewUsername(profile.username); setUpdateError(null); }}
                              className="p-1.5 bg-white/5 rounded-sm border border-white/5 text-zinc-500 hover:text-white transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="view"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center gap-2"
                          >
                            <h2 className="text-xl font-black tracking-wider uppercase">{profile.username}</h2>
                            <button 
                              onClick={() => setIsEditingUsername(true)}
                              className="p-1.5 bg-white/5 rounded-sm border border-white/5 text-zinc-500 hover:text-white transition-all"
                              title="Edit Username"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">{profile.isGuest ? 'GUEST ACCOUNT' : profile.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest"
              >
                LOGOUT <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          {/* Rank Section */}
          <div className="flex flex-col items-center gap-4 py-4">
            <RankBadge rank={profile.rank} size="lg" showName={false} className="scale-150 mb-4" />
            <div className="text-center">
              <h3 className="text-2xl font-black tracking-[0.2em] text-red-500 uppercase italic">{profile.rank}</h3>
              <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-1">RATING: {profile.elo}</p>
            </div>
          </div>

          {/* Rank Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-black uppercase tracking-widest text-zinc-500">
              <span>RANK PROGRESS</span>
              <span>{nextRank ? `${eloToNext} TO ${nextRank.name}` : 'MAX RANK'}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, eloProgress))}%` }}
                className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
              />
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          {/* Stats Section */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-xl font-black tracking-widest uppercase text-white">PLAYER STATS</h3>
            <div className="space-y-4">
              <StatRow label="MATCHES PLAYED" value={profile.matchesPlayed} />
              <StatRow label="RANKED WINS" value={profile.wins} />
              <StatRow label="BOT WINS" value={profile.botWins || 0} />
              <StatRow label="TOTAL LOSSES" value={profile.losses} />
              <div className="space-y-2">
                <StatRow label="WIN RATE" value={`${profile.matchesPlayed > 0 ? Math.round(((profile.wins + (profile.botWins || 0)) / profile.matchesPlayed) * 100) : 0}%`} />
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.matchesPlayed > 0 ? ((profile.wins + (profile.botWins || 0)) / profile.matchesPlayed) * 100 : 0}%` }}
                    className="h-full bg-red-500"
                  />
                </div>
              </div>
              <StatRow label="WIN STREAK" value={profile.streak || 0} color="text-red-500" />
              <StatRow label="FAVORITE MOVE" value={profile.favoriteMove || 'NONE'} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* CENTER SECTION: Logo & Actions */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-12">
        {/* Game Logo */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 border-2 border-red-500/10 rounded-full absolute inset-0 blur-3xl"
            />
            <div className="w-48 h-48 flex items-center justify-center relative z-10">
              <Logo size={192} />
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-[0.2em] text-white uppercase italic">
            NO<span className="text-red-500">LUCK</span>RPS
          </h1>
          <div className="h-1 w-24 bg-red-500 mt-2 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full max-w-xl space-y-4">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowPlayOptions(!showPlayOptions);
                setShowCustomCodeInput(false);
              }}
              className={cn(
                "w-full bg-gradient-to-r from-red-700 to-red-500 py-6 px-12 rounded-sm flex items-center justify-between shadow-[0_0_40px_rgba(220,38,38,0.3)] border border-white/20 group transition-all duration-500",
                showPlayOptions && "rounded-b-none"
              )}
            >
              <span className="text-4xl font-black italic tracking-widest uppercase">PLAY</span>
              <div className="flex items-center gap-4">
                <Sword className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
                <motion.div
                  animate={{ rotate: showPlayOptions ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronRight className="w-8 h-8 text-white/50" />
                </motion.div>
              </div>
            </motion.button>

            <AnimatePresence>
              {showPlayOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-zinc-900/90 backdrop-blur-xl border-x border-b border-white/10 rounded-b-sm"
                >
                  <div className="p-2 space-y-2">
                    <PlayOption 
                      icon={<Target className="w-5 h-5" />}
                      title="PRACTICE WITH AI"
                      description="Hone your skills against CyberBot v1.0"
                      onClick={() => {
                        onSelectMode('single');
                        setShowPlayOptions(false);
                      }}
                    />
                    <PlayOption 
                      icon={<Sword className="w-5 h-5" />}
                      title="ONLINE MATCHMAKING"
                      description={profile.isGuest ? "LOGIN TO PLAY ONLINE" : "Battle real players for ELO and glory"}
                      disabled={profile.isGuest}
                      onClick={() => {
                        if (profile.isGuest) return;
                        onStartMatchmaking();
                        setShowPlayOptions(false);
                      }}
                    />
                    <div className="space-y-2">
                      <PlayOption 
                        icon={<Users className="w-5 h-5" />}
                        title="CUSTOM MATCH"
                        description={profile.isGuest ? "LOGIN TO CHALLENGE FRIENDS" : "Challenge friends in private arenas"}
                        disabled={profile.isGuest}
                        onClick={() => {
                          if (profile.isGuest) return;
                          setShowCustomCodeInput(!showCustomCodeInput);
                        }}
                      />
                      <AnimatePresence>
                        {showCustomCodeInput && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 space-y-3"
                          >
                            <div className="flex gap-2">
                              <input 
                                value={partyCode}
                                onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE"
                                className="flex-1 bg-black border border-white/10 rounded-sm px-4 py-3 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-red-500"
                              />
                              <button 
                                onClick={() => partyCode && onJoinPrivateMatch(partyCode)}
                                className="bg-red-600 hover:bg-red-500 px-6 rounded-sm font-black uppercase tracking-widest transition-colors"
                              >
                                JOIN
                              </button>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest"><span className="bg-zinc-900 px-2 text-zinc-600">OR</span></div>
                            </div>
                            <button 
                              onClick={onCreatePrivateMatch}
                              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-sm font-black uppercase tracking-widest transition-colors text-xs"
                            >
                              CREATE NEW ARENA
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!showPlayOptions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <button 
                onClick={onShowLeaderboard}
                className="w-full bg-zinc-800/80 hover:bg-zinc-700/80 py-5 px-12 rounded-sm text-2xl font-black tracking-widest uppercase border border-white/5 transition-all"
              >
                LEADERBOARDS
              </button>

              <div className="flex gap-4">
                <button 
                  onClick={onShowHistory}
                  className="flex-1 bg-zinc-800/80 hover:bg-zinc-700/80 py-5 px-12 rounded-sm text-2xl font-black tracking-widest uppercase border border-white/5 transition-all"
                >
                  MATCH HISTORY
                </button>
                <button 
                  onClick={onShowSettings}
                  className="bg-zinc-800/80 hover:bg-zinc-700/80 p-5 rounded-sm border border-white/5 transition-all"
                >
                  <SettingsIcon className="w-8 h-8 text-zinc-400" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Social Hub */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[400px]"
      >
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-red-500/20 rounded-sm p-6 flex flex-col gap-6 h-full relative overflow-hidden">
          {profile.isGuest && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-white">SOCIAL HUB LOCKED</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                  Guest accounts cannot access social features. Sign in to connect with friends and save your progress!
                </p>
              </div>
              <button 
                onClick={onLogout}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-sm font-black uppercase tracking-widest text-[10px] transition-all"
              >
                SIGN IN NOW
              </button>
            </div>
          )}
          {/* Social Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tighter text-white uppercase not-italic">Social Hub</h2>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Connect & Challenge</p>
              </div>
            </div>
          </div>

          {/* Social Tabs */}
          <div className="flex items-center bg-zinc-900/50 p-1 rounded-sm border border-white/5">
            <button 
              onClick={() => setSocialTab('friends')}
              className={cn(
                "flex-1 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                socialTab === 'friends' ? "bg-red-600 text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              Friends
            </button>
            <button 
              onClick={() => setSocialTab('discover')}
              className={cn(
                "flex-1 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all",
                socialTab === 'discover' ? "bg-red-600 text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              Add Friend
            </button>
            <button 
              onClick={() => setSocialTab('requests')}
              className={cn(
                "flex-1 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all relative",
                socialTab === 'requests' ? "bg-red-600 text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              Requests
              {friendRequests.length > 0 && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="wait">
              {socialTab === 'friends' && (
                <motion.div 
                  key="friends"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {friends.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">No tactical allies yet</p>
                      <button 
                        onClick={() => setSocialTab('discover')}
                        className="text-[10px] text-red-500 hover:text-red-400 font-black uppercase tracking-widest underline underline-offset-4"
                      >
                        Find Players
                      </button>
                    </div>
                  ) : (
                    friends.map(friend => (
                      <FriendItem 
                        key={friend.uid} 
                        friend={friend} 
                        onRemove={removeFriend} 
                        onInvite={sendInvite} 
                        onUnfriendClick={(uid, username) => setUnfriendConfirm({ uid, username })}
                      />
                    ))
                  )}
                </motion.div>
              )}

              {socialTab === 'discover' && (
                <motion.div 
                  key="discover"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      placeholder="SEARCH USERNAME..."
                      className="w-full bg-zinc-900 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    {socialLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      searchQuery && (
                        <p className="text-center py-8 text-[10px] text-zinc-600 font-black uppercase tracking-widest">No players found</p>
                      )
                    ) : (
                      searchResults.map(result => {
                        const isFriend = friends.some(f => f.uid === result.uid);
                        const isPending = friendRequests.some(r => r.fromUid === result.uid) || 
                                          outgoingRequests.some(r => r.toUid === result.uid);
                        
                        return (
                          <div key={result.uid} className="flex items-center justify-between p-3 bg-white/5 rounded-sm border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                                {result.photoURL ? <img src={result.photoURL} className="w-full h-full object-cover" /> : <User className="w-5 h-5 m-2.5 text-zinc-600" />}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-black text-white uppercase tracking-tight">{result.username}</p>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{result.rank} • {result.elo} ELO</p>
                              </div>
                            </div>
                            {isFriend ? (
                              <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest bg-zinc-800/50 px-2 py-1 rounded-sm">FRIEND</span>
                            ) : isPending ? (
                              <span className="text-[8px] font-black uppercase text-red-500/50 tracking-widest bg-red-500/5 px-2 py-1 rounded-sm">PENDING</span>
                            ) : (
                              <button 
                                onClick={() => sendFriendRequest(result)}
                                className="p-2 text-red-500 hover:text-red-400 transition-colors"
                              >
                                <UserPlus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {socialTab === 'requests' && (
                <motion.div 
                  key="requests"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {friendRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">No pending requests</p>
                    </div>
                  ) : (
                    friendRequests.map(request => (
                      <FriendRequestItem 
                        key={request.id} 
                        request={request} 
                        onAccept={acceptFriendRequest} 
                        onReject={rejectFriendRequest} 
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

const StatRow = ({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-zinc-500 font-black uppercase tracking-widest">{label}</span>
    <span className={cn("text-lg font-black uppercase tracking-wider", color)}>{value}</span>
  </div>
);

const FriendRequestItem = ({ request, onAccept, onReject }: { request: FriendRequest, onAccept: (req: FriendRequest) => void, onReject: (id: string) => void }) => {
  const [senderData, setSenderData] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', request.fromUid), (doc) => {
      if (doc.exists()) {
        setSenderData({ ...doc.data(), uid: request.fromUid });
      }
    });
    return () => unsub();
  }, [request.fromUid]);

  if (!senderData) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-sm border border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
          {senderData.photoURL ? <img src={senderData.photoURL} className="w-full h-full object-cover" /> : <User className="w-5 h-5 m-2.5 text-zinc-600" />}
        </div>
        <div className="text-left">
          <p className="text-sm font-black text-white uppercase tracking-tight">{senderData.username}</p>
          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{senderData.rank} • {senderData.elo} ELO</p>
        </div>
      </div>
      <div className="flex gap-1">
        <button 
          onClick={() => onReject(request.id)}
          className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onAccept(request)}
          className="p-2 text-green-500 hover:text-green-400 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FriendItem = ({ friend, onRemove, onInvite, onUnfriendClick }: { friend: any, onRemove: (uid: string) => void, onInvite: (uid: string) => void, onUnfriendClick: (uid: string, username: string) => void }) => {
  const [friendData, setFriendData] = useState(friend);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', friend.uid), (doc) => {
      if (doc.exists()) {
        setFriendData({ ...doc.data(), uid: friend.uid });
      }
    });
    return () => unsub();
  }, [friend.uid]);

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
            {friendData.photoURL ? <img src={friendData.photoURL} className="w-full h-full object-cover" /> : <User className="w-5 h-5 m-2.5 text-zinc-600" />}
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950",
            (friendData.status === 'online' || friendData.status === 'in-game') ? "bg-green-500" : "bg-zinc-600"
          )} />
        </div>
        <div className="text-left">
          <p className="text-sm font-black text-white uppercase tracking-tight">{friendData.username}</p>
          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{friendData.rank} • {friendData.elo} ELO</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onInvite(friend.uid)}
          className="p-2 text-red-500 hover:text-red-400 transition-colors"
          title="Invite to Custom Match"
        >
          <Sword className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onUnfriendClick(friend.uid, friendData.username)}
          className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
          title="Unfriend"
        >
          <UserMinus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const PlayOption = ({ icon, title, description, onClick, disabled = false }: { icon: React.ReactNode, title: string, description: string, onClick: () => void, disabled?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-full flex items-center gap-4 p-4 transition-all text-left group border border-transparent rounded-sm",
      disabled ? "opacity-50 cursor-not-allowed bg-zinc-900/50" : "hover:bg-white/5 hover:border-white/10"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-sm flex items-center justify-center transition-transform",
      disabled ? "bg-zinc-950 text-zinc-700" : "bg-zinc-800 text-red-500 group-hover:scale-110"
    )}>
      {icon}
    </div>
    <div>
      <h4 className={cn("text-sm font-black tracking-widest uppercase", disabled ? "text-zinc-600" : "text-white")}>{title}</h4>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{description}</p>
    </div>
    {!disabled && <ChevronRight className="w-5 h-5 ml-auto text-zinc-700 group-hover:text-red-500 transition-colors" />}
  </button>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CrownIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const ScissorsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const SwordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="14.5 17.5 3 6 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="20" y2="20" />
  </svg>
);
