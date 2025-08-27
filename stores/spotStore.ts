import { create } from 'zustand';
import { CategoryId } from '@/types/category';

// 新しいカテゴリシステムの型定義
export interface SpotCategory {
  mainCategory: CategoryId;
  subCategory?: string;
  tags?: string[];
}

export interface Spot {
  id: string;
  title: string;
  description?: string;
  category: SpotCategory;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images?: string[];
  userId: string;
  author: {
    displayName: string;
    photoURL?: string;
  };
  stats: {
    likesCount: number;
    dislikesCount: number;
    viewsCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface SpotState {
  spots: Spot[];
  loading: boolean;
  error: string | null;
  currentFilter: CategoryId | 'all';
  currentSubCategory: string | null;
  currentTags: string[];
  selectedSpot: Spot | null;
  
  // Actions
  fetchSpots: () => Promise<void>;
  addSpot: (spot: Omit<Spot, 'id' | 'stats' | 'createdAt' | 'updatedAt' | 'isActive'>) => Promise<void>;
  updateSpot: (id: string, updates: Partial<Spot>) => void;
  deleteSpot: (id: string) => void;
  setFilter: (filter: CategoryId | 'all') => void;
  setAdvancedFilter: (mainCategory: CategoryId | 'all', subCategory: string | null, tags: string[]) => void;
  getFilteredSpots: () => Spot[];
  setSelectedSpot: (spot: Spot | null) => void;
}

// Mock data generator
const generateMockSpots = (): Spot[] => {
  const categoryData: { mainCategory: CategoryId; subCategory: string }[] = [
    { mainCategory: 'park_outdoor', subCategory: 'park' },
    { mainCategory: 'family', subCategory: 'kids_space' },
    { mainCategory: 'entertainment', subCategory: 'game_center' },
    { mainCategory: 'food_drink', subCategory: 'cafe' },
    { mainCategory: 'public_facility', subCategory: 'rest_area' },
    { mainCategory: 'pet', subCategory: 'pet_friendly' },
    { mainCategory: 'public_facility', subCategory: 'restroom' },
    { mainCategory: 'park_outdoor', subCategory: 'park' },
    { mainCategory: 'tourism', subCategory: 'photo_spot' },
    { mainCategory: 'vending_machine', subCategory: 'beverage' }
  ];
  
  const titles = [
    '中央公園', '子供の遊び場', 'カフェテラス', '展望台',
    '休憩ベンチ', 'ドッグラン', '公衆トイレ', '遊具広場',
    '桜の撮影スポット', '自動販売機コーナー'
  ];
  
  const descriptions = [
    '静かで落ち着いた雰囲気の公園です',
    '子供たちが安全に遊べる場所',
    'おいしいコーヒーが楽しめます',
    '街を一望できる絶景スポット',
    '疲れたら一休みできます'
  ];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `spot-${i + 1}`,
    title: titles[i % titles.length],
    description: descriptions[i % descriptions.length],
    category: {
      mainCategory: categoryData[i % categoryData.length].mainCategory,
      subCategory: categoryData[i % categoryData.length].subCategory,
      tags: []
    },
    location: {
      latitude: 35.6895 + (Math.random() - 0.5) * 0.1,
      longitude: 139.6917 + (Math.random() - 0.5) * 0.1,
      address: `東京都渋谷区 ${i + 1}丁目`,
    },
    images: [`https://picsum.photos/400/300?random=${i}`],
    userId: `user-${Math.floor(Math.random() * 5) + 1}`,
    author: {
      displayName: `ユーザー${Math.floor(Math.random() * 5) + 1}`,
      photoURL: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10) + 1}`,
    },
    stats: {
      likesCount: Math.floor(Math.random() * 100),
      dislikesCount: Math.floor(Math.random() * 20),
      viewsCount: Math.floor(Math.random() * 500),
    },
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    isActive: true,
  }));
};

export const useSpotStore = create<SpotState>((set, get) => ({
  spots: [],
  loading: false,
  error: null,
  currentFilter: 'all',
  currentSubCategory: null,
  currentTags: [],
  selectedSpot: null,

  fetchSpots: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockSpots = generateMockSpots();
      set({ spots: mockSpots, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch spots', loading: false });
    }
  },

  addSpot: async (spotData) => {
    set({ loading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newSpot: Spot = {
        ...spotData,
        id: `spot-${Date.now()}`,
        stats: {
          likesCount: 0,
          dislikesCount: 0,
          viewsCount: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      set(state => ({
        spots: [newSpot, ...state.spots],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to add spot', loading: false });
    }
  },

  updateSpot: (id, updates) => {
    set(state => ({
      spots: state.spots.map(spot =>
        spot.id === id ? { ...spot, ...updates, updatedAt: new Date() } : spot
      ),
    }));
  },

  deleteSpot: (id) => {
    set(state => ({
      spots: state.spots.filter(spot => spot.id !== id),
    }));
  },

  setFilter: (filter) => {
    set({ currentFilter: filter, currentSubCategory: null, currentTags: [] });
  },

  setAdvancedFilter: (mainCategory, subCategory, tags) => {
    set({ 
      currentFilter: mainCategory, 
      currentSubCategory: subCategory,
      currentTags: tags 
    });
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
}));