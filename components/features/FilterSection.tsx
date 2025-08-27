'use client';

import { useState } from 'react';
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
  Menu
} from 'lucide-react';
import { useSpotStore } from '@/stores/spotStore';
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

export function FilterSection({ onMenuClick }: FilterSectionProps) {
  const { currentFilter, setFilter } = useSpotStore();

  return (
    <section className="bg-[var(--bg-card)] border-b border-[var(--border-light)] FilterSection">
      <div className="px-6 py-4">
        <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-1">
          {/* Hamburger Menu Button */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="filter-pill filter-pill-inactive flex-shrink-0 min-w-fit"
              aria-label="メニューを開く"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          
          {filterCategories.map((category) => {
            const Icon = category.icon;
            const isActive = currentFilter === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`filter-pill ${isActive ? 'filter-pill-active' : 'filter-pill-inactive'} flex-shrink-0`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}