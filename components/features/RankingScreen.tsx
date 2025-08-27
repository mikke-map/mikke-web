'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Crown, ChevronRight, User } from 'lucide-react';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { getTopUsers, getUserRank } from '@/lib/firebase/userStats';
import { auth } from '@/lib/firebase/config';
import { UserProfile } from '@/lib/firebase/userStats';

interface RankingScreenProps {
  onMenuClick: () => void;
  onViewUserProfile?: (userId: string) => void;
}

// Achievement badge types
const getAchievementBadge = (totalSpots: number) => {
  if (totalSpots >= 100) return { label: '発見の達人', color: 'text-purple-600 bg-purple-100' };
  if (totalSpots >= 50) return { label: '探検家', color: 'text-blue-600 bg-blue-100' };
  if (totalSpots >= 20) return { label: '冒険者', color: 'text-green-600 bg-green-100' };
  if (totalSpots >= 10) return { label: '新人発見者', color: 'text-yellow-600 bg-yellow-100' };
  return { label: 'スポッター', color: 'text-gray-600 bg-gray-100' };
};

// Mock data for development
const getMockUsers = (): UserProfile[] => [
  {
    uid: '1',
    displayName: '山田太郎',
    photoURL: null,
    email: 'yamada@example.com',
    stats: { totalSpots: 125, totalLikes: 450, totalViews: 1200 },
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  },
  {
    uid: '2',
    displayName: '鈴木花子',
    photoURL: null,
    email: 'suzuki@example.com',
    stats: { totalSpots: 89, totalLikes: 320, totalViews: 890 },
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  },
  {
    uid: '3',
    displayName: '佐藤次郎',
    photoURL: null,
    email: 'sato@example.com',
    stats: { totalSpots: 67, totalLikes: 280, totalViews: 750 },
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  },
  {
    uid: '4',
    displayName: '田中美咲',
    photoURL: null,
    email: 'tanaka@example.com',
    stats: { totalSpots: 45, totalLikes: 190, totalViews: 540 },
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  },
  {
    uid: '5',
    displayName: '伊藤健一',
    photoURL: null,
    email: 'ito@example.com',
    stats: { totalSpots: 32, totalLikes: 140, totalViews: 420 },
    createdAt: new Date(),
    lastLoginAt: new Date(),
    isActive: true
  }
];

export const RankingScreen: React.FC<RankingScreenProps> = ({ onMenuClick, onViewUserProfile }) => {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    loadRankingData();
  }, []);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      
      // Try to load from Firebase first
      const users = await getTopUsers(10);
      console.log('Fetched users in RankingScreen:', users);
      
      if (users.length === 0) {
        // Fall back to mock data if no Firebase data
        console.log('No Firebase data, using mock data');
        setTopUsers(getMockUsers());
        setIsUsingMockData(true);
      } else {
        console.log('Setting users to state:', users);
        setTopUsers(users);
        setIsUsingMockData(false);
        
        // Get current user's rank if logged in
        if (currentUser) {
          const rank = await getUserRank(currentUser.uid);
          setCurrentUserRank(rank);
        }
      }
    } catch (error) {
      console.error('Error loading rankings:', error);
      // Fall back to mock data on error
      setTopUsers(getMockUsers());
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    if (onViewUserProfile) {
      onViewUserProfile(userId);
    } else {
      console.log('Viewing user profile:', userId);
    }
  };

  const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) {
      return <Crown className="w-8 h-8 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="w-7 h-7 text-gray-400" />;
    } else if (rank === 3) {
      return <Medal className="w-7 h-7 text-amber-600" />;
    }
    return <div className="text-2xl font-bold text-gray-500">{rank}</div>;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <ScreenHeader 
          currentScreen="ranking"
          onMenuClick={onMenuClick}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
      <ScreenHeader 
        currentScreen="ranking"
        onMenuClick={onMenuClick}
      />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 to-primary-light/10 px-6 py-8">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-primary mb-2">
            スポット発見ランキング
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            地域の隠れたスポットを見つけた探検家たち
          </p>
          {isUsingMockData && (
            <p className="text-xs text-yellow-600 mt-2">
              （デモデータ表示中）
            </p>
          )}
        </div>
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Top 3 Podium */}
          {topUsers.length >= 2 && (
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-soft">
              <div className="flex justify-around items-end mb-6">
                {/* 2nd Place */}
                <div 
                  className="text-center cursor-pointer transform hover:scale-105 transition-transform"
                  onClick={() => handleViewProfile(topUsers[1].uid)}
                >
                  <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                    {topUsers[1].photoURL ? (
                      <img 
                        src={topUsers[1].photoURL} 
                        alt={topUsers[1].displayName || ''} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">
                    {topUsers[1].displayName || '匿名'}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">
                    {topUsers[1].stats?.totalSpots || 0}点
                  </p>
                </div>

                {/* 1st Place */}
                <div 
                  className="text-center cursor-pointer transform hover:scale-105 transition-transform -mt-4"
                  onClick={() => handleViewProfile(topUsers[0].uid)}
                >
                  <div className="w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2 ring-4 ring-yellow-400/50">
                    {topUsers[0].photoURL ? (
                      <img 
                        src={topUsers[0].photoURL} 
                        alt={topUsers[0].displayName || ''} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-yellow-600" />
                    )}
                  </div>
                  <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {topUsers[0].displayName || '匿名'}
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    {topUsers[0].stats?.totalSpots || 0}点
                  </p>
                </div>

                {/* 3rd Place */}
                {topUsers[2] && (
                  <div 
                    className="text-center cursor-pointer transform hover:scale-105 transition-transform"
                    onClick={() => handleViewProfile(topUsers[2].uid)}
                  >
                    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                      {topUsers[2].photoURL ? (
                        <img 
                          src={topUsers[2].photoURL} 
                          alt={topUsers[2].displayName || ''} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-amber-600" />
                      )}
                    </div>
                    <Medal className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      {topUsers[2].displayName || '匿名'}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {topUsers[2].stats?.totalSpots || 0}点
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest of Rankings */}
          <div className="space-y-3">
            {topUsers.slice(3).map((user, index) => {
              const rank = index + 4;
              const isCurrentUser = currentUser?.uid === user.uid;
              const achievement = getAchievementBadge(user.stats?.totalSpots || 0);

              return (
                <div
                  key={user.uid}
                  className={`bg-[var(--bg-card)] rounded-xl p-4 shadow-soft cursor-pointer
                    transform hover:scale-[1.02] transition-all duration-200
                    ${isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                  onClick={() => handleViewProfile(user.uid)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="w-10 text-center">
                        <span className="text-xl font-bold text-gray-500">
                          {rank}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName || ''} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {user.displayName || '匿名'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary">
                              (あなた)
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-[var(--text-secondary)]">
                          <span>{user.stats?.totalSpots || 0} スポット</span>
                          <span>{user.stats?.totalLikes || 0} いいね</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievement & Arrow */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${achievement.color}`}>
                        {achievement.label}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current User Rank (if not in top 10) */}
          {currentUser && currentUserRank && currentUserRank > 10 && (
            <div className="mt-6 bg-primary/10 rounded-xl p-4">
              <p className="text-center text-sm text-[var(--text-secondary)] mb-2">
                あなたのランク
              </p>
              <div className="text-center">
                <span className="text-3xl font-bold text-primary">
                  {currentUserRank}
                </span>
                <span className="text-lg text-primary ml-1">位</span>
              </div>
              <p className="text-center text-xs text-[var(--text-secondary)] mt-2">
                もう少しで上位ランクイン！
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};