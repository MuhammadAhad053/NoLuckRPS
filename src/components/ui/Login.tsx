import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserCircle } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';

interface LoginProps {
  onGoogleLogin: () => Promise<void>;
  onGuestLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onGoogleLogin, onGuestLogin }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await onGoogleLogin();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('User closed the sign-in popup');
      } else {
        setError(err.message || 'Failed to sign in with Google');
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
        <div className="space-y-8 relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <Logo size={200} />
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

          <Button 
            onClick={onGuestLogin}
            variant="ghost"
            size="lg" 
            className="w-full flex items-center justify-center gap-3 py-6 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-sm border border-white/5"
          >
            <UserCircle className="w-5 h-5" />
            CONTINUE AS GUEST
          </Button>

          {error && <p className="text-[10px] text-red-500 font-black tracking-widest uppercase px-1">{error}</p>}
        </div>
      </motion.div>
    </div>
  );
};
