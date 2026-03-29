import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Friend, FriendRequest, GameInvite } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export function useSocial(profile: UserProfile | null) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<GameInvite[]>([]);
  const [lastInviteTime, setLastInviteTime] = useState<{ [uid: string]: number }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile || profile.isGuest) return;

    // Listen for friends
    const unsubFriends = onSnapshot(collection(db, 'users', profile.uid, 'friends'), (snapshot) => {
      const friendList: Friend[] = [];
      snapshot.forEach(d => friendList.push(d.data() as Friend));
      
      // For each friend, we should ideally listen to their user document for real-time status
      // But for simplicity, we'll just use the data in the friends subcollection for now
      // and assume the status is updated there.
      // Wait, let's actually try to listen to the users collection for these friends.
      setFriends(friendList);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/friends`);
      } catch (err) {}
    });

    // To make friend status real-time, we can listen to the users collection for our friends
    // This is a bit more complex, but let's try a simpler approach:
    // When a user's status changes, we should update it in their friends' subcollections.
    // But that's a lot of writes.
    // Instead, let's just listen to the users document for each friend in the UI.

    // Listen for incoming friend requests
    const qIncoming = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', profile.uid),
      where('status', '==', 'pending')
    );
    const unsubIncoming = onSnapshot(qIncoming, (snapshot) => {
      const requestList: FriendRequest[] = [];
      snapshot.forEach(d => requestList.push({ id: d.id, ...d.data() } as FriendRequest));
      setFriendRequests(requestList);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'friendRequests');
      } catch (err) {}
    });

    // Listen for outgoing friend requests
    const qOutgoing = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', profile.uid),
      where('status', '==', 'pending')
    );
    const unsubOutgoing = onSnapshot(qOutgoing, (snapshot) => {
      const requestList: FriendRequest[] = [];
      snapshot.forEach(d => requestList.push({ id: d.id, ...d.data() } as FriendRequest));
      setOutgoingRequests(requestList);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'friendRequests');
      } catch (err) {}
    });

    // Listen for incoming game invites
    const qInvites = query(
      collection(db, 'gameInvites'),
      where('toUid', '==', profile.uid),
      where('status', '==', 'pending')
    );
    const unsubInvites = onSnapshot(qInvites, (snapshot) => {
      const inviteList: GameInvite[] = [];
      const now = Date.now();
      snapshot.forEach(d => {
        const data = d.data() as GameInvite;
        const timestamp = data.timestamp?.toMillis() || now;
        // 3 minutes expiration
        if (now - timestamp < 180000) {
          inviteList.push({ id: d.id, ...data } as GameInvite);
        }
      });
      setIncomingInvites(inviteList);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'gameInvites');
      } catch (err) {}
    });

    // Listen for outgoing game invites to detect when they are accepted
    // Only listen for invites created in the last 5 minutes to avoid joining old matches
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const qOutgoingInvites = query(
      collection(db, 'gameInvites'),
      where('fromUid', '==', profile.uid),
      where('status', '==', 'accepted'),
      where('timestamp', '>=', fiveMinutesAgo)
    );
    const unsubOutgoingInvites = onSnapshot(qOutgoingInvites, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const data = change.doc.data() as GameInvite;
          if (data.status === 'accepted' && data.matchId) {
            // Check if it's very recent (within last 30 seconds) to avoid auto-joining on refresh
            const timestamp = data.timestamp?.toMillis() || Date.now();
            if (Date.now() - timestamp < 30000) {
              setAcceptedMatch({ matchId: data.matchId, inviteId: change.doc.id });
            }
          }
        }
      });
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'gameInvites');
      } catch (err) {}
    });

    return () => {
      unsubFriends();
      unsubIncoming();
      unsubOutgoing();
      unsubInvites();
      unsubOutgoingInvites();
    };
  }, [profile]);

  const [acceptedMatch, setAcceptedMatch] = useState<{ matchId: string, inviteId: string } | null>(null);

  const clearAcceptedMatch = () => setAcceptedMatch(null);

  const searchUsers = async (username: string) => {
    if (!username || !profile) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      // Using usernameLower for case-insensitive search
      const searchStr = username.toLowerCase();
      const q = query(
        collection(db, 'users'),
        where('usernameLower', '>=', searchStr),
        where('usernameLower', '<=', searchStr + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(d => d.data() as UserProfile)
        .filter(u => u.uid !== profile.uid);
      setSearchResults(results);
    } catch (error) {
      console.error("Search Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUser: UserProfile) => {
    if (!profile) return;
    
    // Check if already friends
    const isFriend = friends.some(f => f.uid === targetUser.uid);
    if (isFriend) return;

    // Check if request already exists (incoming or outgoing)
    const isPendingOutgoing = outgoingRequests.some(r => r.toUid === targetUser.uid);
    const isPendingIncoming = friendRequests.some(r => r.fromUid === targetUser.uid);
    if (isPendingOutgoing || isPendingIncoming) return;

    const requestId = `${profile.uid}_${targetUser.uid}`;
    await setDoc(doc(db, 'friendRequests', requestId), {
      fromUid: profile.uid,
      fromDisplayName: profile.displayName,
      fromUsername: profile.username,
      fromPhotoURL: profile.photoURL || '',
      fromElo: profile.elo,
      fromRank: profile.rank,
      toUid: targetUser.uid,
      status: 'pending',
      timestamp: serverTimestamp()
    });
  };

  const acceptFriendRequest = async (request: FriendRequest) => {
    if (!profile) return;

    try {
      // Add to current user's friends
      const friendDataForMe: Friend = {
        uid: request.fromUid,
        displayName: request.fromDisplayName,
        username: request.fromUsername,
        photoURL: request.fromPhotoURL,
        elo: request.fromElo,
        rank: request.fromRank,
        status: 'offline'
      };
      await setDoc(doc(db, 'users', profile.uid, 'friends', request.fromUid), friendDataForMe);

      // Add to other user's friends (allowed by rules update)
      const friendDataForThem: Friend = {
        uid: profile.uid,
        displayName: profile.displayName,
        username: profile.username,
        photoURL: profile.photoURL || '',
        elo: profile.elo,
        rank: profile.rank,
        status: 'offline'
      };
      await setDoc(doc(db, 'users', request.fromUid, 'friends', profile.uid), friendDataForThem);

      // Delete request document
      await deleteDoc(doc(db, 'friendRequests', request.id));
    } catch (error) {
      console.error("Accept Friend Request Error:", error);
      // Even if one write fails, try to delete the request to avoid stuck UI
      try {
        await deleteDoc(doc(db, 'friendRequests', request.id));
      } catch (e) {}
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  };

  const removeFriend = async (friendUid: string) => {
    if (!profile) return;
    try {
      // Delete from my list
      await deleteDoc(doc(db, 'users', profile.uid, 'friends', friendUid));
      // Delete from their list (allowed by rules update)
      await deleteDoc(doc(db, 'users', friendUid, 'friends', profile.uid));
    } catch (error) {
      console.error("Remove Friend Error:", error);
    }
  };

  const sendInvite = async (targetUid: string) => {
    if (!profile) return;
    
    const now = Date.now();
    if (lastInviteTime[targetUid] && now - lastInviteTime[targetUid] < 30000) {
      throw new Error('Wait 30s before re-inviting');
    }

    const inviteId = `${profile.uid}_${targetUid}_${Date.now()}`;
    await setDoc(doc(db, 'gameInvites', inviteId), {
      fromUid: profile.uid,
      fromDisplayName: profile.displayName,
      fromUsername: profile.username,
      fromPhotoURL: profile.photoURL || '',
      toUid: targetUid,
      status: 'pending',
      timestamp: serverTimestamp()
    });

    setLastInviteTime(prev => ({ ...prev, [targetUid]: now }));
  };

  const acceptInvite = async (invite: GameInvite) => {
    if (!profile) return;
    try {
      const matchId = `invite_${invite.id}`;
      const matchData = {
        id: matchId,
        players: [invite.fromUid, profile.uid],
        moves: {},
        scores: { [invite.fromUid]: 0, [profile.uid]: 0 },
        status: 'playing',
        winner: null,
        round: 1,
        mode: 'multi-private',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'matches', matchId), matchData);
      await updateDoc(doc(db, 'gameInvites', invite.id), {
        status: 'accepted',
        matchId
      });
      return matchId;
    } catch (error) {
      console.error("Accept Invite Error:", error);
    }
  };

  const rejectInvite = async (inviteId: string) => {
    await updateDoc(doc(db, 'gameInvites', inviteId), {
      status: 'rejected'
    });
  };

  const deleteInvite = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, 'gameInvites', inviteId));
    } catch (error) {
      console.error("Delete Invite Error:", error);
    }
  };

  return { 
    friends, 
    friendRequests,
    outgoingRequests,
    incomingInvites,
    searchResults, 
    searchUsers, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    removeFriend,
    sendInvite,
    acceptInvite,
    rejectInvite,
    deleteInvite,
    acceptedMatch,
    clearAcceptedMatch,
    loading 
  };
}
