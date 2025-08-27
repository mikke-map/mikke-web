'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { FilterSection } from '@/components/features/FilterSection';
import { GoogleMap } from '@/components/features/GoogleMap';
import { SpotList } from '@/components/features/SpotList';
import { HamburgerMenu } from '@/components/layout/HamburgerMenu';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { AddSpotModal } from '@/components/features/AddSpotModal';
import { SpotDetailModal } from '@/components/features/SpotDetailModal';
import { ProfileScreen } from '@/components/features/ProfileScreen';
import { MySpots } from '@/components/features/MySpots';
import { RankingScreen } from '@/components/features/RankingScreen';
import { useThemeStore } from '@/stores/themeStore';
import { useSpotStore } from '@/stores/spotStore';
import { useFirebaseSpotStore } from '@/stores/firebaseSpotStore';

import { BadgeCelebrationModal } from '@/components/features/BadgeCelebrationModal';
import { useBadges } from '@/contexts/BadgeContext';
import DevelopmentStageModal from '@/components/ui/DevelopmentStageModal';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSpot, setShowAddSpot] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'home' | 'ranking' | 'profile' | 'mySpots'>('home');
  const [useFirebase, setUseFirebase] = useState(false);
  const [addSpotLocation, setAddSpotLocation] = useState<{ lat: number; lng: number; address?: string } | undefined>();
  const [visibleSpotIds, setVisibleSpotIds] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDevelopmentStage, setShowDevelopmentStage] = useState(false);
  const mapRef = useRef<{ clearTempMarker: () => void } | null>(null);
  
  const { theme } = useThemeStore();
  const { spots: mockSpots, loading: mockLoading, fetchSpots: fetchMockSpots } = useSpotStore();
  const { 
    spots: firebaseSpots, 
    loading: firebaseLoading, 
    initializeSpots,
    cleanup 
  } = useFirebaseSpotStore();
  
  // Badge system
  const { celebration, dismissCelebration } = useBadges();
  
  // Check if Firebase is configured
  useEffect(() => {
    const hasFirebaseConfig = 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    setUseFirebase(!!hasFirebaseConfig);
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    // Check if user has seen the development stage notification
    const hasSeenDevStage = localStorage.getItem('hasSeenDevelopmentStage');
    if (!hasSeenDevStage && !isLoading) {
      // Show the modal after a short delay when loading is complete
      const timer = setTimeout(() => {
        setShowDevelopmentStage(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      if (useFirebase) {
        // Use Firebase
        try {
          initializeSpots();
        } catch (error) {
          console.error('Firebase initialization failed, falling back to mock data:', error);
          await fetchMockSpots();
        }
      } else {
        // Use mock data
        await fetchMockSpots();
      }
      
      // Hide loading screen after data is loaded
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    initApp();
    
    // Cleanup on unmount
    return () => {
      if (useFirebase) {
        cleanup();
      }
    };
  }, [useFirebase, fetchMockSpots, initializeSpots, cleanup]);

  const handleAddSpot = (location?: { lat: number; lng: number; address?: string }) => {
    setAddSpotLocation(location);
    setShowAddSpot(true);
  };

  const handleSpotClick = (spotId: string) => {
    setSelectedSpotId(spotId);
  };

  const handleBoundsChange = (spotIds: string[]) => {
    setVisibleSpotIds(spotIds);
  };

  const handleCloseModals = () => {
    setShowAddSpot(false);
    setSelectedSpotId(null);
    setAddSpotLocation(undefined);
    // Clear temporary marker on map
    if (mapRef.current) {
      mapRef.current.clearTempMarker();
    }
  };

  const handleCloseDevelopmentStage = () => {
    setShowDevelopmentStage(false);
    // Mark as seen so it won't show again
    localStorage.setItem('hasSeenDevelopmentStage', 'true');
  };

  // Use appropriate spots based on configuration
  const spots = useFirebase ? firebaseSpots : mockSpots;
  const loading = useFirebase ? firebaseLoading : mockLoading;

  // Convert Firebase spots to match the expected format if needed
  const normalizedSpots = spots
    .filter(spot => spot.id) // Filter out spots without an id
    .map(spot => ({
      ...spot,
      id: spot.id!, // Assert that id exists after filtering
      createdAt: spot.createdAt instanceof Date ? spot.createdAt : new Date(),
      updatedAt: spot.updatedAt instanceof Date ? spot.updatedAt : new Date(),
    }));

  // Filter spots to only show those visible on the map
  const visibleSpots = visibleSpotIds.length > 0
    ? normalizedSpots.filter(spot => visibleSpotIds.includes(spot.id))
    : normalizedSpots; // Show all spots initially before map bounds are set

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      {currentScreen === 'home' && (
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Filter Section with Menu Button */}
          <FilterSection onMenuClick={() => setIsMenuOpen(true)} />

          {/* Map Section - Takes remaining space above SpotList */}
          <div className="flex-1 relative overflow-hidden">
            {/* Map Section - Use GoogleMap when API key is available */}
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <GoogleMap 
                ref={mapRef}
                spots={normalizedSpots as any}
                onAddSpot={handleAddSpot}
                onSpotClick={handleSpotClick}
                onBoundsChange={handleBoundsChange}
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="mb-2">Google Maps APIキーが設定されていません</p>
                  <p className="text-sm">.env.localファイルにAPIキーを追加してください</p>
                </div>
              </div>
            )}
          </div>

          {/* Spot List Section - Fixed height at bottom, no gaps */}
          <div className="h-[35vh] max-h-[350px] flex-shrink-0">
            <SpotList 
              spots={visibleSpots}
              onSpotClick={handleSpotClick}
            />
          </div>
        </main>
      )}

      {currentScreen === 'ranking' && (
        <main className="flex-1">
          <RankingScreen 
            onMenuClick={() => setIsMenuOpen(true)}
            onViewUserProfile={(userId) => {
              // Navigate to user profile view
              console.log('Viewing user profile:', userId);
              // You can implement user profile viewing here
            }}
          />
        </main>
      )}

      {currentScreen === 'profile' && (
        <main className="flex-1">
          <ProfileScreen 
            onNavigateToMySpots={() => setCurrentScreen('mySpots')}
            onMenuClick={() => setIsMenuOpen(true)}
          />
        </main>
      )}

      {currentScreen === 'mySpots' && (
        <main className="flex-1">
          <MySpots 
            onBack={() => setCurrentScreen('profile')}
            onCreateSpot={() => handleAddSpot()}
            onMenuClick={() => setIsMenuOpen(true)}
          />
        </main>
      )}

      {/* Hamburger Menu */}
      <HamburgerMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        onAddSpot={() => handleAddSpot()}
      />

      {/* Modals */}
      {showAddSpot && (
        <AddSpotModal 
          isOpen={showAddSpot}
          onClose={handleCloseModals}
          initialLocation={addSpotLocation}
          useFirebase={useFirebase}
        />
      )}

      {selectedSpotId && (
        <SpotDetailModal 
          spotId={selectedSpotId}
          onClose={handleCloseModals}
        />
      )}

      {/* Badge Celebration Modal */}
      <BadgeCelebrationModal
        celebration={celebration}
        onClose={dismissCelebration}
        onViewBadges={() => {
          dismissCelebration();
          setCurrentScreen('profile');
        }}
      />

      {/* Development Stage Modal */}
      <DevelopmentStageModal
        isOpen={showDevelopmentStage}
        onClose={handleCloseDevelopmentStage}
      />
    </div>
  );
}