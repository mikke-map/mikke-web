'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Medal, Target, Grid3x3, List, Filter } from 'lucide-react';
import { Badge, BADGE_METADATA, BADGE_THRESHOLDS, UserBadgeProgress, generateUserBadges } from '@/types/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBadgeProgress, subscribeToUserBadgeProgress, getBadgeStatistics } from '@/lib/firebase/badges';
import { CategoryId } from '@/types/category';

interface BadgeListScreenProps {
  onBack: () => void;
}

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'earned' | 'unearned' | 'bronze' | 'silver' | 'gold';

export function BadgeListScreen({ onBack }: BadgeListScreenProps) {
  const { user } = useAuth();
  const [badgeProgress, setBadgeProgress] = useState<UserBadgeProgress | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe: (() => void) | undefined;

    const loadBadges = async () => {
      setLoading(true);
      try {
        const progress = await getUserBadgeProgress(user.uid);
        setBadgeProgress(progress);

        // Subscribe to real-time updates
        unsubscribe = subscribeToUserBadgeProgress(user.uid, (newProgress) => {
          setBadgeProgress(newProgress);
        });
      } catch (error) {
        console.error('Error loading badges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const getAllBadges = (): Badge[] => {
    if (!badgeProgress) return [];
    return generateUserBadges(badgeProgress.categoryProgress);
  };

  const getFilteredBadges = (): Badge[] => {
    const allBadges = getAllBadges();
    
    switch (filterMode) {
      case 'earned':
        return allBadges.filter(b => b.earnedAt);
      case 'unearned':
        return allBadges.filter(b => !b.earnedAt);
      case 'bronze':
        return allBadges.filter(b => b.level === 'bronze');
      case 'silver':
        return allBadges.filter(b => b.level === 'silver');
      case 'gold':
        return allBadges.filter(b => b.level === 'gold');
      default:
        return allBadges;
    }
  };

  const stats = badgeProgress ? getBadgeStatistics(badgeProgress) : null;
  const badges = getFilteredBadges();

  const renderBadge = (badge: Badge) => {
    const metadata = BADGE_METADATA[badge.category];
    const threshold = BADGE_THRESHOLDS.find(t => t.level === badge.level);
    const isEarned = !!badge.earnedAt;
    const progress = badge.currentProgress;
    const progressPercentage = Math.min((progress / badge.requiredPosts) * 100, 100);

    if (viewMode === 'grid') {
      return (
        <div
          key={badge.id}
          className={`bg-[var(--bg-card)] rounded-xl p-4 shadow-soft transition-all duration-300 ${
            isEarned ? 'hover:shadow-soft-lg hover:scale-105' : 'opacity-60'
          }`}
        >
          {/* Badge Icon */}
          <div className="relative mb-3">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl ${
                isEarned 
                  ? 'bg-gradient-to-br shadow-md' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              style={isEarned ? { background: threshold?.gradient } : {}}
            >
              {metadata.icon}
            </div>
            {isEarned && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Badge Info */}
          <div className="text-center">
            <h3 className="font-medium text-sm text-[var(--text-primary)] mb-1">
              {metadata.label}
            </h3>
            <div className="flex items-center justify-center space-x-1 mb-2">
              <Medal className="w-4 h-4" style={{ color: threshold?.color }} />
              <span className="text-xs font-bold uppercase" style={{ color: threshold?.color }}>
                {badge.level === 'bronze' ? '銅' : badge.level === 'silver' ? '銀' : '金'}
              </span>
            </div>

            {/* Progress or Date */}
            {isEarned ? (
              <p className="text-xs text-[var(--text-muted)]">
                {badge.earnedAt && new Intl.DateTimeFormat('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(badge.earnedAt)}
              </p>
            ) : (
              <div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {progress}/{badge.requiredPosts}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // List view
      return (
        <div
          key={badge.id}
          className={`bg-[var(--bg-card)] rounded-xl p-4 shadow-soft transition-all duration-300 ${
            isEarned ? 'hover:shadow-soft-lg' : 'opacity-60'
          }`}
        >
          <div className="flex items-center space-x-4">
            {/* Badge Icon */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                isEarned 
                  ? 'bg-gradient-to-br shadow-md' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              style={isEarned ? { background: threshold?.gradient } : {}}
            >
              {metadata.icon}
            </div>

            {/* Badge Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium text-[var(--text-primary)]">
                  {metadata.label}
                </h3>
                <div className="flex items-center space-x-1">
                  <Medal className="w-4 h-4" style={{ color: threshold?.color }} />
                  <span className="text-xs font-bold uppercase" style={{ color: threshold?.color }}>
                    {badge.level === 'bronze' ? '銅' : badge.level === 'silver' ? '銀' : '金'}
                  </span>
                </div>
                {isEarned && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {!isEarned && (
                <div className="mb-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Text */}
              <p className="text-sm text-[var(--text-muted)]">
                {isEarned ? (
                  <>獲得日: {badge.earnedAt && new Intl.DateTimeFormat('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }).format(badge.earnedAt)}</>
                ) : (
                  <>進捗: {progress}/{badge.requiredPosts} スポット投稿済み</>
                )}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-[var(--bg-card)] shadow-soft border-b border-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-xl font-bold text-primary">バッジコレクション</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              title={viewMode === 'grid' ? 'リスト表示' : 'グリッド表示'}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="bg-gradient-to-r from-primary-100 via-primary-50 to-[var(--bg-card)] p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.earnedBadgesCount}</div>
                <div className="text-sm text-[var(--text-muted)]">獲得済み</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalPossibleBadges}</div>
                <div className="text-sm text-[var(--text-muted)]">総バッジ数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.progressPercentage}%</div>
                <div className="text-sm text-[var(--text-muted)]">達成率</div>
              </div>
            </div>

            {/* Next Milestone */}
            {stats.nextMilestone && (
              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-[var(--text-primary)]">
                    次の目標: {BADGE_METADATA[stats.nextMilestone.category].label}の
                    {stats.nextMilestone.level === 'bronze' ? '銅' : stats.nextMilestone.level === 'silver' ? '銀' : '金'}バッジまで
                    あと{stats.nextMilestone.needed}件
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-[var(--bg-card)] border-b border-[var(--bg-tertiary)]">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          <Filter className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
          {[
            { value: 'all', label: 'すべて' },
            { value: 'earned', label: '獲得済み' },
            { value: 'unearned', label: '未獲得' },
            { value: 'bronze', label: '銅' },
            { value: 'silver', label: '銀' },
            { value: 'gold', label: '金' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterMode(filter.value as FilterMode)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all ${
                filterMode === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-primary-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Collection */}
      <div className="p-4 pb-20">
        <div className={`max-w-4xl mx-auto ${
          viewMode === 'grid' 
            ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4' 
            : 'space-y-3'
        }`}>
          {badges.length > 0 ? (
            badges.map(renderBadge)
          ) : (
            <div className="col-span-full text-center py-8 text-[var(--text-muted)]">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>該当するバッジがありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}