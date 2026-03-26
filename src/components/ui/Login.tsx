import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserCircle, Mail, Lock, AlertTriangle, ArrowRight, X, Sword, Scissors, Hand } from 'lucide-react';
import { Button } from './Button';
import { signInWithGoogle, auth } from '@/src/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  onGuestLogin: () => void;
  onEmailLogin?: (email: string, pass: string) => Promise<void>;
  onEmailSignUp?: (email: string, pass: string) => Promise<any>;
  isLinking?: boolean;
  onClose?: () => void;
}

export const Login: React.FC<LoginProps> = ({ 
  onGuestLogin, 
  isLinking,
  onClose
}) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('User closed the sign-in popup');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center font-orbitron">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-12"
      >
        {/* Logo / Title */}
        <div className="space-y-8 relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <img 
                src="/api/files/1742988818833-noluckrps-logo.png"
                alt="NoLuckRPS Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="mt-8">
              <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase">
                NoLuck<span className="text-red-600">RPS</span>
              </h1>
              <p className="text-zinc-500 font-bold tracking-[0.4em] uppercase text-[10px] mt-2">
                Tactical Combat Protocol
              </p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            isLoading={loading}
            size="lg" 
            className="w-full flex items-center justify-center gap-3 py-6 bg-white text-black hover:bg-zinc-200 rounded-sm"
          >
            <LogIn className="w-5 h-5" />
            SIGN IN WITH GOOGLE
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-black px-4 text-zinc-600">Or continue as</span></div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={onGuestLogin}
              variant="ghost" 
              size="lg" 
              className="w-full flex items-center justify-center gap-3 py-6 border border-orange-500/20 hover:bg-orange-500/5 text-orange-500 rounded-sm"
              disabled={isLinking}
            >
              <UserCircle className="w-5 h-5" />
              GUEST ACCOUNT
            </Button>

            {error && <p className="text-[10px] text-red-500 font-black tracking-widest uppercase px-1">{error}</p>}

            <div className="flex items-start gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-sm text-left">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-200/60 leading-relaxed uppercase tracking-wider font-bold">
                <span className="text-orange-500">Warning:</span> Guest progress is <span className="text-white">NOT</span> saved to the cloud and will <span className="text-white">NOT</span> appear on the global leaderboard.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
