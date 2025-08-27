import { create } from 'zustand';
import { Category, ItemStatus, CategoryId, CATEGORY_EMOJI_ICONS } from '@/types/category';
import categoriesData from '@/public/categories.json';

interface CategoryStore {
  categories: Category[];
  itemStatuses: ItemStatus[];
  loading: boolean;
  initialized: boolean;
  
  // Getters
  getCategoryById: (id: string) => Category | undefined;
  getSubCategory: (categoryId: string, subCategoryId: string) => { category: Category; subCategory: any } | undefined;
  getCategoryEmoji: (categoryId: string) => string;
  
  // Initialize
  initialize: () => void;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  itemStatuses: [],
  loading: false,
  initialized: false,
  
  getCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id);
  },
  
  getSubCategory: (categoryId: string, subCategoryId: string) => {
    const category = get().categories.find(cat => cat.id === categoryId);
    if (!category) return undefined;
    
    const subCategory = category.subCategories.find(sub => sub.id === subCategoryId);
    if (!subCategory) return undefined;
    
    return { category, subCategory };
  },
  
  getCategoryEmoji: (categoryId: string) => {
    return CATEGORY_EMOJI_ICONS[categoryId as CategoryId] || '📍';
  },
  
  initialize: () => {
    if (get().initialized) return;
    
    set({ 
      categories: categoriesData.categories as Category[],
      itemStatuses: categoriesData.itemStatus as ItemStatus[],
      loading: false,
      initialized: true
    });
  }
}));

// カテゴリ選択UI用のヘルパー関数
export function getCategoriesForUI() {
  const categories = categoriesData.categories as Category[];
  
  return categories.map(cat => ({
    id: cat.id,
    label: cat.displayName,
    icon: CATEGORY_EMOJI_ICONS[cat.id as CategoryId] || '📍',
    color: cat.color.hex,
    subCategories: cat.subCategories.map(sub => ({
      id: sub.id,
      label: sub.name,
      tags: sub.tags
    }))
  }));
}

