'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Heart, Star, Settings, LogOut, LogIn, UserCircle, Mail, Calendar, Activity, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStats, refreshUserStats, subscribeToUserStats, UserStats } from '@/lib/firebase/userStats';
import { MySpots } from './MySpots';
import { BadgeListScreen } from './BadgeListScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import Image from 'next/image';

type ProfileView = 'main' | 'my-spots' | 'favorites' | 'settings' | 'badges';

interface ProfileScreenProps {
  onNavigateToMySpots?: () => void;
  onMenuClick?: () => void;
}

export function ProfileScreen({ onNavigateToMySpots, onMenuClick }: ProfileScreenProps = {}) {
  const { user, loading, signInWithGoogle, signInAnonymously, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [currentView, setCurrentView] = useState<ProfileView>('main');
  const [userStats, setUserStats] = useState<UserStats>({
    totalSpots: 0,
    totalLikes: 0,
    totalViews: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch and subscribe to real user stats from Firebase
  useEffect(() => {
    if (user && user.uid) {
      let unsubscribe: (() => void) | undefined;
      
      const loadUserStats = async () => {
        setIsLoadingStats(true);
        try {
          // First, get the current stats
          const stats = await getUserStats(user.uid);
          setUserStats(stats);
          
          // If stats are empty or outdated, refresh them
          if (stats.totalSpots === 0 && stats.totalLikes === 0 && stats.totalViews === 0) {
            const refreshedStats = await refreshUserStats(user.uid);
            setUserStats(refreshedStats);
          }
          
          // Subscribe to real-time updates
          unsubscribe = subscribeToUserStats(user.uid, (newStats) => {
            setUserStats(newStats);
          });
        } catch (error) {
          console.error('Error loading user stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      };
      
      loadUserStats();
      
      // Cleanup subscription on unmount or user change
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } else {
      // Reset stats when user logs out
      setUserStats({
        totalSpots: 0,
        totalLikes: 0,
        totalViews: 0,
      });
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInAnonymously();
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '不明';
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle different views for logged-in users
  if (user && currentView === 'my-spots') {
    return (
      <MySpots
        onBack={() => setCurrentView('main')}
        onEditSpot={(spotId) => {
          console.log('Edit spot:', spotId);
          // TODO: Navigate to edit spot screen
        }}
        onCreateSpot={() => {
          console.log('Create new spot');
          // TODO: Navigate to create spot screen
        }}
      />
    );
  }

  if (user && currentView === 'badges') {
    return (
      <BadgeListScreen
        onBack={() => setCurrentView('main')}
      />
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        {/* Screen Header with Hamburger Menu */}
        {onMenuClick && (
          <ScreenHeader 
            currentScreen="profile"
            onMenuClick={onMenuClick}
          />
        )}
        <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-soft p-8 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCircle className="w-12 h-12 text-primary" />
            </div>
            
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">
              Mikkeへようこそ
            </h2>
            <p className="text-[var(--text-muted)] mb-8">
              ログインして、あなたの発見を共有しましょう
            </p>

            {/* Sign In Options */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full btn-primary flex items-center justify-center space-x-3 py-3 shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                </svg>
                <span>Googleでログイン</span>
              </button>

              <button
                onClick={handleAnonymousSignIn}
                disabled={isSigningIn}
                className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] py-3 px-6 rounded-xl hover:bg-primary-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <UserCircle className="w-5 h-5" />
                <span>匿名でログイン</span>
              </button>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-[var(--text-muted)] mt-6">
              ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます
            </p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Logged in state
  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
      {/* Screen Header with Hamburger Menu */}
      {onMenuClick && (
        <ScreenHeader 
          currentScreen="profile"
          onMenuClick={onMenuClick}
        />
      )}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary-100 via-primary-50 to-[var(--bg-card)] rounded-2xl shadow-soft p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              {user.photoURL ? (
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-soft">
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary-200 rounded-full flex items-center justify-center ring-4 ring-white shadow-soft">
                  <UserCircle className="w-12 h-12 text-primary" />
                </div>
              )}
              {/* Online Status */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full ring-2 ring-white"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-serif text-2xl font-bold text-primary mb-1">
                {user.displayName || '匿名ユーザー'}
              </h2>
              {user.email && (
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-[var(--text-muted)] mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-[var(--text-muted)]">
                <Calendar className="w-4 h-4" />
                <span>参加日: {formatDate(user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null)}</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="bg-white/80 backdrop-blur-sm text-primary px-4 py-2 rounded-xl hover:bg-white transition-all duration-200 flex items-center space-x-2 shadow-soft"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--bg-card)] rounded-xl p-4 text-center shadow-soft">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg mx-auto mb-2">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            {isLoadingStats ? (
              <div className="h-8 flex items-center justify-center">
                <div className="animate-pulse bg-primary-100 rounded w-12 h-6"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-primary">{userStats.totalSpots}</div>
            )}
            <div className="text-sm text-[var(--text-muted)]">投稿スポット</div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl p-4 text-center shadow-soft">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg mx-auto mb-2">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            {isLoadingStats ? (
              <div className="h-8 flex items-center justify-center">
                <div className="animate-pulse bg-primary-100 rounded w-12 h-6"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-primary">{userStats.totalLikes}</div>
            )}
            <div className="text-sm text-[var(--text-muted)]">いいね獲得</div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl p-4 text-center shadow-soft">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg mx-auto mb-2">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            {isLoadingStats ? (
              <div className="h-8 flex items-center justify-center">
                <div className="animate-pulse bg-primary-100 rounded w-12 h-6"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-primary">{userStats.totalViews}</div>
            )}
            <div className="text-sm text-[var(--text-muted)]">閲覧数</div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-4">
          {/* My Spots Section */}
          <div className="bg-[var(--bg-card)] rounded-xl shadow-soft overflow-hidden">
            <button 
              onClick={() => onNavigateToMySpots?.()}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-[var(--text-primary)]">投稿したスポット</div>
                  <div className="text-sm text-[var(--text-muted)]">{userStats.totalSpots}件のスポット</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Badge Collection Section */}
          <div className="bg-[var(--bg-card)] rounded-xl shadow-soft overflow-hidden">
            <button 
              onClick={() => setCurrentView('badges')}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-800" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-[var(--text-primary)]">バッジコレクション</div>
                  <div className="text-sm text-[var(--text-muted)]">獲得した実績を確認</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Favorites Section */}
          <div className="bg-[var(--bg-card)] rounded-xl shadow-soft overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-[var(--text-primary)]">お気に入り</div>
                  <div className="text-sm text-[var(--text-muted)]">保存したスポット</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Settings Section */}
          <div className="bg-[var(--bg-card)] rounded-xl shadow-soft overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-[var(--text-primary)]">設定</div>
                  <div className="text-sm text-[var(--text-muted)]">アカウント・通知・プライバシー</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
          <p>Mikke v1.0.0</p>
          <p className="mt-1">© 2024 Mikke. All rights reserved.</p>
        </div>
      </div>
      </div>
    </div>
  );
}