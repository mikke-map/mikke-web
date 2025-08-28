'use client';

import { List, LayoutGrid, MapPin, ThumbsUp, Eye, Clock, Image as ImageIcon, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Spot, SpotCategory, useSpotStore } from '@/stores/spotStore';
import { useCategoryStore } from '@/stores/categoryStore';
import Image from 'next/image';

interface SpotListProps {
  spots: Spot[];
  onSpotClick: (spotId: string) => void;
}

type SheetState = 'collapsed' | 'expanded';

export function SpotList({ spots, onSpotClick }: SpotListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const { currentFilter } = useSpotStore();
  const { getCategoryById, getSubCategory, initialize } = useCategoryStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sheet height mappings
  const getSheetHeight = (state: SheetState): string => {
    switch (state) {
      case 'collapsed':
        return '35vh';
      case 'expanded':
        return '80vh';
      default:
        return '35vh';
    }
  };

  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setDragStartY(clientY);
    setCurrentY(0);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    const deltaY = dragStartY - clientY;
    setCurrentY(deltaY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Determine next state based on drag distance
    const threshold = 50; // pixels
    
    if (currentY > threshold) {
      // Dragged up - expand
      setSheetState('expanded');
    } else if (currentY < -threshold) {
      // Dragged down - collapse
      setSheetState('collapsed');
    }
    
    setCurrentY(0);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, currentY, sheetState]);

  // Remove click handler - only drag is allowed

  // Filter spots based on current filter
  const filteredSpots = currentFilter === 'all' 
    ? spots 
    : spots.filter(spot => spot.category.mainCategory === currentFilter);

  const getCategoryLabel = (category: string) => {
    const categoryData = getCategoryById(category);
    return categoryData?.displayName || category;
  };

  const getSubCategoryLabel = (categoryId: string, subCategoryId: string) => {
    const data = getSubCategory(categoryId, subCategoryId);
    return data?.subCategory?.name || subCategoryId;
  };

  const getTagLabel = (tag: string) => {
    // タグはそのまま日本語で保存されているのでそのまま返す
    return tag;
  };

  return (
    <section 
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col bg-[var(--bg-card)] rounded-t-3xl shadow-2xl border-t border-[var(--border-light)] transition-all duration-300 ease-out"
      style={{ 
        height: getSheetHeight(sheetState),
        transform: isDragging ? `translateY(${-currentY}px)` : 'translateY(0)',
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Drag Handle */}
      <div 
        className="flex flex-col items-center justify-center py-3 cursor-grab touch-none select-none hover:bg-[var(--bg-tertiary)] transition-colors"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="w-14 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full mb-1.5" />
      </div>
      
      {/* Header Section */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-light)] px-4 pb-3 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="heading-medium">近くのスポット</h2>
              <p className="caption mt-0.5">
                {filteredSpots.length}件のスポットが見つかりました
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="リスト表示"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="グリッド表示"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filteredSpots.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="heading-small mb-2">スポットが見つかりません</h3>
            <p className="body-small text-[var(--text-muted)]">
              フィルターを変更して再度お試しください
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-3' 
            : 'space-y-3'
          }>
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => onSpotClick(spot.id)}
                className="group cursor-pointer bg-[var(--bg-card)] rounded-xl border border-[var(--border-light)] 
                           transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-0.5 
                           active:scale-[0.98] animate-fade-in"
              >
                {viewMode === 'grid' ? (
                  // Grid View - Keep some vertical layout for grid cards
                  <>
                    {/* Compact Image Section for Grid */}
                    <div className="relative h-32 -m-4 mb-3 rounded-t-xl overflow-hidden bg-neutral-200">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                      {spot.images && spot.images.length > 0 ? (
                        <Image
                          src={spot.images[0]}
                          alt={spot.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-primary-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Grid Content */}
                    <div className="p-4 pt-1 space-y-2">
                      <div>
                        <h3 className="heading-small group-hover:text-primary transition-colors line-clamp-1">
                          {spot.title}
                        </h3>
                      </div>
                      
                      {/* Categories as hashtags */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-[10px] font-medium">
                          #{getCategoryLabel(spot.category.mainCategory)}
                        </span>
                        {spot.category.subCategory && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-[10px] font-medium">
                            #{getSubCategoryLabel(spot.category.mainCategory, spot.category.subCategory)}
                          </span>
                        )}
                        {spot.category.tags && spot.category.tags.slice(0, 1).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-[10px] font-medium">
                            #{getTagLabel(tag)}
                          </span>
                        ))}
                      </div>
                      
                      {spot.description && (
                        <p className="body-small text-[var(--text-muted)] line-clamp-1">
                          {spot.description}
                        </p>
                      )}
                      
                      {/* Compact Stats for Grid */}
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {spot.stats.likesCount}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {spot.stats.viewsCount}
                          </span>
                        </div>
                        <span className="flex items-center truncate max-w-[80px]">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          {spot.location.address?.split(',')[0] || '住所なし'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View - Horizontal compact layout
                  <div className="flex items-center p-4 gap-4">
                    {/* Compact Thumbnail */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-200">
                      {spot.images && spot.images.length > 0 ? (
                        <Image
                          src={spot.images[0]}
                          alt={spot.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Title Row */}
                      <div className="flex items-start justify-between">
                        <h3 className="heading-small group-hover:text-primary transition-colors line-clamp-1 flex-1 pr-2">
                          {spot.title}
                        </h3>
                        {spot.images && spot.images.length > 1 && (
                          <span className="flex items-center caption text-[var(--text-muted)] flex-shrink-0">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {spot.images.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Categories as hashtags */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-[10px] font-medium">
                          #{getCategoryLabel(spot.category.mainCategory)}
                        </span>
                        {spot.category.subCategory && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-[10px] font-medium">
                            #{getSubCategoryLabel(spot.category.mainCategory, spot.category.subCategory)}
                          </span>
                        )}
                        {spot.category.tags && spot.category.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-[10px] font-medium">
                            #{getTagLabel(tag)}
                          </span>
                        ))}
                      </div>
                      
                      {/* Description */}
                      {spot.description && (
                        <p className="body-small text-[var(--text-muted)] line-clamp-1">
                          {spot.description}
                        </p>
                      )}
                      
                      {/* Stats and Location Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center caption text-[var(--text-muted)]">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {spot.stats.likesCount}
                          </span>
                          <span className="flex items-center caption text-[var(--text-muted)]">
                            <Eye className="w-3 h-3 mr-1" />
                            {spot.stats.viewsCount}
                          </span>
                        </div>
                        <div className="flex items-center caption text-[var(--text-muted)] max-w-[120px]">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {spot.location.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}