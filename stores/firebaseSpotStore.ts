import { create } from 'zustand';
import {
  FirebaseSpot,
  getSpots,
  subscribeToSpots,
  createSpot as firebaseCreateSpot,
  updateSpot as firebaseUpdateSpot,
  deleteSpot as firebaseDeleteSpot,
  rateSpot,
  incrementViewCount,
  uploadSpotImage,
} from '@/lib/firebase/spots';
import { CategoryId } from '@/types/category';

interface FirebaseSpotState {
  spots: FirebaseSpot[];
  loading: boolean;
  error: string | null;
  currentFilter: CategoryId | 'all';
  currentSubCategory: string | null;
  currentTags: string[];
  selectedSpot: FirebaseSpot | null;
  unsubscribe: (() => void) | null;
  
  // Actions
  initializeSpots: () => void;
  fetchSpots: (category?: CategoryId) => Promise<void>;
  addSpot: (spotData: Omit<FirebaseSpot, 'id' | 'stats' | 'createdAt' | 'updatedAt' | 'isActive'>, images?: (File | string)[]) => Promise<string>;
  updateSpot: (id: string, updates: Partial<FirebaseSpot>) => Promise<void>;
  deleteSpot: (id: string) => Promise<void>;
  likeSpot: (spotId: string) => Promise<void>;
  dislikeSpot: (spotId: string) => Promise<void>;
  viewSpot: (spotId: string) => Promise<void>;
  setFilter: (filter: CategoryId | 'all') => void;
  setAdvancedFilter: (mainCategory: CategoryId | 'all', subCategory: string | null, tags: string[]) => void;
  getFilteredSpots: () => FirebaseSpot[];
  setSelectedSpot: (spot: FirebaseSpot | null) => void;
  cleanup: () => void;
}

export const useFirebaseSpotStore = create<FirebaseSpotState>((set, get) => ({
  spots: [],
  loading: false,
  error: null,
  currentFilter: 'all',
  currentSubCategory: null,
  currentTags: [],
  selectedSpot: null,
  unsubscribe: null,

  initializeSpots: () => {
    const { unsubscribe: existingUnsubscribe } = get();
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    set({ loading: true, error: null });

    const unsubscribe = subscribeToSpots(
      { 
        category: get().currentFilter !== 'all' ? get().currentFilter as CategoryId : undefined,
        limitCount: 50 
      },
      (spots) => {
        set({ spots, loading: false });
      }
    );

    set({ unsubscribe });
  },

  fetchSpots: async (category?: CategoryId) => {
    set({ loading: true, error: null });
    try {
      const { spots } = await getSpots({ category, limitCount: 50 });
      set({ spots, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch spots', loading: false });
      console.error('Error fetching spots:', error);
    }
  },

  addSpot: async (spotData, images) => {
    set({ loading: true });
    try {
      const spotId = await firebaseCreateSpot(spotData);
      
      // Upload images if provided
      if (images && images.length > 0) {
        const imageUrls: string[] = [];
        for (const image of images) {
          if (image instanceof File) {
            const url = await uploadSpotImage(image, spotId);
            imageUrls.push(url);
          } else if (typeof image === 'string') {
            imageUrls.push(image);
          }
        }
        
        // Update spot with image URLs
        await firebaseUpdateSpot(spotId, { images: imageUrls });
      }
      
      set({ loading: false });
      return spotId;
    } catch (error) {
      set({ error: 'Failed to add spot', loading: false });
      console.error('Error adding spot:', error);
      throw error;
    }
  },

  updateSpot: async (id, updates) => {
    set({ loading: true });
    try {
      await firebaseUpdateSpot(id, updates);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to update spot', loading: false });
      console.error('Error updating spot:', error);
      throw error;
    }
  },

  deleteSpot: async (id) => {
    set({ loading: true });
    try {
      await firebaseDeleteSpot(id);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Failed to delete spot', loading: false });
      console.error('Error deleting spot:', error);
      throw error;
    }
  },

  likeSpot: async (spotId) => {
    try {
      await rateSpot(spotId, 'like');
    } catch (error) {
      console.error('Error liking spot:', error);
      throw error;
    }
  },

  dislikeSpot: async (spotId) => {
    try {
      await rateSpot(spotId, 'dislike');
    } catch (error) {
      console.error('Error disliking spot:', error);
      throw error;
    }
  },

  viewSpot: async (spotId) => {
    try {
      await incrementViewCount(spotId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  },

  setFilter: (filter) => {
    set({ currentFilter: filter, currentSubCategory: null, currentTags: [] });
    // Re-initialize with new filter
    get().initializeSpots();
  },

  setAdvancedFilter: (mainCategory, subCategory, tags) => {
    set({ 
      currentFilter: mainCategory, 
      currentSubCategory: subCategory,
      currentTags: tags 
    });
    // Re-initialize with new filter
    get().initializeSpots();
  },

  getFilteredSpots: () => {
    const state = get();
    const { spots, currentFilter, currentSubCategory, currentTags } = state;
    
    // If no filter is applied, return all spots
    if (currentFilter === 'all') {
      return spots;
    }

    // Filter by main category
    let filteredSpots = spots.filter(spot => {
      // Check if spot has the new category structure
      if (spot.category && typeof spot.category === 'object' && 'mainCategory' in spot.category) {
        return spot.category.mainCategory === currentFilter;
      }
      // Fallback for legacy spots
      return spot.category === currentFilter;
    });

    // Filter by subcategory if specified
    if (currentSubCategory) {
      filteredSpots = filteredSpots.filter(spot => {
        if (spot.category && typeof spot.category === 'object' && 'subCategory' in spot.category) {
          return spot.category.subCategory === currentSubCategory;
        }
        return false;
      });
    }

    // Filter by tags if specified
    if (currentTags.length > 0) {
      filteredSpots = filteredSpots.filter(spot => {
        if (spot.category && typeof spot.category === 'object' && 'tags' in spot.category && spot.category.tags) {
          // Check if spot has at least one of the selected tags
          return currentTags.some(tag => spot.category.tags?.includes(tag));
        }
        return false;
      });
    }

    return filteredSpots;
  },

  setSelectedSpot: (spot) => {
    set({ selectedSpot: spot });
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));