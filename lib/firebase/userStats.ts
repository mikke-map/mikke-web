import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { FirebaseSpot } from './spots';

export interface UserStats {
  totalSpots: number;
  totalLikes: number;
  totalViews: number;
  lastUpdated?: any;
}

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  stats: UserStats;
  createdAt?: any;
  lastLoginAt?: any;
  isActive: boolean;
}

// Get user stats
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.stats || { totalSpots: 0, totalLikes: 0, totalViews: 0 };
    }
    
    // If user doesn't exist, return default stats
    return { totalSpots: 0, totalLikes: 0, totalViews: 0 };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { totalSpots: 0, totalLikes: 0, totalViews: 0 };
  }
};

// Calculate user stats from spots collection
export const calculateUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Get all active spots by this user
    const spotsQuery = query(
      collection(db, 'spots'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const spotsSnapshot = await getDocs(spotsQuery);
    
    let totalSpots = 0;
    let totalLikes = 0;
    let totalViews = 0;
    
    spotsSnapshot.forEach((doc) => {
      const spotData = doc.data() as FirebaseSpot;
      totalSpots++;
      totalLikes += spotData.stats?.likesCount || 0;
      totalViews += spotData.stats?.viewsCount || 0;
    });
    
    return {
      totalSpots,
      totalLikes,
      totalViews,
      lastUpdated: serverTimestamp(),
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return { totalSpots: 0, totalLikes: 0, totalViews: 0 };
  }
};

// Update user stats in Firestore
export const updateUserStats = async (userId: string, stats: UserStats): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      stats: {
        ...stats,
        lastUpdated: serverTimestamp(),
      },
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    // If update fails (e.g., document doesn't exist), try to set it
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        stats: {
          ...stats,
          lastUpdated: serverTimestamp(),
        },
      }, { merge: true });
    } catch (setError) {
      console.error('Error setting user stats:', setError);
    }
  }
};

// Refresh user stats (recalculate and update)
export const refreshUserStats = async (userId: string): Promise<UserStats> => {
  const stats = await calculateUserStats(userId);
  await updateUserStats(userId, stats);
  return stats;
};

// Subscribe to user's spots with real-time updates for stats
export const subscribeToUserStats = (
  userId: string,
  callback: (stats: UserStats) => void
) => {
  // Listen to spots collection for changes
  const spotsQuery = query(
    collection(db, 'spots'),
    where('userId', '==', userId),
    where('isActive', '==', true)
  );
  
  return onSnapshot(spotsQuery, async (snapshot) => {
    let totalSpots = 0;
    let totalLikes = 0;
    let totalViews = 0;
    
    snapshot.forEach((doc) => {
      const spotData = doc.data() as FirebaseSpot;
      totalSpots++;
      totalLikes += spotData.stats?.likesCount || 0;
      totalViews += spotData.stats?.viewsCount || 0;
    });
    
    const stats: UserStats = {
      totalSpots,
      totalLikes,
      totalViews,
    };
    
    // Update user document with new stats
    await updateUserStats(userId, stats);
    
    // Call the callback with new stats
    callback(stats);
  });
};

// Increment user stats when a new spot is created
export const incrementUserSpotCount = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.totalSpots': increment(1),
      'stats.lastUpdated': serverTimestamp(),
    });
  } catch (error) {
    console.error('Error incrementing user spot count:', error);
    // If update fails, try to recalculate stats
    await refreshUserStats(userId);
  }
};

// Decrement user stats when a spot is deleted
export const decrementUserSpotCount = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.totalSpots': increment(-1),
      'stats.lastUpdated': serverTimestamp(),
    });
  } catch (error) {
    console.error('Error decrementing user spot count:', error);
    // If update fails, try to recalculate stats
    await refreshUserStats(userId);
  }
};

// Update user likes count when a spot receives a like
export const updateUserLikesCount = async (
  userId: string,
  delta: number
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.totalLikes': increment(delta),
      'stats.lastUpdated': serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user likes count:', error);
    // If update fails, try to recalculate stats
    await refreshUserStats(userId);
  }
};

// Update user views count when a spot is viewed
export const updateUserViewsCount = async (
  userId: string,
  delta: number
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      'stats.totalViews': increment(delta),
      'stats.lastUpdated': serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user views count:', error);
    // If update fails, try to recalculate stats
    await refreshUserStats(userId);
  }
};

// Get user's spots
export const getUserSpots = async (
  userId: string,
  limitCount: number = 20
): Promise<FirebaseSpot[]> => {
  try {
    const spotsQuery = query(
      collection(db, 'spots'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(spotsQuery);
    const spots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseSpot[];
    
    return spots.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting user spots:', error);
    return [];
  }
};

// Get top users for ranking
export const getTopUsers = async (limitCount: number = 10): Promise<UserProfile[]> => {
  try {
    // First try with Firestore index (optimal)
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true),
        where('stats.totalSpots', '>', 0),
        orderBy('stats.totalSpots', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        const user = {
          uid: doc.id,
          ...data
        };
        console.log('User from Firestore:', JSON.stringify(user, null, 2));
        return user;
      }) as UserProfile[];

      console.log('Users from Firestore with index:', users);
      return users;
    } catch (indexError: any) {
      // If index doesn't exist, fall back to client-side sorting
      console.warn('Firestore index not available, using client-side sorting:', indexError.message);
      
      // Get all active users
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(usersQuery);
      console.log('Total active users found:', snapshot.docs.length);
      
      const users = snapshot.docs
        .map(doc => {
          const userData = {
            uid: doc.id,
            ...doc.data()
          };
          console.log('User data:', JSON.stringify(userData, null, 2));
          return userData;
        }) as UserProfile[];

      // Filter and sort on client side
      const filteredUsers = users
        .filter(user => {
          const hasSpots = user.stats?.totalSpots > 0;
          console.log(`User ${user.displayName || user.uid}: totalSpots=${user.stats?.totalSpots}, included=${hasSpots}`);
          return hasSpots;
        })
        .sort((a, b) => (b.stats?.totalSpots || 0) - (a.stats?.totalSpots || 0))
        .slice(0, limitCount);

      console.log('Filtered and sorted users:', JSON.stringify(filteredUsers, null, 2));
      return filteredUsers;
    }
  } catch (error) {
    console.error('Error getting top users:', error);
    return [];
  }
};

// Get user rank
export const getUserRank = async (userId: string): Promise<number | null> => {
  try {
    // First try with Firestore index (optimal)
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true),
        where('stats.totalSpots', '>', 0),
        orderBy('stats.totalSpots', 'desc')
      );

      const snapshot = await getDocs(usersQuery);
      let rank = null;
      
      snapshot.docs.forEach((doc, index) => {
        if (doc.id === userId) {
          rank = index + 1;
        }
      });

      return rank;
    } catch (indexError: any) {
      // If index doesn't exist, fall back to client-side sorting
      console.warn('Firestore index not available for rank, using client-side sorting:', indexError.message);
      
      // Get all active users
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs
        .map(doc => ({
          uid: doc.id,
          stats: doc.data().stats || { totalSpots: 0 }
        }))
        .filter(user => user.stats.totalSpots > 0)
        .sort((a, b) => (b.stats?.totalSpots || 0) - (a.stats?.totalSpots || 0));

      let rank = null;
      users.forEach((user, index) => {
        if (user.uid === userId) {
          rank = index + 1;
        }
      });

      return rank;
    }
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

// Batch update all users' stats (for maintenance)
export const batchUpdateAllUserStats = async (): Promise<void> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const stats = await calculateUserStats(userId);
      
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        stats: {
          ...stats,
          lastUpdated: serverTimestamp(),
        },
      });
    }
    
    await batch.commit();
    console.log('All user stats updated successfully');
  } catch (error) {
    console.error('Error batch updating user stats:', error);
  }
};