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
    </section>
  );
}