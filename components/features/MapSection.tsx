'use client';

import { Navigation, Plus, Map } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MapSectionProps {
  onAddSpot: () => void;
  onSpotClick: (spotId: string) => void;
}

export function MapSection({ onAddSpot, onSpotClick }: MapSectionProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);
  }, []);

  return (
    <section className="relative h-[50vh] bg-gray-100 dark:bg-gray-800">
      <div id="map" className="w-full h-full">
        {!isMapLoaded ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Map className="w-12 h-12 mx-auto mb-2" />
              <p>地図を読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 opacity-30">
            {/* This is a placeholder for the actual map */}
            {/* Google Maps will be integrated here */}
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => {
            // Get current location
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  console.log('Current location:', position.coords);
                },
                (error) => {
                  console.error('Error getting location:', error);
                }
              );
            }
          }}
          className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label="現在地を表示"
        >
          <Navigation className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        
        <button
          onClick={onAddSpot}
          className="bg-primary hover:bg-primary-dark p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          aria-label="スポットを追加"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>
    </section>
  );
}