import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, UserPlus, UserMinus, X, Shield, Trophy, MessageSquare, Check, Bell, UserCheck, UserX } from 'lucide-react';
import { Button } from './Button';
import { useSocial } from '@/src/hooks/useSocial';
import { UserProfile, FriendRequest, Rank } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { RANKS } from '@/src/constants';
import { RankBadge } from '../RankBadge';

interface SocialProps {
  profile: UserProfile;
  onClose: () => void;
}

export const Social: React.FC<SocialProps> = ({ profile, onClose }) => {
  const { 
    friends, 
    friendRequests, 
    outgoingRequests,
    searchResults, 
    loading, 
    searchUsers, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend 
  } = useSocial(profile);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');

  // Real-time search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        searchUsers('');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
      setActiveTab('search');
    }
  };

  const isRequestPending = (targetUid: string) => {
    return outgoingRequests.some(r => r.toUid === targetUid);
  };

  const isIncomingPending = (targetUid: string) => {
    return friendRequests.some(r => r.fromUid === targetUid);
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
        className="relative w-full max-w-2xl bg-zinc-950 border border-white/5 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
      >
        {/* Header - Redesigned */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveTab('friends')}
              className={cn(
                "p-3 rounded-sm border border-white/5 transition-all",
                activeTab === 'friends' ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-white/5 text-zinc-500 hover:text-white"
              )}
            >
              <Users className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActiveTab('search')}
              className={cn(
                "p-3 rounded-sm border border-white/5 transition-all",
                activeTab === 'search' ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-white/5 text-zinc-500 hover:text-white"
              )}
            >
              <UserPlus className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">SOCIAL <span className="text-red-500">HUB</span></h2>
            <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Grid Network</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveTab('requests')}
                className={cn(
                  "p-3 rounded-sm border border-white/5 transition-all",
                  activeTab === 'requests' ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-white/5 text-zinc-500 hover:text-white"
                )}
              >
                <Bell className="w-5 h-5" />
              </Button>
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse" />
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="p-3 rounded-sm bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar - Only visible in search tab */}
        <AnimatePresence>
          {activeTab === 'search' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 py-6 bg-white/5 border-b border-white/5 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH USERNAME..."
                  className="w-full bg-zinc-900 border border-white/5 rounded-sm pl-12 pr-6 py-3 text-[10px] font-black text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-700 tracking-widest uppercase"
                  autoFocus
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs - Removed in favor of header buttons */}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
          <AnimatePresence mode="wait">
            {activeTab === 'friends' ? (
              <motion.div 
                key="friends-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {friends.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-sm flex items-center justify-center mx-auto border border-white/5">
                      <Users className="w-10 h-10 text-zinc-800" />
                    </div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">No allies found</p>
                  </div>
                ) : (
                  friends.map(friend => (
                    <UserCard 
                      key={friend.uid} 
                      user={friend} 
                      isFriend={true} 
                      onAction={() => removeFriend(friend.uid)} 
                    />
                  ))
                )}
              </motion.div>
            ) : activeTab === 'requests' ? (
              <motion.div 
                key="requests-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {friendRequests.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-sm flex items-center justify-center mx-auto border border-white/5">
                      <Bell className="w-10 h-10 text-zinc-800" />
                    </div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">No incoming signals</p>
                  </div>
                ) : (
                  friendRequests.map(request => (
                    <RequestCard 
                      key={request.id}
                      request={request}
                      onAccept={() => acceptFriendRequest(request)}
                      onReject={() => rejectFriendRequest(request.id)}
                    />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="search-list"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.2)]" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-sm flex items-center justify-center mx-auto border border-white/5">
                      <Search className="w-10 h-10 text-zinc-800" />
                    </div>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">No targets identified</p>
                  </div>
                ) : (
                  searchResults.map(user => (
                    <UserCard 
                      key={user.uid} 
                      user={user} 
                      isFriend={friends.some(f => f.uid === user.uid)} 
                      isPending={isRequestPending(user.uid)}
                      isIncoming={isIncomingPending(user.uid)}
                      onAction={() => {
                        if (friends.some(f => f.uid === user.uid)) {
                          removeFriend(user.uid);
                        } else if (isIncomingPending(user.uid)) {
                          setActiveTab('requests');
                        } else if (!isRequestPending(user.uid)) {
                          sendFriendRequest(user);
                        }
                      }} 
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

const RequestCard = ({ request, onAccept, onReject }: { request: FriendRequest, onAccept: () => void, onReject: () => void }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group"
  >
    <div className="flex items-center gap-5">
      <div className="relative">
        <img 
          src={request.fromPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.fromUid}`} 
          alt="Avatar" 
          className="w-14 h-14 rounded-sm border-2 border-red-500/30 p-1 bg-zinc-900 shadow-xl"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-zinc-950">
          <Bell className="w-2.5 h-2.5 text-black" />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{request.fromDisplayName}</h4>
        <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mt-1">@{request.fromUsername}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button 
        onClick={onAccept} 
        size="sm" 
        className="bg-green-600 hover:bg-green-700 border-none h-11 w-11 p-0 rounded-sm shadow-lg shadow-green-900/20"
      >
        <UserCheck className="w-5 h-5" />
      </Button>
      <Button 
        onClick={onReject} 
        variant="ghost" 
        size="sm" 
        className="text-red-500 hover:bg-red-500/10 h-11 w-11 p-0 rounded-sm border border-white/5"
      >
        <UserX className="w-5 h-5" />
      </Button>
    </div>
  </motion.div>
);

const UserCard = ({ 
  user, 
  isFriend, 
  isPending, 
  isIncoming, 
  onAction 
}: { 
  user: any, 
  isFriend: boolean, 
  isPending?: boolean, 
  isIncoming?: boolean, 
  onAction: () => void 
}) => {
  const rankColor = RANKS[user.rank as Rank]?.color || '#ffffff';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white/5 border border-white/5 rounded-sm flex items-center justify-between hover:bg-white/10 transition-all group"
    >
      <div className="flex items-center gap-5">
        <div className="relative">
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
            alt="Avatar" 
            className="w-14 h-14 rounded-sm border-2 p-1 bg-zinc-900 shadow-xl"
            style={{ borderColor: rankColor + '40' }}
          />
          <RankBadge rank={user.rank as Rank} size="sm" showName={false} className="absolute -bottom-1 -right-1 shadow-lg" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{user.displayName}</h4>
            <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">@{user.username}</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[10px] font-black italic">{user.elo}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: rankColor }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: rankColor }}>{user.rank}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          onClick={user.isGuest ? undefined : onAction}
          variant={isFriend ? "ghost" : isPending ? "ghost" : "secondary"}
          size="sm" 
          disabled={user.isGuest || isPending}
          className={`h-11 w-11 p-0 rounded-sm transition-all ${
            isFriend 
              ? 'text-red-500 hover:bg-red-500/10 border border-red-500/20' 
              : isPending 
                ? 'text-zinc-500 bg-zinc-900 border border-white/5' 
                : 'bg-red-600 hover:bg-red-700 border-none text-white shadow-lg shadow-red-900/20'
          } ${user.isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isFriend ? <UserMinus className="w-5 h-5" /> : isIncoming ? <UserCheck className="w-5 h-5" /> : isPending ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-11 w-11 p-0 rounded-sm text-zinc-500 hover:text-white hover:bg-white/5 border border-white/5"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
};
