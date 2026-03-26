import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Particles } from './Particles';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100 font-orbitron selection:bg-red-500/30 selection:text-red-200 overflow-hidden">
      {/* Background Particles */}
      <Particles />

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-red-900/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-900/5 blur-[150px] rounded-full" />
      </div>

      {/* Content */}
      <main className="relative z-10 w-full h-full min-h-screen flex flex-col">
        {children}
      </main>

      {/* Global Overlay Elements (Toasts, Modals, etc.) */}
      <div id="modal-root" />
    </div>
  );
};
