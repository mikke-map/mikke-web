import { CategoryId } from '@/types/category';

export type BadgeLevel = 'bronze' | 'silver' | 'gold';

export interface BadgeThreshold {
  level: BadgeLevel;
  requiredPosts: number;
  color: string;
  gradient: string;
}

export const BADGE_THRESHOLDS: BadgeThreshold[] = [
  {
    level: 'bronze',
    requiredPosts: 5,
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
  },
  {
    level: 'silver',
    requiredPosts: 30,
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 100%)',
  },
  {
    level: 'gold',
    requiredPosts: 100,
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  },
];

export interface Badge {
  id: string;
  category: CategoryId;
  level: BadgeLevel;
  earnedAt?: Date;
  currentProgress: number;
  requiredPosts: number;
}

export interface UserBadgeProgress {
  userId: string;
  categoryProgress: Record<CategoryId, number>;
  earnedBadges: Badge[];
  totalBadgesEarned: number;
  lastUpdated: Date;
}

export interface BadgeCelebration {
  badge: Badge;
  isFirstTime: boolean;
  previousLevel?: BadgeLevel;
}

// Badge metadata for display
export const BADGE_METADATA: Record<CategoryId, {
  label: string;
  icon: string;
  color: string;
}> = {
  park_outdoor: { label: '公園探検家', icon: '🌳', color: '#22C55E' },
  family: { label: '家族の味方', icon: '👨‍👩‍👧‍👦', color: '#EC4899' },
  entertainment: { label: 'エンタメマスター', icon: '🎮', color: '#8B5CF6' },
  food_drink: { label: 'グルメハンター', icon: '🍽️', color: '#F97316' },
  shopping: { label: 'ショッピング達人', icon: '🛍️', color: '#6B7280' },
  tourism: { label: '観光スポッター', icon: '📸', color: '#EAB308' },
  vending_machine: { label: '自販機ソムリエ', icon: '🥤', color: '#F59E0B' },
  pet: { label: 'ペット愛好家', icon: '🐕', color: '#84CC16' },
  public_facility: { label: '公共施設マスター', icon: '🏢', color: '#06B6D4' },
  transportation: { label: '交通エキスパート', icon: '🚗', color: '#3B82F6' },
  others: { label: '発見者', icon: '✨', color: '#9CA3AF' },
};

// Utility functions
export function getBadgeId(category: CategoryId, level: BadgeLevel): string {
  return `${category}_${level}`;
}

export function calculateBadgeProgress(postCount: number): {
  currentLevel: BadgeLevel | null;
  nextLevel: BadgeLevel | null;
  progress: number;
  nextThreshold: number;
} {
  const sortedThresholds = [...BADGE_THRESHOLDS].sort((a, b) => a.requiredPosts - b.requiredPosts);
  
  let currentLevel: BadgeLevel | null = null;
  let nextLevel: BadgeLevel | null = null;
  let progress = 0;
  let nextThreshold = 0;

  for (let i = 0; i < sortedThresholds.length; i++) {
    const threshold = sortedThresholds[i];
    if (postCount >= threshold.requiredPosts) {
      currentLevel = threshold.level;
    } else if (!nextLevel) {
      nextLevel = threshold.level;
      nextThreshold = threshold.requiredPosts;
      progress = postCount;
      break;
    }
  }

  // If all badges earned
  if (currentLevel === 'gold') {
    nextLevel = null;
    progress = postCount;
    nextThreshold = BADGE_THRESHOLDS.find(t => t.level === 'gold')!.requiredPosts;
  }

  return { currentLevel, nextLevel, progress, nextThreshold };
}

export function generateUserBadges(
  categoryProgress: Record<CategoryId, number>
): Badge[] {
  const badges: Badge[] = [];
  const now = new Date();

  Object.entries(categoryProgress).forEach(([category, postCount]) => {
    const { currentLevel, nextLevel, progress, nextThreshold } = calculateBadgeProgress(postCount);
    
    // Add earned badges
    BADGE_THRESHOLDS.forEach(threshold => {
      if (postCount >= threshold.requiredPosts) {
        badges.push({
          id: getBadgeId(category as CategoryId, threshold.level),
          category: category as CategoryId,
          level: threshold.level,
          earnedAt: now, // In production, this would come from Firebase
          currentProgress: postCount,
          requiredPosts: threshold.requiredPosts,
        });
      }
    });
    
    // Add next unearned badge for progress tracking
    if (nextLevel) {
      const nextThresholdData = BADGE_THRESHOLDS.find(t => t.level === nextLevel)!;
      badges.push({
        id: getBadgeId(category as CategoryId, nextLevel),
        category: category as CategoryId,
        level: nextLevel,
        earnedAt: undefined, // Not earned yet
        currentProgress: postCount,
        requiredPosts: nextThresholdData.requiredPosts,
      });
    }
  });

  return badges;
}