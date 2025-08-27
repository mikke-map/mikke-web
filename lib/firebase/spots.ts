import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from './config';
import { SpotCategory } from '@/stores/spotStore';
import { CategoryId } from '@/types/category';
import { incrementUserSpotCount, decrementUserSpotCount, updateUserLikesCount, updateUserViewsCount } from './userStats';

export interface FirebaseSpot {
  id?: string;
  title: string;
  description?: string;
  category: SpotCategory;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: string[];
  userId: string;
  author: {
    displayName: string;
    photoURL?: string;
  };
  stats: {
    likesCount: number;
    dislikesCount: number;
    viewsCount: number;
  };
  createdAt: Timestamp | any;
  updatedAt: Timestamp | any;
  isActive: boolean;
}

// Get spots with optional filters
export const getSpots = async (
  filters?: {
    category?: CategoryId;
    limitCount?: number;
    lastVisible?: QueryDocumentSnapshot;
  }
) => {
  const constraints: QueryConstraint[] = [
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
  ];

  if (filters?.category) {
    constraints.push(where('category.mainCategory', '==', filters.category));
  }

  if (filters?.lastVisible) {
    constraints.push(startAfter(filters.lastVisible));
  }

  constraints.push(limit(filters?.limitCount || 20));

  const q = query(collection(db, 'spots'), ...constraints);
  const snapshot = await getDocs(q);
  
  const spots = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as FirebaseSpot[];
  
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  return { spots, lastVisible: lastDoc };
};

// Get a single spot by ID
export const getSpotById = async (spotId: string): Promise<FirebaseSpot | null> => {
  try {
    const docRef = doc(db, 'spots', spotId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as FirebaseSpot;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching spot by ID:', error);
    return null;
  }
};

// Subscribe to spots with real-time updates
export const subscribeToSpots = (
  filters: {
    category?: CategoryId;
    limitCount?: number;
  },
  callback: (spots: FirebaseSpot[]) => void
) => {
  const constraints: QueryConstraint[] = [
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(filters.limitCount || 20)
  ];

  if (filters.category) {
    constraints.push(where('category.mainCategory', '==', filters.category));
  }

  const q = query(collection(db, 'spots'), ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const spots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseSpot[];
    callback(spots);
  });
};

// Create a new spot
export const createSpot = async (spotData: Omit<FirebaseSpot, 'id' | 'stats' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
  // 一時的に認証チェックを緩和（開発用）
  const user = auth.currentUser;
  const userId = user?.uid || spotData.userId || 'anonymous';
  
  const docRef = await addDoc(collection(db, 'spots'), {
    ...spotData,
    userId,
    author: {
      displayName: user?.displayName || spotData.author?.displayName || 'ゲストユーザー',
      photoURL: user?.photoURL || spotData.author?.photoURL || null,
    },
    stats: {
      likesCount: 0,
      dislikesCount: 0,
      viewsCount: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
  });

  // Update user's spot count
  if (userId !== 'anonymous') {
    await incrementUserSpotCount(userId);
  }

  return docRef.id;
};

// Update a spot
export const updateSpot = async (spotId: string, updates: Partial<FirebaseSpot>) => {
  const spotRef = doc(db, 'spots', spotId);
  await updateDoc(spotRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete a spot (soft delete)
export const deleteSpot = async (spotId: string) => {
  const spotRef = doc(db, 'spots', spotId);
  
  // Get spot data to find the userId
  const spotSnap = await getDoc(spotRef);
  if (spotSnap.exists()) {
    const spotData = spotSnap.data();
    const userId = spotData.userId;
    
    // Soft delete the spot
    await updateDoc(spotRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
    
    // Update user's spot count
    if (userId && userId !== 'anonymous') {
      await decrementUserSpotCount(userId);
    }
  }
};

// Upload spot image
export const uploadSpotImage = async (file: File, spotId?: string): Promise<string> => {
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const folder = spotId ? `spots/${spotId}` : `spots/temp`;
  const storageRef = ref(storage, `${folder}/${filename}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};

// Rate a spot (like/dislike)
export const rateSpot = async (spotId: string, rating: 'like' | 'dislike') => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');

  const ratingRef = doc(db, 'spots', spotId, 'ratings', user.uid);
  const ratingSnap = await getDoc(ratingRef);
  
  const spotRef = doc(db, 'spots', spotId);
  const spotSnap = await getDoc(spotRef);
  
  if (!spotSnap.exists()) throw new Error('Spot not found');
  
  const spotData = spotSnap.data();
  let likesCount = spotData.stats?.likesCount || 0;
  let dislikesCount = spotData.stats?.dislikesCount || 0;

  if (ratingSnap.exists()) {
    const existingRating = ratingSnap.data().type;
    
    if (existingRating === rating) {
      // Remove rating
      await deleteDoc(ratingRef);
      if (rating === 'like') {
        likesCount = Math.max(0, likesCount - 1);
      } else {
        dislikesCount = Math.max(0, dislikesCount - 1);
      }
    } else {
      // Change rating
      await updateDoc(ratingRef, {
        type: rating,
        updatedAt: serverTimestamp(),
      });
      
      if (existingRating === 'like') {
        likesCount = Math.max(0, likesCount - 1);
        dislikesCount++;
      } else {
        dislikesCount = Math.max(0, dislikesCount - 1);
        likesCount++;
      }
    }
  } else {
    // Add new rating
    await setDoc(ratingRef, {
      userId: user.uid,
      type: rating,
      createdAt: serverTimestamp(),
    });
    
    if (rating === 'like') {
      likesCount++;
    } else {
      dislikesCount++;
    }
  }

  // Update spot stats
  await updateDoc(spotRef, {
    'stats.likesCount': likesCount,
    'stats.dislikesCount': dislikesCount,
  });
  
  // Update the spot owner's total likes count
  const spotOwnerId = spotData.userId;
  if (spotOwnerId && spotOwnerId !== 'anonymous') {
    // Calculate the delta for likes
    const originalLikesCount = spotData.stats?.likesCount || 0;
    const likesDelta = likesCount - originalLikesCount;
    if (likesDelta !== 0) {
      await updateUserLikesCount(spotOwnerId, likesDelta);
    }
  }
};

// Increment view count
export const incrementViewCount = async (spotId: string) => {
  const spotRef = doc(db, 'spots', spotId);
  const spotSnap = await getDoc(spotRef);
  
  if (spotSnap.exists()) {
    const spotData = spotSnap.data();
    const currentViews = spotData.stats?.viewsCount || 0;
    await updateDoc(spotRef, {
      'stats.viewsCount': currentViews + 1,
    });
    
    // Update the spot owner's total views count
    const spotOwnerId = spotData.userId;
    if (spotOwnerId && spotOwnerId !== 'anonymous') {
      await updateUserViewsCount(spotOwnerId, 1);
    }
  }
};