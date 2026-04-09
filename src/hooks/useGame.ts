import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, updateDoc, increment, serverTimestamp, setDoc, onSnapshot, collection, query, where, getDocs, deleteDoc, addDoc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Move, GameResult, GameMode, UserProfile, Match } from '../types';
import { RANKS, SOUNDS } from '../constants';
import { useAudio } from './useAudio';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export function useGame(profile: UserProfile | null) {
  const { playSound } = useAudio();
  const [mode, setMode] = useState<GameMode>(null);
  const [playerMove, setPlayerMove] = useState<Move>(null);
  const [opponentMove, setOpponentMove] = useState<Move>(null);
  const [result, setResult] = useState<GameResult>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [history, setHistory] = useState<Move[]>([]);
  
  // Best of Three State
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [matchResult, setMatchResult] = useState<GameResult>(null);
  const [matchMoves, setMatchMoves] = useState<Move[]>([]);
  const [round, setRound] = useState(1);

  // Multiplayer State
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');
  const [opponentProfile, setOpponentProfile] = useState<UserProfile | null>(null);
  const [partyCode, setPartyCode] = useState<string | null>(null);
  const [turnTimer, setTurnTimer] = useState<number | null>(null);

  // Refs to prevent double processing
  const lastProcessedMatchId = useRef<string | null>(null);
  const matchmakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const matchmakingUnsubRef = useRef<(() => void) | null>(null);

  // Cleanup on mount/unmount
  useEffect(() => {
    if (profile?.uid) {
      // Clear any stale matchmaking request on mount
      deleteDoc(doc(db, 'matchmaking', profile.uid)).catch(() => {});
    }
    return () => {
      if (matchmakingTimeoutRef.current) clearTimeout(matchmakingTimeoutRef.current);
      if (matchmakingUnsubRef.current) matchmakingUnsubRef.current();
    };
  }, [profile?.uid]);

  const getBotMove = useCallback(() => {
    if (history.length < 3) {
      const moves: Move[] = ['rock', 'paper', 'scissors'];
      return moves[Math.floor(Math.random() * 3)];
    }
    const lastMove = history[history.length - 1];
    const secondLastMove = history[history.length - 2];
    if (lastMove === secondLastMove) {
      if (lastMove === 'rock') return 'paper';
      if (lastMove === 'paper') return 'scissors';
      if (lastMove === 'scissors') return 'rock';
    }
    const moves: Move[] = ['rock', 'paper', 'scissors'];
    return moves[Math.floor(Math.random() * 3)];
  }, [history]);

  const updateStats = useCallback(async (finalResult: GameResult, oppName?: string, finalPlayerScore?: number, finalOpponentScore?: number) => {
    if (!profile) return;

    const profileRef = doc(db, 'users', profile.uid);
    let eloChange = 0;
    if (finalResult === 'win') {
      eloChange = mode === 'single' ? 10 : 25;
    } else if (finalResult === 'loss') {
      eloChange = mode === 'single' ? -5 : -15;
    }

    const newElo = Math.max(0, profile.elo + eloChange);
    let newRank = profile.rank;
    
    // Find appropriate rank
    const rankEntries = Object.values(RANKS).sort((a, b) => b.minElo - a.minElo);
    for (const r of rankEntries) {
      if (newElo >= r.minElo) {
        newRank = r.name;
        break;
      }
    }

    try {
      const newMoveStats = { ...(profile.moveStats || { rock: 0, paper: 0, scissors: 0 }) };
      matchMoves.forEach(m => {
        if (m) newMoveStats[m]++;
      });

      const favoriteMove = (Object.keys(newMoveStats) as Move[]).reduce((a, b) => 
        newMoveStats[a] > newMoveStats[b] ? a : b
      );

      await updateDoc(profileRef, {
        elo: newElo,
        rank: newRank,
        wins: finalResult === 'win' && mode !== 'single' ? increment(1) : increment(0),
        botWins: finalResult === 'win' && mode === 'single' ? increment(1) : increment(0),
        losses: finalResult === 'loss' && mode !== 'single' ? increment(1) : increment(0),
        botLosses: finalResult === 'loss' && mode === 'single' ? increment(1) : increment(0),
        draws: finalResult === 'draw' && mode !== 'single' ? increment(1) : increment(0),
        botDraws: finalResult === 'draw' && mode === 'single' ? increment(1) : increment(0),
        streak: finalResult === 'win' ? increment(1) : 0,
        matchesPlayed: increment(1),
        moveStats: newMoveStats,
        favoriteMove,
        updatedAt: serverTimestamp(),
      });

      // Record History
      const historyRef = collection(db, 'users', profile.uid, 'history');
      await addDoc(historyRef, {
        opponentName: oppName || (mode === 'single' ? 'CyberBot v1.0' : opponentProfile?.displayName || 'Unknown'),
        result: finalResult,
        playerScore: finalPlayerScore !== undefined ? finalPlayerScore : playerScore,
        opponentScore: finalOpponentScore !== undefined ? finalOpponentScore : opponentScore,
        mode: mode,
        previousElo: profile.elo,
        eloChange: eloChange,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  }, [profile, mode, opponentProfile, playerScore, opponentScore]);

  // Sync with Firestore Match
  useEffect(() => {
    if (!currentMatch?.id || mode === 'single') return;

    const unsub = onSnapshot(doc(db, 'matches', currentMatch.id), async (docSnap) => {
      if (!docSnap.exists()) {
        resetGame();
        return;
      }

      const matchData = docSnap.data() as Match;
      setCurrentMatch(matchData);
      setRound(matchData.round);
      setPlayerScore(matchData.scores[profile?.uid || ''] || 0);
      
      const opponentUid = matchData.players.find(id => id !== profile?.uid);
      setOpponentScore(matchData.scores[opponentUid || ''] || 0);

      // Handle Round Resolution
      if (matchData.status === 'revealing' && !isRevealing) {
        setIsRevealing(true);
        const myMove = matchData.moves[profile?.uid || ''];
        const oppMove = matchData.moves[opponentUid || ''];
        
        setPlayerMove(myMove);
        setOpponentMove(oppMove);

        // Determine round result locally for UI
        if (myMove === oppMove) setResult('draw');
        else if (!myMove && oppMove) setResult('loss');
        else if (myMove && !oppMove) setResult('win');
        else if (
          (myMove === 'rock' && oppMove === 'scissors') ||
          (myMove === 'paper' && oppMove === 'rock') ||
          (myMove === 'scissors' && oppMove === 'paper')
        ) setResult('win');
        else setResult('loss');

        setTimeout(async () => {
          setIsRevealing(false);
          setPlayerMove(null);
          setOpponentMove(null);
          setResult(null);
          
          // Only one player needs to trigger the next round/finish
          if (profile?.uid === matchData.players[0]) {
            const p1Score = matchData.scores[matchData.players[0]];
            const p2Score = matchData.scores[matchData.players[1]];
            
            if (p1Score >= 2 || p2Score >= 2) {
              const winner = p1Score >= 2 ? matchData.players[0] : matchData.players[1];
              await updateDoc(doc(db, 'matches', matchData.id), {
                status: 'finished',
                winner,
                updatedAt: serverTimestamp()
              });
            } else {
              await updateDoc(doc(db, 'matches', matchData.id), {
                status: 'playing',
                moves: {},
                round: increment(1),
                updatedAt: serverTimestamp()
              });
            }
          }
        }, 3000);
      }

      // Handle Match Finish
      if (matchData.status === 'finished' && !matchResult && lastProcessedMatchId.current !== matchData.id) {
        lastProcessedMatchId.current = matchData.id;
        const winner = matchData.winner;
        const finalResult = winner === profile?.uid ? 'win' : winner === null ? 'draw' : 'loss';
        setMatchResult(finalResult);
        
        const opponentUid = matchData.players.find(id => id !== profile?.uid);
        const myScore = matchData.scores[profile?.uid || ''] || 0;
        const oppScore = matchData.scores[opponentUid || ''] || 0;
        
        await updateStats(finalResult, undefined, myScore, oppScore);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `matches/${currentMatch.id}`);
    });

    return () => unsub();
  }, [currentMatch?.id, profile?.uid, isRevealing, mode]);

  // Turn Timer Logic
  useEffect(() => {
    if (mode === 'single' || !currentMatch || currentMatch.status !== 'playing' || isRevealing || playerMove) {
      setTurnTimer(null);
      return;
    }

    setTurnTimer(10);
    const timer = setInterval(async () => {
      setTurnTimer(prev => {
        if (prev === 1) {
          clearInterval(timer);
          // Auto-submit null move if time runs out
          if (!playerMove) submitMove(null);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMatch?.status, currentMatch?.round, mode, playerMove]);

  // ... other states ...

  const submitMove = async (move: Move) => {
    if (!profile || !currentMatch || currentMatch.status !== 'playing' || playerMove) return;
    
    setPlayerMove(move);
    if (move) setMatchMoves(prev => [...prev, move]);
    playSound(SOUNDS.MOVE);

    const matchRef = doc(db, 'matches', currentMatch.id);
    const opponentUid = currentMatch.players.find(id => id !== profile.uid);
    
    try {
      // Use a transaction to avoid race conditions when both players submit moves
      const { runTransaction } = await import('firebase/firestore');
      await runTransaction(db, async (transaction) => {
        const matchDoc = await transaction.get(matchRef);
        if (!matchDoc.exists()) return;
        
        const matchData = matchDoc.data() as Match;
        if (matchData.status !== 'playing') return;
        
        const updates: any = {
          [`moves.${profile.uid}`]: move,
          updatedAt: serverTimestamp()
        };

        const oppMove = matchData.moves[opponentUid || ''];
        if (oppMove !== undefined) {
          // Both players have moved, resolve round
          updates.status = 'revealing';
          
          const myMove = move;
          const newScores = { ...matchData.scores };
          
          if (myMove !== oppMove) {
            if (!myMove && oppMove) newScores[opponentUid!] += 1;
            else if (myMove && !oppMove) newScores[profile.uid] += 1;
            else if (
              (myMove === 'rock' && oppMove === 'scissors') ||
              (myMove === 'paper' && oppMove === 'rock') ||
              (myMove === 'scissors' && oppMove === 'paper')
            ) newScores[profile.uid] += 1;
            else newScores[opponentUid!] += 1;
          }
          updates.scores = newScores;
        }
        
        transaction.update(matchRef, updates);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `matches/${currentMatch.id}`);
    }
  };

  const playRound = async (move: Move) => {
    if (mode === 'single') {
      if (isRevealing || matchResult) return;
      
      setPlayerMove(move);
      setHistory(prev => [...prev, move]);
      playSound(SOUNDS.MOVE);
      
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(timer);
            return null;
          }
          if (prev) playSound(SOUNDS.COUNTDOWN);
          return prev ? prev - 1 : null;
        });
      }, 1000);
      playSound(SOUNDS.COUNTDOWN);

      await new Promise(resolve => setTimeout(resolve, 3000));

      setIsRevealing(true);
      const botMove = getBotMove();
      setOpponentMove(botMove);

      let roundResult: GameResult = null;
      if (move === botMove) {
        roundResult = 'draw';
        playSound(SOUNDS.DRAW);
      } else if (
        (move === 'rock' && botMove === 'scissors') ||
        (move === 'paper' && botMove === 'rock') ||
        (move === 'scissors' && botMove === 'paper')
      ) {
        roundResult = 'win';
        playSound(SOUNDS.WIN);
      } else {
        roundResult = 'loss';
        playSound(SOUNDS.LOSS);
      }

      setResult(roundResult);

      if (roundResult === 'win') {
        const newScore = playerScore + 1;
        setPlayerScore(newScore);
        if (newScore === 2) {
          setMatchResult('win');
          await updateStats('win', 'CyberBot v1.0', newScore, opponentScore);
        }
      } else if (roundResult === 'loss') {
        const newScore = opponentScore + 1;
        setOpponentScore(newScore);
        if (newScore === 2) {
          setMatchResult('loss');
          await updateStats('loss', 'CyberBot v1.0', playerScore, newScore);
        }
      }

      setTimeout(() => {
        setIsRevealing(false);
        setPlayerMove(null);
        setOpponentMove(null);
        setResult(null);
        if (!matchResult) setRound(prev => prev + 1);
      }, 3000);
    } else {
      await submitMove(move);
    }
  };

  const cancelMatchmaking = async () => {
    if (!profile) return;
    if (matchmakingTimeoutRef.current) {
      clearTimeout(matchmakingTimeoutRef.current);
      matchmakingTimeoutRef.current = null;
    }
    if (matchmakingUnsubRef.current) {
      matchmakingUnsubRef.current();
      matchmakingUnsubRef.current = null;
    }
    try {
      await deleteDoc(doc(db, 'matchmaking', profile.uid)).catch(() => {});
      setMatchmakingStatus('idle');
      setMode(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `matchmaking/${profile.uid}`);
    }
  };

  const startMatchmaking = async () => {
    if (!profile) return;
    
    // Clear any existing matchmaking first
    if (matchmakingUnsubRef.current) {
      matchmakingUnsubRef.current();
      matchmakingUnsubRef.current = null;
    }
    if (matchmakingTimeoutRef.current) {
      clearTimeout(matchmakingTimeoutRef.current);
      matchmakingTimeoutRef.current = null;
    }

    setMatchmakingStatus('searching');
    playSound(SOUNDS.CLICK);

    const createMatchWithPlayer = async (otherId: string) => {
      const matchId = `match_${Date.now()}`;
      const matchData: any = {
        id: matchId,
        players: [otherId, profile.uid],
        moves: {},
        scores: { [otherId]: 0, [profile.uid]: 0 },
        status: 'playing',
        winner: null,
        round: 1,
        mode: 'multi-ranked',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'matches', matchId), matchData);
      setCurrentMatch(matchData);
      setMatchmakingStatus('found');
      
      await updateDoc(doc(db, 'matchmaking', otherId), { status: 'matched', matchId });
      await setDoc(doc(db, 'matchmaking', profile.uid), { 
        uid: profile.uid, elo: profile.elo, status: 'matched', matchId, createdAt: serverTimestamp() 
      });
      playSound(SOUNDS.MATCH_FOUND);

      setTimeout(() => {
        setMatchmakingStatus('idle');
        setMode('multi-ranked');
      }, 3000);
    };

    try {
      // 1. Initial check: +- 100 ELO
      const q = query(
        collection(db, 'matchmaking'),
        where('status', '==', 'searching'),
        where('elo', '>=', profile.elo - 100),
        where('elo', '<=', profile.elo + 100)
      );

      const snapshot = await getDocs(q);
      const otherRequest = snapshot.docs.find(d => d.id !== profile.uid);

      if (otherRequest) {
        await createMatchWithPlayer(otherRequest.id);
        // Delete our matchmaking request if it exists (unlikely here but good practice)
        await deleteDoc(doc(db, 'matchmaking', profile.uid)).catch(() => {});
      } else {
        // 2. Create our own request
        await setDoc(doc(db, 'matchmaking', profile.uid), {
          uid: profile.uid,
          elo: profile.elo,
          status: 'searching',
          createdAt: serverTimestamp(),
        });

        // Listen for match
        matchmakingUnsubRef.current = onSnapshot(doc(db, 'matchmaking', profile.uid), async (docSnap) => {
          const data = docSnap.data();
          if (data?.status === 'matched') {
            if (matchmakingTimeoutRef.current) {
              clearTimeout(matchmakingTimeoutRef.current);
              matchmakingTimeoutRef.current = null;
            }
            
            // Unsubscribe immediately to prevent multiple triggers
            if (matchmakingUnsubRef.current) {
              matchmakingUnsubRef.current();
              matchmakingUnsubRef.current = null;
            }
            
            setMatchmakingStatus('found');
            playSound(SOUNDS.MATCH_FOUND);
            
            try {
              const matchSnap = await getDoc(doc(db, 'matches', data.matchId));
              if (matchSnap.exists()) {
                const matchData = matchSnap.data() as Match;
                setCurrentMatch(matchData);
                const opponentUid = matchData.players.find(id => id !== profile.uid);
                if (opponentUid) {
                  const oppSnap = await getDoc(doc(db, 'users', opponentUid));
                  if (oppSnap.exists()) setOpponentProfile(oppSnap.data() as UserProfile);
                }
              }
              
              // Delete the matchmaking document now that we've found a match
              await deleteDoc(doc(db, 'matchmaking', profile.uid)).catch(() => {});
            } catch (err) {
              handleFirestoreError(err, OperationType.GET, `matches/${data.matchId}`);
            }

            setTimeout(() => {
              setMatchmakingStatus('idle');
              setMode('multi-ranked');
            }, 3000);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `matchmaking/${profile.uid}`);
          setMatchmakingStatus('error');
        });

        // 3. Expanded search after 6 seconds
        matchmakingTimeoutRef.current = setTimeout(async () => {
          const currentSnap = await getDoc(doc(db, 'matchmaking', profile.uid));
          if (currentSnap.exists() && currentSnap.data().status === 'searching') {
            const qAny = query(
              collection(db, 'matchmaking'),
              where('status', '==', 'searching')
            );
            const anySnap = await getDocs(qAny);
            const candidates = anySnap.docs.filter(d => d.id !== profile.uid);
            
            if (candidates.length > 0) {
              const closest = candidates.reduce((prev, curr) => {
                const prevDiff = Math.abs(prev.data().elo - profile.elo);
                const currDiff = Math.abs(curr.data().elo - profile.elo);
                return currDiff < prevDiff ? curr : prev;
              });
              
              await createMatchWithPlayer(closest.id);
              if (matchmakingUnsubRef.current) {
                matchmakingUnsubRef.current();
                matchmakingUnsubRef.current = null;
              }
            }
          }
        }, 6000);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'matchmaking');
      setMatchmakingStatus('error');
    }
  };

  const createPrivateMatch = async () => {
    if (!profile) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setPartyCode(code);
    setMatchmakingStatus('searching');

    const matchId = `private_${code}`;
    const matchData: any = {
      id: matchId,
      players: [profile.uid],
      moves: {},
      scores: { [profile.uid]: 0 },
      status: 'waiting',
      winner: null,
      round: 1,
      mode: 'multi-private',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'matches', matchId), matchData);
      setCurrentMatch(matchData);

      // Listen for opponent joining
      const unsub = onSnapshot(doc(db, 'matches', matchId), async (docSnap) => {
        const data = docSnap.data() as Match;
        if (data?.players.length === 2) {
          setMatchmakingStatus('found');
          playSound(SOUNDS.MATCH_FOUND);
          const opponentUid = data.players.find(id => id !== profile.uid);
          if (opponentUid) {
            const oppSnap = await getDoc(doc(db, 'users', opponentUid));
            if (oppSnap.exists()) {
              setOpponentProfile(oppSnap.data() as UserProfile);
            }
          }
          setTimeout(() => {
            setMatchmakingStatus('idle');
            setMode('multi-private');
          }, 3000);
          unsub();
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `matches/${matchId}`);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `matches/${matchId}`);
    }
  };

  const joinPrivateMatch = async (code: string) => {
    if (!profile) return;
    const matchId = `private_${code.toUpperCase()}`;
    const matchRef = doc(db, 'matches', matchId);
    
    try {
      const matchSnap = await getDoc(matchRef);

      if (!matchSnap.exists()) {
        throw new Error('Invalid party code');
      }

      const matchData = matchSnap.data() as Match;
      if (matchData.players.length >= 2) {
        throw new Error('Match is full');
      }

      await updateDoc(matchRef, {
        players: [...matchData.players, profile.uid],
        [`scores.${profile.uid}`]: 0,
        status: 'playing',
        updatedAt: serverTimestamp()
      });

      setCurrentMatch({
        ...matchData,
        players: [...matchData.players, profile.uid],
        scores: { ...matchData.scores, [profile.uid]: 0 },
        status: 'playing'
      });
      setMatchmakingStatus('found');
      playSound(SOUNDS.MATCH_FOUND);
      
      const opponentUid = matchData.players[0];
      const oppSnap = await getDoc(doc(db, 'users', opponentUid));
      if (oppSnap.exists()) {
        setOpponentProfile(oppSnap.data() as UserProfile);
      }

      setTimeout(() => {
        setMatchmakingStatus('idle');
        setMode('multi-private');
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `matches/${matchId}`);
    }
  };

  const leaveMatch = async () => {
    if (!currentMatch || matchResult) {
      resetGame();
      return;
    }

    // If match is active, it's a forfeit
    if (currentMatch.status !== 'finished') {
      const opponentUid = currentMatch.players.find(id => id !== profile?.uid);
      try {
        await updateDoc(doc(db, 'matches', currentMatch.id), {
          status: 'finished',
          winner: opponentUid,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `matches/${currentMatch.id}`);
      }
    }
    resetGame();
  };

  const joinMatchById = async (matchId: string) => {
    if (!profile) return;
    const matchRef = doc(db, 'matches', matchId);
    
    try {
      const matchSnap = await getDoc(matchRef);
      if (!matchSnap.exists()) return;

      const matchData = matchSnap.data() as Match;
      
      // If we're already in the match, just set it
      if (matchData.players.includes(profile.uid)) {
        const opponentUid = matchData.players.find(id => id !== profile.uid);
        if (opponentUid) {
          const oppSnap = await getDoc(doc(db, 'users', opponentUid));
          if (oppSnap.exists()) setOpponentProfile(oppSnap.data() as UserProfile);
        }

        setCurrentMatch(matchData);
        setMatchmakingStatus('found');
        playSound(SOUNDS.MATCH_FOUND);

        setTimeout(() => {
          setMatchmakingStatus('idle');
          setMode(matchData.mode);
        }, 3000);
        return;
      }

      // Otherwise join it
      await updateDoc(matchRef, {
        players: [...matchData.players, profile.uid],
        [`scores.${profile.uid}`]: 0,
        status: 'playing',
        updatedAt: serverTimestamp()
      });

      const opponentUid = matchData.players[0];
      const oppSnap = await getDoc(doc(db, 'users', opponentUid));
      if (oppSnap.exists()) {
        setOpponentProfile(oppSnap.data() as UserProfile);
      }

      setCurrentMatch({
        ...matchData,
        players: [...matchData.players, profile.uid],
        scores: { ...matchData.scores, [profile.uid]: 0 },
        status: 'playing'
      });
      
      setMatchmakingStatus('found');
      playSound(SOUNDS.MATCH_FOUND);

      setTimeout(() => {
        setMatchmakingStatus('idle');
        setMode(matchData.mode);
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `matches/${matchId}`);
    }
  };

  const resetGame = () => {
    setMode(null);
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setMatchResult(null);
    setMatchMoves([]);
    setRound(1);
    setMatchmakingStatus('idle');
    setOpponentProfile(null);
    setCurrentMatch(null);
    setTurnTimer(null);
  };

  return {
    mode,
    setMode,
    playerMove,
    opponentMove,
    result,
    isRevealing,
    countdown,
    playRound,
    playerScore,
    opponentScore,
    matchResult,
    round,
    matchmakingStatus,
    startMatchmaking,
    cancelMatchmaking,
    opponentProfile,
    partyCode,
    createPrivateMatch,
    joinPrivateMatch,
    joinMatchById,
    resetGame,
    turnTimer,
    leaveMatch
  };
};
