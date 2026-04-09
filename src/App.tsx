import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Layout } from './components/ui/Layout';
import { Login } from './components/ui/Login';
import { Menu } from './components/ui/Menu';
import { Settings } from './components/ui/Settings';
import { Scene } from './components/3d/Scene';
import { GameOverlay } from './components/ui/GameOverlay';
import { Leaderboard } from './components/ui/Leaderboard';
import { MatchHistory } from './components/ui/MatchHistory';
import { Matchmaking } from './components/ui/Matchmaking';
import { Profile } from './components/ui/Profile';
import { CookieConsent } from './components/ui/CookieConsent';
import { Logo } from './components/ui/Logo';
import { useAuth } from './hooks/useAuth';
import { useGame } from './hooks/useGame';
import { useLeaderboard } from './hooks/useLeaderboard';
import { Scissors } from 'lucide-react';

export default function App() {
  const { 
    profile, 
    loading: authLoading, 
    loginWithGoogle,
    loginAsGuest,
    logout,
    updateUsername
  } = useAuth();

  const { 
    mode, 
    setMode, 
    playerMove, 
    opponentMove, 
    result, 
    isRevealing, 
    countdown, 
    playRound,
    matchmakingStatus,
    startMatchmaking,
    cancelMatchmaking,
    opponentProfile,
    playerScore,
    opponentScore,
    round,
    matchResult,
    partyCode,
    createPrivateMatch,
    joinPrivateMatch,
    joinMatchById,
    resetGame,
    turnTimer,
    leaveMatch
  } = useGame(profile);

  const { 
    entries: leaderboardEntries, 
    loading: leaderboardLoading,
    sortBy: leaderboardSort,
    setSortBy: setLeaderboardSort
  } = useLeaderboard();

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen font-orbitron bg-black">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative w-48 h-48 flex items-center justify-center mb-12">
              <Logo size={200} />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
                NoLuck<span className="text-red-600">RPS</span>
              </h1>
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-red-500 to-transparent"
                  />
                </div>
                <p className="text-zinc-500 font-bold tracking-[0.4em] uppercase text-[8px] animate-pulse">
                  Initializing Tactical Protocol
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {!profile ? (
          <Login 
            key="login" 
            onGoogleLogin={loginWithGoogle}
            onGuestLogin={loginAsGuest}
          />
        ) : mode ? (
          <div key="game" className="relative w-full h-screen">
            <Scene 
              playerMove={playerMove} 
              opponentMove={opponentMove} 
              isRevealing={isRevealing} 
            />
            <GameOverlay 
              countdown={countdown}
              turnTimer={turnTimer}
              playerMove={playerMove}
              opponentMove={opponentMove}
              result={result}
              onMove={playRound}
              isRevealing={isRevealing}
              onExit={leaveMatch}
              playerScore={playerScore}
              opponentScore={opponentScore}
              round={round}
              matchResult={matchResult}
              opponent={opponentProfile}
            />
          </div>
        ) : (
          <Menu 
            key="menu"
            profile={profile}
            onSelectMode={setMode}
            onShowLeaderboard={() => setShowLeaderboard(true)}
            onShowHistory={() => setShowHistory(true)}
            onShowSettings={() => setShowSettings(true)}
            onShowProfile={() => setShowProfile(true)}
            onStartMatchmaking={startMatchmaking}
            onCreatePrivateMatch={createPrivateMatch}
            onJoinPrivateMatch={joinPrivateMatch}
            onJoinMatch={joinMatchById}
            onLogout={logout}
            onUpdateUsername={updateUsername}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {matchmakingStatus !== 'idle' && (
          <Matchmaking 
            key="matchmaking"
            profile={profile!}
            onCancel={cancelMatchmaking}
            status={matchmakingStatus === 'searching' ? 'searching' : matchmakingStatus === 'found' ? 'found' : 'error'}
            opponent={opponentProfile || undefined}
            partyCode={partyCode || undefined}
          />
        )}
        {showLeaderboard && (
          <Leaderboard 
            key="leaderboard"
            entries={leaderboardEntries}
            sortBy={leaderboardSort}
            onSortChange={setLeaderboardSort}
            onClose={() => setShowLeaderboard(false)} 
          />
        )}
        {showHistory && profile && (
          <MatchHistory 
            key="history"
            profile={profile} 
            onClose={() => setShowHistory(false)}
          />
        )}
        {showSettings && (
          <Settings 
            key="settings"
            profile={profile}
            onClose={() => setShowSettings(false)}
          />
        )}
        {showProfile && profile && (
          <Profile 
            key="profile"
            profile={profile}
            onClose={() => setShowProfile(false)}
            onUpdateUsername={updateUsername}
          />
        )}
      </AnimatePresence>

      <CookieConsent onAccept={() => console.log('Cookies accepted')} />
    </Layout>
  );
}
