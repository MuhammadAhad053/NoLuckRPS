import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Volume2, VolumeX, Shield, Info, Github, Settings as SettingsIcon, Database, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { useAudio } from '../../hooks/useAudio';
import { UserProfile } from '../../types';
import { db } from '../../firebase';
import { collection, getDocs, writeBatch, doc, query, limit, updateDoc } from 'firebase/firestore';
import { cn } from '../../lib/utils';

interface SettingsProps {
  profile: UserProfile | null;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onClose }) => {
  const { isMuted, toggleMute } = useAudio();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const isAdmin = profile?.email === 'ahadmuhammad053@gmail.com';

  const resetAllRanks = async () => {
    if (!confirm('Are you absolutely sure? This will reset ELO and Rank for ALL users in the database.')) return;
    
    setAdminStatus({ type: 'loading', message: 'Initializing global rank reset...' });
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      let count = 0;

      usersSnap.forEach((userDoc) => {
        batch.update(userDoc.ref, {
          elo: 1000,
          rank: 'Plastic',
          wins: 0,
          losses: 0,
          draws: 0,
          streak: 0,
          matchesPlayed: 0,
          botWins: 0,
          botLosses: 0,
          botDraws: 0,
          moveStats: { rock: 0, paper: 0, scissors: 0 },
          favoriteMove: null
        });
        count++;
      });

      await batch.commit();
      setAdminStatus({ type: 'success', message: `Successfully reset ${count} user profiles.` });
    } catch (error: any) {
      setAdminStatus({ type: 'error', message: `Reset failed: ${error.message}` });
    }
  };

  const clearAllMatchHistories = async () => {
    if (!confirm('Are you absolutely sure? This will delete ALL match history records for ALL users.')) return;

    setAdminStatus({ type: 'loading', message: 'Scanning database for history records...' });
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      let totalDeleted = 0;

      for (const userDoc of usersSnap.docs) {
        const historySnap = await getDocs(collection(db, 'users', userDoc.id, 'history'));
        if (historySnap.empty) continue;

        const batch = writeBatch(db);
        historySnap.forEach((historyDoc) => {
          batch.delete(historyDoc.ref);
          totalDeleted++;
        });
        await batch.commit();
      }

      setAdminStatus({ type: 'success', message: `Successfully purged ${totalDeleted} match history records.` });
    } catch (error: any) {
      setAdminStatus({ type: 'error', message: `Purge failed: ${error.message}` });
    }
  };

  const [isUpdatingColors, setIsUpdatingColors] = useState(false);

  const WIN_COLORS = [
    { name: 'Cyber Red', value: 'text-red-500', bg: 'bg-red-500' },
    { name: 'Neon Green', value: 'text-green-500', bg: 'bg-green-500' },
    { name: 'Electric Blue', value: 'text-blue-500', bg: 'bg-blue-500' },
    { name: 'Plasma Purple', value: 'text-purple-500', bg: 'bg-purple-500' },
    { name: 'Gold Flare', value: 'text-yellow-500', bg: 'bg-yellow-500' },
  ];

  const LOSS_COLORS = [
    { name: 'Blood Red', value: 'text-red-600', bg: 'bg-red-600' },
    { name: 'Deep Orange', value: 'text-orange-600', bg: 'bg-orange-600' },
    { name: 'Void Gray', value: 'text-zinc-600', bg: 'bg-zinc-600' },
    { name: 'Toxic Lime', value: 'text-lime-600', bg: 'bg-lime-600' },
    { name: 'Shadow Blue', value: 'text-blue-900', bg: 'bg-blue-900' },
  ];

  const updateColorPreference = async (type: 'win' | 'loss', color: string) => {
    if (!profile || profile.isGuest) return;
    setIsUpdatingColors(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        [type === 'win' ? 'winColor' : 'lossColor']: color
      });
    } catch (error) {
      console.error('Failed to update color preference:', error);
    } finally {
      setIsUpdatingColors(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-md font-orbitron"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-zinc-950 border border-white/5 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 md:p-10 border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-sm flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)]">
              <SettingsIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase italic leading-none">SYSTEM <span className="text-red-500">CONFIG</span></h2>
              <p className="text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-1">Interface Parameters</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="p-2 md:p-3 rounded-sm bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>

        <div className="p-6 md:p-10 space-y-8 md:space-y-10 overflow-y-auto custom-scrollbar">
          {/* Visual Preferences */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">VISUAL PROTOCOLS</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* Win Color Selector */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ROUND WIN INDICATOR</p>
              <div className="flex flex-wrap gap-3">
                {WIN_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateColorPreference('win', color.value)}
                    disabled={isUpdatingColors || profile?.isGuest}
                    className={cn(
                      "w-10 h-10 rounded-sm border-2 transition-all flex items-center justify-center",
                      color.bg,
                      profile?.winColor === color.value ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                    title={color.name}
                  >
                    {profile?.winColor === color.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Loss Color Selector */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ROUND LOSS INDICATOR</p>
              <div className="flex flex-wrap gap-3">
                {LOSS_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateColorPreference('loss', color.value)}
                    disabled={isUpdatingColors || profile?.isGuest}
                    className={cn(
                      "w-10 h-10 rounded-sm border-2 transition-all flex items-center justify-center",
                      color.bg,
                      profile?.lossColor === color.value ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                    title={color.name}
                  >
                    {profile?.lossColor === color.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">AUDIO PROTOCOLS</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-900 rounded-sm flex items-center justify-center border border-white/5 shadow-xl group-hover:border-red-500/30 transition-all">
                  {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase italic tracking-tight">GAME SONICS</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Acoustic Feedback Loop</p>
                </div>
              </div>
              <Button 
                onClick={toggleMute}
                variant={isMuted ? "secondary" : "primary"}
                size="sm"
                className={`px-8 py-3 rounded-sm font-black uppercase tracking-widest text-[10px] italic ${isMuted ? 'bg-zinc-800 text-white border-white/10' : 'bg-red-600 hover:bg-red-700 border-none text-white shadow-lg shadow-red-900/20'}`}
              >
                {isMuted ? "RE-ACTIVATE" : "TERMINATE"}
              </Button>
            </div>
          </div>

          {/* Admin Tools - Only for specific email */}
          {isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-red-500/20" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">ADMIN PROTOCOLS</h3>
                <div className="h-px flex-1 bg-red-500/20" />
              </div>
              
              <div className="p-6 bg-red-500/5 rounded-sm border border-red-500/10 space-y-6">
                <div className="flex items-center gap-4 text-red-500 mb-2">
                  <Database className="w-5 h-5" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Global Database Management</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    onClick={resetAllRanks}
                    disabled={adminStatus.type === 'loading'}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-red-950/30 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${adminStatus.type === 'loading' ? 'animate-spin' : ''}`} />
                    RESET ALL USER RANKS
                  </Button>

                  <Button 
                    onClick={clearAllMatchHistories}
                    disabled={adminStatus.type === 'loading'}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-red-950/30 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    PURGE ALL MATCH HISTORIES
                  </Button>
                </div>

                {adminStatus.type !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-sm flex items-start gap-3 border ${
                      adminStatus.type === 'loading' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      adminStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {adminStatus.type === 'loading' && <RefreshCw className="w-4 h-4 animate-spin mt-0.5" />}
                    {adminStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5" />}
                    {adminStatus.type === 'error' && <AlertCircle className="w-4 h-4 mt-0.5" />}
                    <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                      {adminStatus.message}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Game Info - Simplified */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <h3 className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-600">SYSTEM INFO</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-zinc-500">
                <Shield className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">VER 1.2.0 STABLE</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <Info className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">FAIR PLAY ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-zinc-600 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <button className="flex items-center gap-3">
                <Github className="w-4 h-4" />
                ACCESS SOURCE CODE
              </button>
            </a>
          </div>
        </div>

        <div className="p-10 bg-black/40 border-t border-white/5">
          <Button 
            onClick={onClose} 
            className="w-full py-6 bg-white text-black hover:bg-zinc-200 border-none font-black uppercase tracking-[0.3em] text-[10px] rounded-sm shadow-2xl shadow-white/5 italic"
          >
            SAVE & EXIT GRID
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
