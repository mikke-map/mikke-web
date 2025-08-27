import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Create or update user profile in Firestore
export const createUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Anonymous User',
    photoURL: user.photoURL,
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    // New user
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      stats: {
        totalSpots: 0,
        totalLikes: 0,
        totalViews: 0,
      },
      preferences: {
        theme: 'light',
        notifications: true,
        privacy: 'public',
      },
      isActive: true,
    });
  } else {
    // Existing user - update login time
    await setDoc(userRef, userData, { merge: true });
  }
};

// Google Sign-In
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  
  const result = await signInWithPopup(auth, provider);
  await createUserProfile(result.user);
  
  return result.user;
};

// Anonymous Sign-In
export const signInAnonymously = async (): Promise<User> => {
  const result = await firebaseSignInAnonymously(auth);
  await createUserProfile(result.user);
  return result.user;
};

// Sign Out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Auth State Observer
export const observeAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};