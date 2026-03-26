import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { LeaderboardEntry } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export type LeaderboardSort = 'elo' | 'wins' | 'botWins';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<LeaderboardSort>('elo');

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'users'),
      orderBy(sortBy, 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leaderboardData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: data.uid,
          displayName: data.displayName,
          username: data.username,
          photoURL: data.photoURL,
          elo: data.elo,
          rank: data.rank,
          wins: data.wins,
          botWins: data.botWins || 0,
        } as LeaderboardEntry;
      });
      setEntries(leaderboardData);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      try {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } catch (err) {
        // Error already logged by handler
      }
    });

    return unsubscribe;
  }, [sortBy]);

  return { entries, loading, sortBy, setSortBy };
}
