'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Trees, 
  Baby, 
  Gamepad2, 
  Coffee, 
  ShoppingBag,
  Camera,
  Package2,
  Dog,
  Building2,
  Car,
  Sparkles,
  MoreHorizontal,
  Menu,
  Check,
  X
} from 'lucide-react';
import { useSpotStore } from '@/stores/spotStore';
import { useFirebaseSpotStore } from '@/stores/firebaseSpotStore';
import { CategoryId } from '@/types/category';

const filterCategories = [
  { id: 'all' as const, label: 'すべて', icon: MoreHorizontal },
  { id: 'park_outdoor' as CategoryId, label: '公園・屋外', icon: Trees },
  { id: 'family' as CategoryId, label: '子育て', icon: Baby },
  { id: 'entertainment' as CategoryId, label: '娯楽', icon: Gamepad2 },
  { id: 'food_drink' as CategoryId, label: '飲食', icon: Coffee },
  { id: 'shopping' as CategoryId, label: '買い物', icon: ShoppingBag },
  { id: 'tourism' as CategoryId, label: '観光', icon: Camera },
  { id: 'vending_machine' as CategoryId, label: '自販機', icon: Package2 },
  { id: 'pet' as CategoryId, label: 'ペット', icon: Dog },
  { id: 'public_facility' as CategoryId, label: '公共施設', icon: Building2 },
  { id: 'transportation' as CategoryId, label: '交通', icon: Car },
  { id: 'others' as CategoryId, label: 'その他', icon: Sparkles },
];

interface FilterSectionProps {
  onMenuClick?: () => void;
}

interface CategoryData {
  id: string;
  displayName: string;
  subCategories: {
    id: string;
    name: string;
    tags: string[];
  }[];
}

export function FilterSection({ onMenuClick }: FilterSectionProps) {
  const { currentFilter, currentSubCategory, currentTags, setAdvancedFilter } = useSpotStore();
  const { 
    currentFilter: firebaseFilter, 
    currentSubCategory: firebaseSubCategory,
    currentTags: firebaseTags,
    setAdvancedFilter: firebaseSetAdvancedFilter 
  } = useFirebaseSpotStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [expandedSubCategory, setExpandedSubCategory] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [previousExpandedCategory, setPreviousExpandedCategory] = useState<string | null>(null);
  const [isCollapsingSubCategory, setIsCollapsingSubCategory] = useState(false);
  const [previousExpandedSubCategory, setPreviousExpandedSubCategory] = useState<string | null>(null);
  const [isExpandingCategory, setIsExpandingCategory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if using Firebase
  const useFirebase = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Load category data
  useEffect(() => {
    fetch('/categories.json')
      .then(res => res.json())
      .then(data => setCategoryData(data.categories))
      .catch(err => console.error('Failed to load categories:', err));
  }, []);

  // Sync local state with store state
  useEffect(() => {
    const filter = useFirebase ? firebaseFilter : currentFilter;
    const subCategory = useFirebase ? firebaseSubCategory : currentSubCategory;
    const tags = useFirebase ? firebaseTags : currentTags;
    
    if (filter === 'all') {
      setExpandedCategory(null);
      setSelectedSubCategory(null);
      setSelectedTags([]);
      setExpandedSubCategory(null);
    } else {
      setExpandedCategory(filter);
      setSelectedSubCategory(subCategory);
      setSelectedTags(tags || []);
    }
  }, [useFirebase, firebaseFilter, firebaseSubCategory, firebaseTags, currentFilter, currentSubCategory, currentTags]);

  // Handle main category selection
  const handleMainCategorySelect = (categoryId: string) => {
    setIsTransitioning(true);
    
    if (categoryId === 'all') {
      // Reset all filters
      setIsCollapsing(true);
      setIsExpandingCategory(false);
      setPreviousExpandedCategory(expandedCategory);
      setExpandedCategory(null);
      setSelectedSubCategory(null);
      setExpandedSubCategory(null);
      setSelectedTags([]);
      // Apply filter to store
      if (useFirebase) {
        firebaseSetAdvancedFilter('all', null, []);
      } else {
        setAdvancedFilter('all', null, []);
      }
    } else if (expandedCategory === categoryId) {
      // Collapse if clicking the same category
      setIsCollapsing(true);
      setIsExpandingCategory(false);
      setPreviousExpandedCategory(expandedCategory);
      setExpandedCategory(null);
      setSelectedSubCategory(null);
      setExpandedSubCategory(null);
      setSelectedTags([]);
      // Reset filter
      if (useFirebase) {
        firebaseSetAdvancedFilter('all', null, []);
      } else {
        setAdvancedFilter('all', null, []);
      }
    } else {
      // Expand new category
      setIsCollapsing(false);
      setIsExpandingCategory(true);
      setPreviousExpandedCategory(expandedCategory);
      setExpandedCategory(categoryId);
      setSelectedSubCategory(null);
      setExpandedSubCategory(null);
      setSelectedTags([]);
      // Apply filter to store
      if (useFirebase) {
        firebaseSetAdvancedFilter(categoryId as CategoryId, null, []);
      } else {
        setAdvancedFilter(categoryId as CategoryId, null, []);
      }
    }
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
      setIsCollapsing(false);
      setIsExpandingCategory(false);
      setPreviousExpandedCategory(null);
    }, 300);
  };

  // Handle sub category selection
  const handleSubCategorySelect = (mainCategoryId: string, subCategoryId: string) => {
    setIsTransitioning(true);
    
    if (expandedSubCategory === subCategoryId) {
      // Collapse tags if clicking same subcategory
      setIsCollapsingSubCategory(true);
      setPreviousExpandedSubCategory(expandedSubCategory);
      setExpandedSubCategory(null);
      setSelectedTags([]);
      // Reset to just main category
      if (useFirebase) {
        firebaseSetAdvancedFilter(mainCategoryId as CategoryId, null, []);
      } else {
        setAdvancedFilter(mainCategoryId as CategoryId, null, []);
      }
    } else {
      // Expand tags for this subcategory
      setIsCollapsingSubCategory(false);
      setPreviousExpandedSubCategory(expandedSubCategory);
      setExpandedSubCategory(subCategoryId);
      setSelectedSubCategory(subCategoryId);
      setSelectedTags([]);
      // Apply filter with subcategory
      if (useFirebase) {
        firebaseSetAdvancedFilter(mainCategoryId as CategoryId, subCategoryId, []);
      } else {
        setAdvancedFilter(mainCategoryId as CategoryId, subCategoryId, []);
      }
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
      setIsCollapsingSubCategory(false);
      setPreviousExpandedSubCategory(null);
    }, 300);
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    // Apply filter with tags
    if (useFirebase) {
      firebaseSetAdvancedFilter(expandedCategory as CategoryId, selectedSubCategory, newTags);
    } else {
      setAdvancedFilter(expandedCategory as CategoryId, selectedSubCategory, newTags);
    }
  };

  // Get current category data
  const currentCategoryData = expandedCategory 
    ? categoryData.find(cat => cat.id === expandedCategory)
    : null;

  // Get current subcategory data
  const currentSubCategoryData = currentCategoryData && expandedSubCategory
    ? currentCategoryData.subCategories.find(sub => sub.id === expandedSubCategory)
    : null;

  // Build the filter items to display
  const renderFilterItems = () => {
    const items: JSX.Element[] = [];
    
    // Add hamburger menu button if provided
    if (onMenuClick) {
      items.push(
        <button
          key="menu"
          onClick={onMenuClick}
          className="filter-pill filter-pill-inactive flex-shrink-0 min-w-fit"
          aria-label="メニューを開く"
        >
          <Menu className="w-4 h-4" />
        </button>
      );
    }

    // Render categories with inline expansion
    filterCategories.forEach((category, index) => {
      const Icon = category.icon;
      const isActive = expandedCategory === category.id || 
                       (category.id === 'all' && !expandedCategory);
      
      // Check if items after this category should shift
      const shouldShiftRight = !isCollapsing && expandedCategory && 
                               filterCategories.findIndex(c => c.id === expandedCategory) < index;
      const shouldShiftLeft = isCollapsing && previousExpandedCategory &&
                              filterCategories.findIndex(c => c.id === previousExpandedCategory) < index;
      
      // Additional check for tag collapse affecting main categories
      const categoryIndexWithTags = expandedCategory ? filterCategories.findIndex(c => c.id === expandedCategory) : -1;
      const shouldShiftLeftForTagCollapse = isCollapsingSubCategory && 
                                            previousExpandedSubCategory &&
                                            categoryIndexWithTags >= 0 &&
                                            categoryIndexWithTags < index;
      
      // Add main category button
      items.push(
        <button
          key={category.id}
          onClick={() => handleMainCategorySelect(category.id)}
          className={`filter-pill ${isActive ? 'filter-pill-active' : 'filter-pill-inactive'} flex-shrink-0 
                     ${shouldShiftRight && isTransitioning && !isCollapsing ? 'animate-slide-right' : ''}
                     ${shouldShiftLeft && isTransitioning && isCollapsing ? 'animate-slide-left' : ''}
                     ${shouldShiftLeftForTagCollapse && isTransitioning ? 'animate-slide-left' : ''} 
                     transition-all duration-300`}
        >
          <Icon className="w-4 h-4" />
          <span>{category.label}</span>
        </button>
      );
      
      // If this category is expanded, add its subcategories right after it
      if (expandedCategory === category.id && currentCategoryData) {
        currentCategoryData.subCategories.forEach((subCategory, subIndex) => {
          const isSubActive = selectedSubCategory === subCategory.id;
          
          // Check if this subcategory should shift due to tag operations
          const currentSubIndex = currentCategoryData.subCategories.findIndex(sub => sub.id === subCategory.id);
          const expandedSubIndex = expandedSubCategory 
            ? currentCategoryData.subCategories.findIndex(sub => sub.id === expandedSubCategory)
            : -1;
          const previousSubIndex = previousExpandedSubCategory
            ? currentCategoryData.subCategories.findIndex(sub => sub.id === previousExpandedSubCategory)
            : -1;
          
          // This subcategory should shift left if it comes after the collapsing subcategory
          const shouldShiftLeftForCollapse = isCollapsingSubCategory && 
                                             previousSubIndex >= 0 && 
                                             currentSubIndex > previousSubIndex;
          
          // This subcategory should shift right if it comes after the expanding subcategory
          const shouldShiftRightForExpand = !isCollapsingSubCategory && 
                                            previousSubIndex >= 0 &&
                                            previousSubIndex !== expandedSubIndex &&
                                            expandedSubIndex >= 0 &&
                                            currentSubIndex > expandedSubIndex;
          
          // Check if this is the subcategory whose tags are being toggled
          const isThisSubCategoryBeingToggled = (previousExpandedSubCategory === subCategory.id) || (expandedSubCategory === subCategory.id);
          
          // Only apply slide-in when category is being expanded (new subcategories appearing)
          const shouldApplySlideIn = isExpandingCategory && !previousExpandedCategory;
          
          items.push(
            <button
              key={`${category.id}-${subCategory.id}`}
              onClick={() => handleSubCategorySelect(category.id, subCategory.id)}
              className={`filter-pill ${isSubActive ? 'filter-pill-active' : 'filter-pill-inactive'} flex-shrink-0 
                         ${shouldApplySlideIn ? 'animate-slide-in' : ''} 
                         ${isCollapsing ? 'animate-slide-out' : ''}
                         ${shouldShiftLeftForCollapse ? 'animate-slide-left' : ''}
                         ${shouldShiftRightForExpand ? 'animate-slide-right' : ''}
                         transition-all duration-300`}
            >
              <span className="text-sm">{subCategory.name}</span>
            </button>
          );
          
          // If this subcategory is expanded, add its tags right after it
          if (expandedSubCategory === subCategory.id) {
            subCategory.tags.forEach((tag) => {
              const isTagActive = selectedTags.includes(tag);
              
              items.push(
                <button
                  key={`${category.id}-${subCategory.id}-${tag}`}
                  onClick={() => handleTagToggle(tag)}
                  className={`filter-pill ${isTagActive ? 'filter-pill-active' : 'filter-pill-inactive'} flex-shrink-0 
                           ${!isCollapsing && !isCollapsingSubCategory ? 'animate-slide-in' : ''} 
                           ${isCollapsingSubCategory ? 'animate-slide-out' : ''}
                           ${isCollapsing ? 'animate-slide-out' : ''}
                           transition-all duration-300`}
                >
                  <span className="text-xs">{tag}</span>
                </button>
              );
            });
          }
        });
      }
    });
    
    return items;
  };

  return (
    <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
      <div 
        ref={containerRef}
        className="px-4 py-3 overflow-x-auto scrollbar-hide"
      >
        <div className="flex gap-2 min-w-max">
          {renderFilterItems()}
        </div>
      </div>
    </div>
  );
}