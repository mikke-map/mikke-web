import { Loader } from '@googlemaps/js-api-loader';

let mapLoader: Loader | null = null;
let isLoaded = false;

export const initGoogleMaps = () => {
  if (!mapLoader && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    mapLoader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'marker'],
      language: 'ja',
      region: 'JP',
    });
  }
  return mapLoader;
};

export const loadGoogleMaps = async () => {
  if (isLoaded) return;
  
  const loader = initGoogleMaps();
  if (loader) {
    await loader.load();
    isLoaded = true;
  }
};

export const createMap = (
  element: HTMLElement,
  options?: google.maps.MapOptions
): google.maps.Map => {
  const defaultOptions: google.maps.MapOptions = {
    center: { lat: 35.6895, lng: 139.6917 }, // Tokyo
    zoom: 13,
    disableDefaultUI: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
    // Note: styles cannot be used with mapId
    // Map styling should be configured in Google Cloud Console
  };

  return new google.maps.Map(element, { ...defaultOptions, ...options });
};

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export const geocodeLatLng = async (
  lat: number,
  lng: number
): Promise<string> => {
  const geocoder = new google.maps.Geocoder();
  
  try {
    const response = await geocoder.geocode({
      location: { lat, lng },
    });
    
    if (response.results[0]) {
      return response.results[0].formatted_address;
    }
    
    return '住所を取得できませんでした';
  } catch (error) {
    console.error('Geocoding error:', error);
    return '住所を取得できませんでした';
  }
};