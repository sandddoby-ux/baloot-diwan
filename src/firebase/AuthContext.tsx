import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './config';
import { getUserProfile, saveUserProfile, UserProfile } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthReady: boolean;
  userProfile: UserProfile;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  syncProfileToFirestore: (profile: UserProfile) => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [userProfile, setUserProfileState] = useState<UserProfile>(getUserProfile());

  const refreshProfile = useCallback(() => {
    setUserProfileState(getUserProfile());
  }, []);

  // Listen to external updates to user profile (e.g. storage changes)
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserProfile>;
      if (customEvent.detail) {
        setUserProfileState(customEvent.detail);
      } else {
        refreshProfile();
      }
    };

    window.addEventListener('baloot_user_updated', handleUpdate);
    window.addEventListener('baloot_user_reset', refreshProfile);
    return () => {
      window.removeEventListener('baloot_user_updated', handleUpdate);
      window.removeEventListener('baloot_user_reset', refreshProfile);
    };
  }, [refreshProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);

      if (user) {
        // Sync user profile from Firestore if it exists
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          const currentLocal = getUserProfile();

          // Determine authentic display name from Google / Firebase Account
          const accountName = user.displayName || (user.email ? user.email.split('@')[0] : null);

          if (snapshot.exists()) {
            const data = snapshot.data();
            const mergedProfile: UserProfile = {
              ...currentLocal,
              id: user.uid,
              name: data.name || accountName || currentLocal.name || 'لاعب ديوان',
              email: user.email || data.email || undefined,
              avatar: data.avatar || currentLocal.avatar || '🦅',
              level: data.level ?? currentLocal.level ?? 1,
              xp: data.xp ?? currentLocal.xp ?? 0,
              coins: data.coins ?? currentLocal.coins ?? 0,
              isSubscriber: data.isSubscriber ?? false,
              subscriptionPlan: data.subscriptionPlan || 'free',
              tableTheme: data.tableTheme || currentLocal.tableTheme || 'emerald',
              cardBackTheme: data.cardBackTheme || currentLocal.cardBackTheme || 'heritage_gold',
              stats: data.stats || currentLocal.stats || {
                matchesPlayed: 0,
                matchesWon: 0,
                matchesLost: 0,
                sunWins: 0,
                hokomWins: 0,
                kabootsAchieved: 0,
                totalAbnatScored: 0,
                winRate: 0,
              },
            };
            setUserProfileState(mergedProfile);
            saveUserProfile(mergedProfile);
          } else {
            // First time creating user doc in Firestore - store REAL values only
            const realName = accountName || (currentLocal.name !== 'لاعب جديد' ? currentLocal.name : 'لاعب ديوان');
            const initialDoc = {
              userId: user.uid,
              name: realName,
              email: user.email || null,
              avatar: currentLocal.avatar || '🦅',
              level: currentLocal.level ?? 1,
              xp: currentLocal.xp ?? 0,
              coins: currentLocal.coins ?? 0,
              isSubscriber: currentLocal.isSubscriber ?? false,
              subscriptionPlan: currentLocal.subscriptionPlan || 'free',
              tableTheme: currentLocal.tableTheme || 'emerald',
              cardBackTheme: currentLocal.cardBackTheme || 'heritage_gold',
              stats: currentLocal.stats || {
                matchesPlayed: 0,
                matchesWon: 0,
                matchesLost: 0,
                sunWins: 0,
                hokomWins: 0,
                kabootsAchieved: 0,
                totalAbnatScored: 0,
                winRate: 0,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialDoc);
            const updatedProfile: UserProfile = {
              ...currentLocal,
              id: user.uid,
              name: initialDoc.name,
              email: user.email || undefined,
            };
            setUserProfileState(updatedProfile);
            saveUserProfile(updatedProfile);
          }
        } catch (error) {
          console.warn('Could not sync user profile from Firestore:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google sign-in error:', err);
      try {
        await signInAnonymously(auth);
      } catch (anonErr) {
        handleFirestoreError(anonErr, OperationType.GET, 'auth/signIn');
      }
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'auth/anonymous');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    refreshProfile();
  };

  const syncProfileToFirestore = async (profile: UserProfile) => {
    setUserProfileState(profile);
    saveUserProfile(profile);

    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(
          userDocRef,
          {
            userId: currentUser.uid,
            name: profile.name,
            email: currentUser.email || profile.email || null,
            avatar: profile.avatar,
            level: profile.level,
            xp: profile.xp,
            coins: profile.coins,
            stats: profile.stats,
            isSubscriber: profile.isSubscriber,
            subscriptionPlan: profile.subscriptionPlan || 'free',
            tableTheme: profile.tableTheme,
            cardBackTheme: profile.cardBackTheme,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthReady,
        userProfile,
        loginWithGoogle,
        loginAsGuest,
        logout,
        syncProfileToFirestore,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  return context;
};
