import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, linkWithCredential, GoogleAuthProvider, EmailAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Rank } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    
    // Safety timeout to ensure loading state is cleared even if auth hangs
    const safetyTimeout = setTimeout(() => {
      console.warn("Auth initialization timed out, forcing loading state to false");
      setLoading(false);
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimeout);
      // Clean up previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(firebaseUser);
      setIsGuest(false);
      
      try {
        if (firebaseUser) {
          const profileRef = doc(db, 'users', firebaseUser.uid);
          let profileSnap;
          try {
            profileSnap = await getDoc(profileRef);
          } catch (error: any) {
            console.error("Error fetching user profile:", error);
            // If we can't fetch the profile, we should still stop loading
            setLoading(false);
            return;
          }
          
          if (!profileSnap.exists()) {
            const baseUsername = (firebaseUser.displayName || 'Player').replace(/\s+/g, '');
            const uniqueUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
            
            const newProfile: any = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Player',
              username: uniqueUsername,
              usernameLower: uniqueUsername.toLowerCase(),
              photoURL: firebaseUser.photoURL || '',
              email: firebaseUser.email || '',
              elo: 1000,
              rank: 'Plastic',
              wins: 0,
              losses: 0,
              draws: 0,
              streak: 0,
              favoriteMove: null,
              moveStats: { rock: 0, paper: 0, scissors: 0 },
              matchesPlayed: 0,
              botWins: 0,
              botLosses: 0,
              botDraws: 0,
              createdAt: serverTimestamp(),
            };
            await setDoc(profileRef, newProfile);
            
            // Set initial local state
            setProfile({
              ...newProfile,
              createdAt: Date.now(),
            } as UserProfile);
          } else {
            // Set initial profile data immediately if it exists
            const data = profileSnap.data();
            
            // Lazy migration: add usernameLower if missing
            if (!data.usernameLower && data.username) {
              await updateDoc(profileRef, {
                usernameLower: data.username.toLowerCase()
              });
            }

            setProfile({
              ...data,
              createdAt: typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : Date.now(),
            } as UserProfile);
          }

          unsubProfile = onSnapshot(profileRef, (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setProfile({
                ...data,
                createdAt: typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : Date.now(),
              } as UserProfile);
            }
          }, (error) => {
            try {
              handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
            } catch (err) {}
          });

          // Set status to online
          updateDoc(profileRef, { status: 'online' }).catch(() => {});
        } else {
          // If we had a profile, we should set it to offline, but we don't have the UID here easily if firebaseUser is null
          // and we can't reliably do it on logout if the tab is closed.
          setProfile(null);
        }
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.GET, firebaseUser ? `users/${firebaseUser.uid}` : 'auth');
        } catch (err) {}
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const loginAsGuest = () => {
    setIsGuest(true);
    const guestId = 'guest-' + Math.random().toString(36).substr(2, 9);
    const username = `guest_${guestId.split('-')[1]}`;
    setProfile({
      uid: guestId,
      displayName: 'Guest Player',
      username,
      usernameLower: username.toLowerCase(),
      photoURL: '',
      email: '',
      elo: 1000,
      rank: 'Plastic',
      wins: 0,
      losses: 0,
      draws: 0,
      streak: 0,
      favoriteMove: null,
      moveStats: { rock: 0, paper: 0, scissors: 0 },
      matchesPlayed: 0,
      botWins: 0,
      botLosses: 0,
      botDraws: 0,
      createdAt: Date.now(),
      isGuest: true,
    });
    setLoading(false);
  };

  const updateUsername = async (newUsername: string) => {
    if (!profile) return { success: false, error: 'Not authenticated' };
    
    const usernameLower = newUsername.toLowerCase();
    
    // Check if username is taken (case-insensitive check)
    const q = query(collection(db, 'users'), where('usernameLower', '==', usernameLower));
    const querySnapshot = await getDocs(q);
    
    // Filter out current user if they are the one with the username
    const otherUsers = querySnapshot.docs.filter(d => d.id !== profile.uid);
    
    if (otherUsers.length > 0) {
      return { success: false, error: 'Username already taken' };
    }

    if (isGuest) {
      setProfile(prev => prev ? { ...prev, username: newUsername, usernameLower, displayName: newUsername } : null);
      return { success: true };
    }

    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username: newUsername,
        usernameLower: usernameLower,
        displayName: newUsername // Also update display name to match for consistency
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const linkGuestToAccount = async (email: string, pass: string) => {
    if (!isGuest || !profile) return { success: false, error: 'Not a guest' };
    
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser = credential.user;
      
      // Transfer guest data to new account
      const profileRef = doc(db, 'users', newUser.uid);
      await setDoc(profileRef, {
        ...profile,
        uid: newUser.uid,
        email: email,
        isGuest: false,
        createdAt: serverTimestamp(),
      });
      
      setIsGuest(false);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logoutUser = async () => {
    if (isGuest) {
      setIsGuest(false);
      setProfile(null);
      return;
    }
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { status: 'offline' });
      } catch (e) {}
    }
    await auth.signOut();
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return { 
    user, 
    profile, 
    loading, 
    isGuest, 
    loginAsGuest, 
    loginWithEmail,
    loginWithGoogle,
    logout: logoutUser,
    signUpWithEmail,
    updateUsername, 
    linkGuestToAccount 
  };
}
