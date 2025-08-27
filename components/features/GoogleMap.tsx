'use client';

import React from 'react';
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  Navigation, Plus, Trees, Baby, PartyPopper, Coffee, 
  Armchair, PawPrint, Bath, Dices, BabyIcon, Droplets, 
  Sailboat, Camera, ShoppingBag, HelpCircle 
} from 'lucide-react';
import { loadGoogleMaps, createMap, geocodeLatLng, getCurrentLocation } from '@/lib/google-maps/config';
import { FirebaseSpot } from '@/lib/firebase/spots';
import { useAuth } from '@/contexts/AuthContext';
import ReactDOMServer from 'react-dom/server';

interface GoogleMapProps {
  spots: FirebaseSpot[];
  onAddSpot: (location?: { lat: number; lng: number; address?: string }) => void;
  onSpotClick: (spotId: string) => void;
  onBoundsChange?: (visibleSpotIds: string[]) => void;
}

export interface GoogleMapRef {
  clearTempMarker: () => void;
}

const GoogleMapComponent = forwardRef<GoogleMapRef, GoogleMapProps>(
  ({ spots, onAddSpot, onSpotClick, onBoundsChange }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const tempMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const eventListenerRef = useRef<((e: any) => void) | null>(null);
  const { user } = useAuth();

  // Expose clearTempMarker method to parent
  useImperativeHandle(ref, () => ({
    clearTempMarker: () => {
      // Clear temporary marker
      if (tempMarkerRef.current) {
        tempMarkerRef.current.map = null;
        tempMarkerRef.current = null;
      }
      // Close info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      // Remove event listener if exists
      if (eventListenerRef.current) {
        window.removeEventListener('addSpotAtLocation', eventListenerRef.current);
        eventListenerRef.current = null;
      }
    },
  }), []);

  // Check which spots are visible in the current map bounds
  // Use useRef to avoid circular dependency issues
  const updateVisibleSpotsRef = useRef<() => void>();
  
  useEffect(() => {
    updateVisibleSpotsRef.current = () => {
      if (!map || !onBoundsChange) return;

      const bounds = map.getBounds();
      if (!bounds) return;

      const visibleSpotIds = spots
        .filter(spot => {
          const position = new google.maps.LatLng(
            spot.location.latitude,
            spot.location.longitude
          );
          return bounds.contains(position);
        })
        .map(spot => spot.id!)
        .filter(id => id !== undefined);

      onBoundsChange(visibleSpotIds);
    };
  }, [map, spots, onBoundsChange]);

  const updateVisibleSpots = useCallback(() => {
    updateVisibleSpotsRef.current?.();
  }, []);

  // Get category icon component
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      park_outdoor: Trees,
      family: Baby,
      entertainment: PartyPopper,
      food_drink: Coffee,
      shopping: ShoppingBag,
      tourism: Camera,
      vending_machine: ShoppingBag,
      pet: PawPrint,
      public_facility: Bath,
      transportation: Navigation,
      others: HelpCircle,
    };
    
    return iconMap[category] || HelpCircle;
  };

  // Get category color for advanced markers
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      park_outdoor: '#22c55e',      // green
      family: '#f59e0b',            // amber
      entertainment: '#a855f7',     // purple
      food_drink: '#f97316',        // orange
      shopping: '#ec4899',          // pink
      tourism: '#10b981',           // emerald
      vending_machine: '#14b8a6',   // teal
      pet: '#84cc16',               // lime
      public_facility: '#3b82f6',   // blue
      transportation: '#6b7280',    // gray
      others: '#8b5cf6',            // violet
    };
    
    return colors[category] || colors.others || '#6b7280';
  };

  // Create custom marker content with icon
  const createMarkerContent = useCallback((category: string) => {
    const Icon = getCategoryIcon(category);
    const color = getCategoryColor(category);
    
    // Create icon HTML
    const iconHtml = ReactDOMServer.renderToString(
      <div 
        style={{
          backgroundColor: color,
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      >
        <Icon 
          color="white" 
          size={18} 
          strokeWidth={2}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderStyle: 'solid',
            borderWidth: '8px 6px 0 6px',
            borderColor: `${color} transparent transparent transparent`
          }}
        />
      </div>
    );

    const div = document.createElement('div');
    div.innerHTML = iconHtml;
    return div.firstChild as HTMLElement;
  }, []);

  // Handle long press on map
  const handleLongPress = useCallback(async (latLng: google.maps.LatLng, map: google.maps.Map) => {
    // Check if user is authenticated with Google (not anonymous)
    const isGoogleAuthenticated = user && !user.isAnonymous;
    
    const lat = latLng.lat();
    const lng = latLng.lng();

    // Remove existing temp marker
    if (tempMarkerRef.current) {
      tempMarkerRef.current.map = null;
      tempMarkerRef.current = null;
    }

    // Add temporary marker with animation
    const tempMarkerContent = createMarkerContent('other');
    tempMarkerContent.style.opacity = '0.8';

    const newTempMarker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat, lng },
      map: map,
      content: tempMarkerContent,
      title: '新しいスポット',
    });

    tempMarkerRef.current = newTempMarker;

    // Get address from coordinates
    try {
      const address = await geocodeLatLng(lat, lng);
      
      // Show info window with authentication check
      let infoContent: string;
      if (isGoogleAuthenticated) {
        infoContent = `
          <div style="padding: 8px;">
            <p style="font-weight: bold; margin-bottom: 4px;">この場所にスポットを追加</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${address}</p>
            <button onclick="window.dispatchEvent(new CustomEvent('addSpotAtLocation', { detail: { lat: ${lat}, lng: ${lng}, address: '${address.replace(/'/g, "\\'")}' } }))" 
                    style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              スポットを追加
            </button>
          </div>
        `;
      } else {
        infoContent = `
          <div style="padding: 8px;">
            <p style="font-weight: bold; margin-bottom: 4px;">スポットを追加するには</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">Googleアカウントでのログインが必要です</p>
          </div>
        `;
      }
      
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      infoWindow.open(map, newTempMarker);
      infoWindowRef.current = infoWindow;

      if (isGoogleAuthenticated) {
        // Listen for the custom event to add spot
        const handleAddSpotAtLocation = (e: any) => {
          infoWindow.close();
          // Remove the temporary marker
          newTempMarker.map = null;
          tempMarkerRef.current = null;
          infoWindowRef.current = null;
          onAddSpot(e.detail);
          window.removeEventListener('addSpotAtLocation', handleAddSpotAtLocation);
          eventListenerRef.current = null;
        };
        
        // Remove any existing listener before adding new one
        if (eventListenerRef.current) {
          window.removeEventListener('addSpotAtLocation', eventListenerRef.current);
        }
        
        window.addEventListener('addSpotAtLocation', handleAddSpotAtLocation);
        eventListenerRef.current = handleAddSpotAtLocation;
      } else {
        // Listen for login request event
        const handleRequestLogin = () => {
          infoWindow.close();
          // Remove the temporary marker
          newTempMarker.map = null;
          tempMarkerRef.current = null;
          infoWindowRef.current = null;
          // Trigger login by opening profile screen
          const profileButton = document.querySelector('[data-testid="profile-button"]') as HTMLButtonElement;
          if (profileButton) {
            profileButton.click();
          }
          window.removeEventListener('requestLogin', handleRequestLogin);
        };
        
        window.addEventListener('requestLogin', handleRequestLogin);
      }

      // Remove marker when info window is closed
      infoWindow.addListener('closeclick', () => {
        newTempMarker.map = null;
        tempMarkerRef.current = null;
        infoWindowRef.current = null;
        if (eventListenerRef.current) {
          window.removeEventListener('addSpotAtLocation', eventListenerRef.current);
          eventListenerRef.current = null;
        }
        window.removeEventListener('requestLogin', () => {});
      });
    } catch (error) {
      console.error('Failed to get address:', error);
      if (isGoogleAuthenticated) {
        onAddSpot({ lat, lng });
      }
    }
  }, [onAddSpot, user, createMarkerContent]);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMaps();
        
        if (mapRef.current && !map) {
          const newMap = createMap(mapRef.current);
          setMap(newMap);
          setIsLoading(false);

          // Add bounds change listener with debouncing
          let boundsChangeTimer: NodeJS.Timeout | null = null;
          newMap.addListener('bounds_changed', () => {
            if (boundsChangeTimer) {
              clearTimeout(boundsChangeTimer);
            }
            boundsChangeTimer = setTimeout(() => {
              updateVisibleSpots();
            }, 300); // Debounce for 300ms
          });

          // Add long press event listener
          let longPressTimer: NodeJS.Timeout | null = null;
          let isDragging = false;
          let pressStartTime = 0;

          // Mouse events for desktop
          newMap.addListener('mousedown', (e: google.maps.MapMouseEvent) => {
            isDragging = false;
            pressStartTime = Date.now();
            
            longPressTimer = setTimeout(async () => {
              if (!isDragging && e.latLng) {
                await handleLongPress(e.latLng, newMap);
              }
            }, 500); // 500ms for long press
          });

          newMap.addListener('mousemove', () => {
            if (Date.now() - pressStartTime > 50) {
              isDragging = true;
              if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
              }
            }
          });

          newMap.addListener('mouseup', () => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          });

          // Touch events for mobile
          newMap.addListener('touchstart', (e: any) => {
            isDragging = false;
            pressStartTime = Date.now();
            
            // Prevent default to avoid conflicts
            e.domEvent?.preventDefault();
            
            longPressTimer = setTimeout(async () => {
              if (!isDragging) {
                // Get the first touch point
                const touch = e.domEvent?.touches?.[0];
                if (touch) {
                  const point = new google.maps.Point(touch.clientX, touch.clientY);
                  // Project the point to lat/lng
                  const projection = newMap.getProjection();
                  const bounds = newMap.getBounds();
                  
                  if (projection && bounds) {
                    // Calculate approximate lat/lng from touch position
                    const ne = bounds.getNorthEast();
                    const sw = bounds.getSouthWest();
                    const mapWidth = mapRef.current?.clientWidth || 0;
                    const mapHeight = mapRef.current?.clientHeight || 0;
                    
                    const x = touch.clientX - (mapRef.current?.getBoundingClientRect().left || 0);
                    const y = touch.clientY - (mapRef.current?.getBoundingClientRect().top || 0);
                    
                    const lng = sw.lng() + (ne.lng() - sw.lng()) * (x / mapWidth);
                    const lat = ne.lat() - (ne.lat() - sw.lat()) * (y / mapHeight);
                    
                    const latLng = new google.maps.LatLng(lat, lng);
                    await handleLongPress(latLng, newMap);
                  }
                }
              }
            }, 500);
          });

          newMap.addListener('touchmove', () => {
            isDragging = true;
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          });

          newMap.addListener('touchend', () => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          });

          // Clean up drag listener
          newMap.addListener('dragstart', () => {
            isDragging = true;
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          });
        }
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [map, handleLongPress, updateVisibleSpots]);

  // Store markers in a ref with spot IDs to avoid recreating them
  const markersMapRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());

  // Cleanup all markers on unmount
  useEffect(() => {
    const markersMap = markersMapRef.current;
    return () => {
      markersMap.forEach(marker => {
        marker.map = null;
      });
      markersMap.clear();
    };
  }, []);

  // Add markers for spots
  useEffect(() => {
    if (!map || !spots) return;

    const currentMarkers = markersMapRef.current;
    const spotIds = new Set(spots.map(spot => spot.id).filter(id => id));

    // Remove markers for spots that no longer exist
    currentMarkers.forEach((marker, spotId) => {
      if (!spotIds.has(spotId)) {
        marker.map = null;
        currentMarkers.delete(spotId);
      }
    });

    // Add or update markers for current spots
    spots.forEach(spot => {
      if (!spot.id) return;

      // Check if marker already exists
      if (!currentMarkers.has(spot.id)) {
        // Create custom marker with icon
        const markerContent = createMarkerContent(spot.category.mainCategory);

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: {
            lat: spot.location.latitude,
            lng: spot.location.longitude,
          },
          map: map,
          title: spot.title,
          content: markerContent,
        });

        marker.addListener('click', () => {
          onSpotClick(spot.id!);
        });

        currentMarkers.set(spot.id, marker);
      } else {
        // Update existing marker position if needed
        const marker = currentMarkers.get(spot.id)!;
        marker.position = {
          lat: spot.location.latitude,
          lng: spot.location.longitude,
        };
      }
    });

    // Update visible spots after markers are placed
    setTimeout(() => {
      updateVisibleSpotsRef.current?.();
    }, 100);

    // Cleanup function
    return () => {
      // Don't clear markers here, they will be managed by the ref
    };
  }, [map, spots, onSpotClick, createMarkerContent]);

  // Get current location
  const handleGetLocation = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      const { latitude: lat, longitude: lng } = position.coords;
      
      setUserLocation({ lat, lng });
      
      if (map) {
        map.setCenter({ lat, lng });
        map.setZoom(15);

        // Add user location marker with AdvancedMarkerElement
        const userLocationPin = new google.maps.marker.PinElement({
          background: '#4285F4',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          scale: 1.2,
        });

        new google.maps.marker.AdvancedMarkerElement({
          position: { lat, lng },
          map: map,
          title: '現在地',
          content: userLocationPin.element,
        });
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      alert('位置情報の取得に失敗しました');
    }
  }, [map]);

  return (
    <section className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
      <div ref={mapRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">地図を読み込み中...</p>
          </div>
        </div>
      )}
      
      {/* Add spot button - bottom right */}
      <button
        onClick={() => onAddSpot()}
        className="absolute bottom-6 right-6 w-14 h-14 bg-terracotta-500 text-white rounded-full shadow-lg hover:bg-terracotta-600 transition-all duration-200 flex items-center justify-center group hover:scale-105 active:scale-95 z-10"
        aria-label="スポットを追加"
      >
        <Plus className="w-6 h-6" />
        <span className="absolute right-full mr-2 whitespace-nowrap bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          スポットを追加
        </span>
      </button>

      {/* Current location button - bottom right, above add spot button */}
      <button
        onClick={handleGetLocation}
        className="absolute bottom-24 right-6 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center group hover:scale-105 active:scale-95 z-10"
        aria-label="現在地を表示"
      >
        <Navigation className="w-5 h-5 text-gray-700 dark:text-white" />
        <span className="absolute right-full mr-2 whitespace-nowrap bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          現在地を表示
        </span>
      </button>
    </section>
  );
}
);

GoogleMapComponent.displayName = 'GoogleMap';

export const GoogleMap = GoogleMapComponent;