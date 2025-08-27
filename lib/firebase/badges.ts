import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  query,
  where,
  getDocs,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './config';
import { 
  Badge, 
  UserBadgeProgress, 
  BadgeCelebration,
  BADGE_THRESHOLDS,
  getBadgeId,
  calculateBadgeProgress,
  BADGE_METADATA
} from '@/types/badge';
import { CategoryId } from '@/types/category';

const BADGE_PROGRESS_COLLECTION = 'userBadgeProgress';
const EARNED_BADGES_COLLECTION = 'earnedBadges';

// Initialize user badge progress
export async function initializeUserBadgeProgress(userId: string): Promise<void> {
  const progressRef = doc(db, BADGE_PROGRESS_COLLECTION, userId);
  const progressDoc = await getDoc(progressRef);

  if (!progressDoc.exists()) {
    const initialProgress: Record<CategoryId, number> = {} as Record<CategoryId, number>;
    Object.keys(BADGE_METADATA).forEach(category => {
      initialProgress[category as CategoryId] = 0;
    });

    await setDoc(progressRef, {
      userId,
      categoryProgress: initialProgress,
      totalBadgesEarned: 0,
      lastUpdated: serverTimestamp(),
    });
  } else {
  }
}

// Get user's badge progress
export async function getUserBadgeProgress(userId: string): Promise<UserBadgeProgress | null> {
  try {
    const progressRef = doc(db, BADGE_PROGRESS_COLLECTION, userId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      await initializeUserBadgeProgress(userId);
      return await getUserBadgeProgress(userId);
    }

    const data = progressDoc.data();
    
    // Fetch earned badges
    const earnedBadgesQuery = query(
      collection(db, EARNED_BADGES_COLLECTION),
      where('userId', '==', userId)
    );
    const earnedBadgesSnapshot = await getDocs(earnedBadgesQuery);
    const earnedBadges: Badge[] = earnedBadgesSnapshot.docs.map(doc => {
      const badgeData = doc.data();
      return {
        ...badgeData,
        earnedAt: badgeData.earnedAt?.toDate(),
      } as Badge;
    });

    return {
      userId,
      categoryProgress: data.categoryProgress,
      earnedBadges,
      totalBadgesEarned: data.totalBadgesEarned || 0,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting user badge progress:', error);
    return null;
  }
}

// Subscribe to user's badge progress
export function subscribeToUserBadgeProgress(
  userId: string,
  onUpdate: (progress: UserBadgeProgress) => void
): () => void {
  const progressRef = doc(db, BADGE_PROGRESS_COLLECTION, userId);
  
  const unsubscribe = onSnapshot(progressRef, async (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      
      // Fetch earned badges
      const earnedBadgesQuery = query(
        collection(db, EARNED_BADGES_COLLECTION),
        where('userId', '==', userId)
      );
      const earnedBadgesSnapshot = await getDocs(earnedBadgesQuery);
      const earnedBadges: Badge[] = earnedBadgesSnapshot.docs.map(badgeDoc => {
        const badgeData = badgeDoc.data();
        return {
          ...badgeData,
          earnedAt: badgeData.earnedAt?.toDate(),
        } as Badge;
      });

      onUpdate({
        userId,
        categoryProgress: data.categoryProgress,
        earnedBadges,
        totalBadgesEarned: data.totalBadgesEarned || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      });
    }
  });

  return unsubscribe;
}

// Check and award badges after spot creation
export async function checkAndAwardBadges(
  userId: string,
  category: CategoryId
): Promise<BadgeCelebration | null> {
  try {
    const batch = writeBatch(db);
    const progressRef = doc(db, BADGE_PROGRESS_COLLECTION, userId);
    
    // Get current progress
    const progressDoc = await getDoc(progressRef);
    if (!progressDoc.exists()) {
      await initializeUserBadgeProgress(userId);
      return await checkAndAwardBadges(userId, category);
    }

    const currentData = progressDoc.data();
    const currentCategoryProgress = currentData.categoryProgress[category] || 0;
    const newCategoryProgress = currentCategoryProgress + 1;

    // Check what badges the user had before
    const previousBadgeInfo = calculateBadgeProgress(currentCategoryProgress);
    const newBadgeInfo = calculateBadgeProgress(newCategoryProgress);

    // Check if a new badge level was reached
    let celebration: BadgeCelebration | null = null;
    
    BADGE_THRESHOLDS.forEach(threshold => {
      const wasEarned = currentCategoryProgress >= threshold.requiredPosts;
      const isNowEarned = newCategoryProgress >= threshold.requiredPosts;
      
      if (!wasEarned && isNowEarned) {
        // New badge earned!
        const badgeId = getBadgeId(category, threshold.level);
        const badge: Badge = {
          id: badgeId,
          category,
          level: threshold.level,
          earnedAt: new Date(),
          currentProgress: newCategoryProgress,
          requiredPosts: threshold.requiredPosts,
        };

        // Save the earned badge
        const earnedBadgeRef = doc(db, EARNED_BADGES_COLLECTION, `${userId}_${badgeId}`);
        batch.set(earnedBadgeRef, {
          ...badge,
          userId,
          earnedAt: serverTimestamp(),
        });

        // Set celebration (only the highest new badge)
        if (!celebration || threshold.requiredPosts > celebration.badge.requiredPosts) {
          celebration = {
            badge,
            isFirstTime: true,
            previousLevel: previousBadgeInfo.currentLevel || undefined,
          };
        }
      }
    });

    // Update category progress
    batch.update(progressRef, {
      [`categoryProgress.${category}`]: newCategoryProgress,
      totalBadgesEarned: celebration ? increment(1) : increment(0),
      lastUpdated: serverTimestamp(),
    });

    await batch.commit();
    return celebration;
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    return null;
  }
}

// Recalculate badge progress from spots (for data consistency)
export async function recalculateBadgeProgress(userId: string): Promise<void> {
  try {
    // Get all user's spots
    const spotsQuery = query(
      collection(db, 'spots'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const spotsSnapshot = await getDocs(spotsQuery);

    // Count spots per category
    const categoryProgress: Record<CategoryId, number> = {} as Record<CategoryId, number>;
    Object.keys(BADGE_METADATA).forEach(category => {
      categoryProgress[category as CategoryId] = 0;
    });

    spotsSnapshot.docs.forEach(doc => {
      const spot = doc.data();
      if (spot.category && categoryProgress[spot.category.mainCategory as CategoryId] !== undefined) {
        categoryProgress[spot.category.mainCategory as CategoryId]++;
      }
    });

    // Calculate total badges earned
    let totalBadgesEarned = 0;
    const batch = writeBatch(db);

    Object.entries(categoryProgress).forEach(([category, count]) => {
      BADGE_THRESHOLDS.forEach(threshold => {
        if (count >= threshold.requiredPosts) {
          totalBadgesEarned++;
          
          // Ensure badge is recorded
          const badgeId = getBadgeId(category as CategoryId, threshold.level);
          const earnedBadgeRef = doc(db, EARNED_BADGES_COLLECTION, `${userId}_${badgeId}`);
          
          batch.set(earnedBadgeRef, {
            id: badgeId,
            userId,
            category,
            level: threshold.level,
            earnedAt: serverTimestamp(),
            currentProgress: count,
            requiredPosts: threshold.requiredPosts,
          }, { merge: true });
        }
      });
    });

    // Update progress document
    const progressRef = doc(db, BADGE_PROGRESS_COLLECTION, userId);
    batch.set(progressRef, {
      userId,
      categoryProgress,
      totalBadgesEarned,
      lastUpdated: serverTimestamp(),
    }, { merge: true });

    await batch.commit();
  } catch (error) {
    console.error('Error recalculating badge progress:', error);
  }
}

// Get badge statistics for display
export function getBadgeStatistics(progress: UserBadgeProgress): {
  totalPossibleBadges: number;
  earnedBadgesCount: number;
  progressPercentage: number;
  nextMilestone: { category: CategoryId; level: string; needed: number } | null;
} {
  const totalCategories = Object.keys(BADGE_METADATA).length;
  const totalPossibleBadges = totalCategories * BADGE_THRESHOLDS.length;
  const earnedBadgesCount = progress.totalBadgesEarned;
  const progressPercentage = Math.round((earnedBadgesCount / totalPossibleBadges) * 100);

  // Find next milestone
  let nextMilestone: { category: CategoryId; level: string; needed: number } | null = null;
  let minNeeded = Infinity;

  Object.entries(progress.categoryProgress).forEach(([category, count]) => {
    const nextBadgeInfo = calculateBadgeProgress(count);
    if (nextBadgeInfo.nextLevel && nextBadgeInfo.nextThreshold - count < minNeeded) {
      minNeeded = nextBadgeInfo.nextThreshold - count;
      nextMilestone = {
        category: category as CategoryId,
        level: nextBadgeInfo.nextLevel,
        needed: minNeeded,
      };
    }
  });

  return {
    totalPossibleBadges,
    earnedBadgesCount,
    progressPercentage,
    nextMilestone,
  };
}