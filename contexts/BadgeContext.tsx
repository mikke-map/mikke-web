'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  BadgeCelebration, 
  UserBadgeProgress 
} from '@/types/badge';
import { 
  getUserBadgeProgress, 
  subscribeToUserBadgeProgress,
  checkAndAwardBadges,
  initializeUserBadgeProgress
} from '@/lib/firebase/badges';
import { CategoryId } from '@/types/category';

interface BadgeContextType {
  badgeProgress: UserBadgeProgress | null;
  celebration: BadgeCelebration | null;
  loading: boolean;
  checkForNewBadge: (category: CategoryId) => Promise<void>;
  dismissCelebration: () => void;
  refreshBadgeProgress: () => Promise<void>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState<UserBadgeProgress | null>(null);
  const [celebration, setCelebration] = useState<BadgeCelebration | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and subscribe to badge progress
  useEffect(() => {
    if (!user?.uid) {
      setBadgeProgress(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initializeBadges = async () => {
      setLoading(true);
      try {
        // Initialize badge progress if needed
        await initializeUserBadgeProgress(user.uid);
        
        // Get current progress
        const progress = await getUserBadgeProgress(user.uid);
        setBadgeProgress(progress);

        // Subscribe to real-time updates
        unsubscribe = subscribeToUserBadgeProgress(user.uid, (newProgress) => {
          setBadgeProgress(newProgress);
        });
      } catch (error) {
        console.error('Error initializing badges:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeBadges();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // Check for new badge after spot creation
  const checkForNewBadge = async (category: CategoryId) => {
    if (!user?.uid) return;

    try {
      const newCelebration = await checkAndAwardBadges(user.uid, category);
      if (newCelebration) {
        setCelebration(newCelebration);
      }
    } catch (error) {
      console.error('Error checking for new badge:', error);
    }
  };

  // Dismiss celebration modal
  const dismissCelebration = () => {
    setCelebration(null);
  };

  // Manually refresh badge progress
  const refreshBadgeProgress = async () => {
    if (!user?.uid) return;

    try {
      const progress = await getUserBadgeProgress(user.uid);
      setBadgeProgress(progress);
    } catch (error) {
      console.error('Error refreshing badge progress:', error);
    }
  };

  return (
    <BadgeContext.Provider
      value={{
        badgeProgress,
        celebration,
        loading,
        checkForNewBadge,
        dismissCelebration,
        refreshBadgeProgress,
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadges() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
}