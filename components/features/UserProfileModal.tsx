'use client';

import React, { useEffect, useState } from 'react';
import { X, User, MapPin, Heart, Eye, ExternalLink } from 'lucide-react';
import { UserProfile } from '@/lib/firebase/userStats';
import { getUserSpots } from '@/lib/firebase/userStats';
import { Spot } from '@/stores/spotStore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onViewFullProfile?: (userId: string) => void;
}

interface SpotPreview {
  id: string;
  title: string;
  category: string;
  image?: string;
}

// Achievement badge helper
const getAchievementBadge = (totalSpots: number) => {
  if (totalSpots >= 100) return { label: '発見の達人', color: 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30' };
  if (totalSpots >= 50) return { label: '探検家', color: 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30' };
  if (totalSpots >= 20) return { label: '冒険者', color: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30' };
  if (totalSpots >= 10) return { label: '新人発見者', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30' };
  return { label: 'スポッター', color: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50' };
};

// Category display names
const getCategoryDisplayName = (categoryId: string): string => {
  const categoryMap: Record<string, string> = {
    'park_outdoor': '公園・屋外',
    'family': '子育て',
    'entertainment': '娯楽',
    'food_drink': '飲食',
    'shopping': 'ショッピング',
    'tourism': '観光・文化',
    'vending_machine': '自動販売機',
    'pet': 'ペット',
    'public_facility': '公共施設',
    'transportation': '交通',
    'others': 'その他'
  };
  return categoryMap[categoryId] || categoryId;
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onViewFullProfile
}) => {
  const [userSpots, setUserSpots] = useState<SpotPreview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user.uid) {
      loadUserSpots();
    }
  }, [isOpen, user.uid]);

  const loadUserSpots = async () => {
    setLoading(true);
    try {
      // Get user's spots from Firebase
      const spots = await getUserSpots(user.uid, 3);

      // Convert to preview format
      const spotPreviews: SpotPreview[] = spots.map(spot => ({
        id: spot.id || '',
        title: spot.title,
        category: typeof spot.category === 'string'
          ? spot.category
          : spot.category?.mainCategory || 'others',
        image: spot.images?.[0]
      }));

      setUserSpots(spotPreviews);
    } catch (error) {
      console.error('Error loading user spots:', error);
      // Fallback to mock data for demo
      setUserSpots([
        { id: '1', title: '隠れた桜の名所', category: 'park_outdoor' },
        { id: '2', title: '美味しいラーメン店', category: 'food_drink' },
        { id: '3', title: 'ペット同伴可能カフェ', category: 'pet' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullProfile = () => {
    if (onViewFullProfile) {
      onViewFullProfile(user.uid);
    }
    onClose();
  };

  if (!isOpen) return null;

  const achievement = getAchievementBadge(user.stats?.totalSpots || 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-60 p-4">
        <div
          className="relative bg-[var(--bg-primary)] dark:bg-neutral-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-modalSlideIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-neutral-700/80 hover:bg-white dark:hover:bg-neutral-600 transition-colors backdrop-blur-sm"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Profile Header */}
            <div className="text-center space-y-4 animate-staggerIn">
              {/* Avatar */}
              <div className="relative mx-auto">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-700 flex items-center justify-center ring-4 ring-white dark:ring-neutral-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || ''}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 md:w-14 md:h-14 text-primary-600 dark:text-primary-300" />
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-2">
                  {user.displayName || '匿名ユーザー'}
                </h2>

                {/* Achievement Badge */}
                <div className="inline-flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${achievement.color} animate-pulse`}>
                    🏆 {achievement.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/70 dark:from-primary-900/20 dark:to-primary-800/10 rounded-2xl p-5 space-y-3 animate-staggerIn animation-delay-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-[var(--text-secondary)]">スポット投稿</span>
                </div>
                <span className="text-xl font-bold text-primary-700 dark:text-primary-300 animate-countUp">
                  {user.stats?.totalSpots || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-[var(--text-secondary)]">いいね獲得</span>
                </div>
                <span className="text-xl font-bold text-primary-700 dark:text-primary-300 animate-countUp animation-delay-100">
                  {user.stats?.totalLikes || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-[var(--text-secondary)]">回閲覧</span>
                </div>
                <span className="text-xl font-bold text-primary-700 dark:text-primary-300 animate-countUp animation-delay-200">
                  {user.stats?.totalViews || 0}
                </span>
              </div>
            </div>

            {/* Spots Preview */}
            <div className="space-y-4 animate-staggerIn animation-delay-200">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                投稿したスポット
              </h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : userSpots.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {userSpots.map((spot, index) => (
                      <div
                        key={spot.id}
                        className="bg-white dark:bg-neutral-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Image placeholder */}
                        <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-700 flex items-center justify-center">
                          {spot.image ? (
                            <img
                              src={spot.image}
                              alt={spot.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MapPin className="w-6 h-6 text-primary-600 dark:text-primary-300" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-2">
                          <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 mb-1">
                            {spot.title}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {getCategoryDisplayName(spot.category)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View More Link */}
                  <button
                    onClick={handleViewFullProfile}
                    className="w-full mt-4 py-3 px-4 bg-white dark:bg-neutral-700 hover:bg-primary-50 dark:hover:bg-neutral-600 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 border border-primary-200 dark:border-neutral-600"
                  >
                    <span className="text-primary-700 dark:text-primary-300 font-medium">
                      もっと見る
                    </span>
                    <ExternalLink className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">まだスポットが投稿されていません</p>
                </div>
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -z-10 top-0 right-0 w-32 h-32 bg-primary-200/20 dark:bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute -z-10 bottom-0 left-0 w-24 h-24 bg-primary-300/20 dark:bg-primary-500/10 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes staggerIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.4s ease-out;
        }

        .animate-staggerIn {
          animation: staggerIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-countUp {
          animation: countUp 0.6s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};