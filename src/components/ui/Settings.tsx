import React from 'react';
import { motion } from 'motion/react';
import { X, Volume2, VolumeX, Shield, Info, Github, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './Button';
import { useAudio } from '../../hooks/useAudio';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { isMuted, toggleMute } = useAudio();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md font-orbitron"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-zinc-950 border border-white/5 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
      >
        {/* Header */}
        <div className="p-10 border-b border-white/5 bg-gradient-to-r from-zinc-900/50 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-sm flex items-center justify-center border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <SettingsIcon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">SYSTEM <span className="text-orange-500">CONFIG</span></h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Interface Parameters</p>
            </div>
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

        <div className="p-10 space-y-10">
          {/* Audio Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/5" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">AUDIO PROTOCOLS</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-sm border border-white/5 hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-900 rounded-sm flex items-center justify-center border border-white/5 shadow-xl group-hover:border-orange-500/30 transition-all">
                  {isMuted ? <VolumeX className="w-6 h-6 text-red-500" /> : <Volume2 className="w-6 h-6 text-orange-500" />}
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
                className={`px-8 py-3 rounded-sm font-black uppercase tracking-widest text-[10px] italic ${isMuted ? 'bg-zinc-800 text-white border-white/10' : 'bg-orange-600 hover:bg-orange-700 border-none text-white shadow-lg shadow-orange-900/20'}`}
              >
                {isMuted ? "RE-ACTIVATE" : "TERMINATE"}
              </Button>
            </div>
          </div>

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
              className="flex items-center gap-3 text-zinc-600 hover:text-orange-500 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <Github className="w-4 h-4" />
              ACCESS SOURCE CODE
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
