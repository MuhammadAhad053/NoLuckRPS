import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Shield, Check, X, Info, Flame } from 'lucide-react';
import { Button } from './Button';

interface CookieConsentProps {
  onAccept: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Non-negotiable
    analytics: true,
    performance: true,
    marketing: false
  });

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookies-accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setIsVisible(false);
    onAccept();
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setIsVisible(false);
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md font-orbitron"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-2xl bg-zinc-950 border border-white/5 rounded-[3rem] p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col items-center text-center gap-10">
            <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
              <Cookie className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-8 w-full">
              <div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">COOKIE <span className="text-red-500">PROTOCOLS</span></h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-4 max-w-md mx-auto leading-relaxed">
                  To continue to NoLuckRPS, please review our interface parameters. Some protocols are essential for system stability and account persistence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left w-full">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Essential</p>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Session & Auth</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-red-600/50 rounded-full flex items-center px-1 opacity-50 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-4" />
                  </div>
                </div>

                <div 
                  className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group"
                  onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                >
                  <div className="flex items-center gap-4">
                    <Info className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Analytics</p>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Game Stats</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${preferences.analytics ? 'bg-red-600' : 'bg-zinc-800'}`}>
                    <motion.div 
                      animate={{ x: preferences.analytics ? 16 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg" 
                    />
                  </div>
                </div>

                <div 
                  className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group"
                  onClick={() => setPreferences(prev => ({ ...prev, performance: !prev.performance }))}
                >
                  <div className="flex items-center gap-4">
                    <Check className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Performance</p>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Asset Loading</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${preferences.performance ? 'bg-red-600' : 'bg-zinc-800'}`}>
                    <motion.div 
                      animate={{ x: preferences.performance ? 16 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg" 
                    />
                  </div>
                </div>

                <div 
                  className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group"
                  onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                >
                  <div className="flex items-center gap-4">
                    <Flame className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Marketing</p>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-1">Promotions</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${preferences.marketing ? 'bg-red-600' : 'bg-zinc-800'}`}>
                    <motion.div 
                      animate={{ x: preferences.marketing ? 16 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6 w-full">
                <Button 
                  onClick={handleAcceptSelected}
                  variant="secondary" 
                  className="flex-1 py-6 text-[10px] font-black uppercase tracking-[0.3em] border-white/10 italic rounded-3xl"
                >
                  SAVE CONFIG
                </Button>
                <Button 
                  onClick={handleAcceptAll}
                  variant="primary" 
                  className="flex-1 py-6 text-[10px] font-black uppercase tracking-[0.3em] bg-red-600 hover:bg-red-700 border-none italic rounded-3xl shadow-xl shadow-red-900/20"
                >
                  ACCEPT ALL
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
