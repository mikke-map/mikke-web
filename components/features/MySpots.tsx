'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  List, 
  LayoutGrid, 
  SortAsc,
  SortDesc,
  MoreVertical,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  MapPin,
  Heart,
  Activity,
  Calendar,
  Search,
  Plus,
  Filter
} from 'lucide-react';
import { CategoryId } from '@/types/category';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSpots } from '@/lib/firebase/userStats';
import { deleteSpot, updateSpot } from '@/lib/firebase/spots';
import { FirebaseSpot } from '@/lib/firebase/spots';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { SpotDetailModal } from '@/components/features/SpotDetailModal';
import { useCategoryStore } from '@/stores/categoryStore';
import Image from 'next/image';

// Extended FirebaseSpot type with isPublic field for UI state
interface MySpot extends FirebaseSpot {
  isPublic?: boolean;
}

interface MySpotsSectionProps {
  onBack: () => void;
  onEditSpot?: (spotId: string) => void;
  onCreateSpot?: () => void;
  onMenuClick?: () => void;
}

type SortOption = 'newest' | 'oldest' | 'likes' | 'views' | 'title';
type ViewMode = 'list' | 'grid';

export function MySpots({ onBack, onEditSpot, onCreateSpot, onMenuClick }: MySpotsSectionProps) {
  const { user } = useAuth();
  const { getCategoryById, getSubCategory, initialize } = useCategoryStore();
  const [spots, setSpots] = useState<MySpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDropdownMenu, setShowDropdownMenu] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch user's spots from Firebase
  useEffect(() => {
    const fetchUserSpots = async () => {
      if (!user || !user.uid) {
        setSpots([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userSpots = await getUserSpots(user.uid, 100); // Get up to 100 spots
        // Add isPublic field (default to true for existing spots)
        const spotsWithPublic = userSpots.map(spot => ({
          ...spot,
          isPublic: spot.isActive !== false // Treat active spots as public by default
        }));
        setSpots(spotsWithPublic);
      } catch (error) {
        console.error('Error fetching user spots:', error);
        setSpots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSpots();
  }, [user]);

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

  const getSortedAndFilteredSpots = () => {
    let filtered = spots;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(spot => 
        spot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (spot.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(spot => spot.category.mainCategory === selectedCategory);
    }

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'newest':
        case 'oldest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          if (sortBy === 'newest') comparison = -comparison;
          break;
        case 'likes':
          comparison = a.stats.likesCount - b.stats.likesCount;
          break;
        case 'views':
          comparison = a.stats.viewsCount - b.stats.viewsCount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ja');
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const handleSpotAction = async (action: string, spotId: string) => {
    setShowDropdownMenu(null);
    
    switch (action) {
      case 'edit':
        onEditSpot?.(spotId);
        break;
      case 'toggle-visibility':
        // Update local state immediately for better UX
        setSpots(prev => prev.map(spot => 
          spot.id === spotId 
            ? { ...spot, isPublic: !spot.isPublic }
            : spot
        ));
        // Note: In a production app, you would update this in Firebase
        // For now, this is just a local state change
        break;
      case 'delete':
        setIsDeleting(spotId);
        try {
          // Delete from Firebase
          await deleteSpot(spotId);
          // Update local state
          setSpots(prev => prev.filter(spot => spot.id !== spotId));
        } catch (error) {
          console.error('Error deleting spot:', error);
          // Reset deleting state on error
        } finally {
          setIsDeleting(null);
        }
        break;
    }
  };

  const handleSortChange = (newSortBy: SortOption) => {
    if (newSortBy === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const filteredSpots = getSortedAndFilteredSpots();
  const publicSpotsCount = spots.filter(spot => spot.isPublic).length;
  const privateSpotsCount = spots.filter(spot => !spot.isPublic).length;

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] min-h-screen">
      {/* Header with Hamburger Menu */}
      <ScreenHeader 
        currentScreen="mySpots"
        onMenuClick={onMenuClick || (() => {})}
        onBack={onBack}
        showBackButton={true}
        rightAction={
          <button
            onClick={onCreateSpot}
            className="btn-primary px-3 py-1.5 flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新規投稿</span>
          </button>
        }
      />

      {/* Status Bar */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-light)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-[var(--text-muted)]">総数:</span>
              <span className="font-semibold text-[var(--text-primary)] ml-1">{spots.length}件</span>
            </div>
            <div className="text-sm">
              <span className="text-[var(--text-muted)]">公開:</span>
              <span className="font-semibold text-green-600 ml-1">{publicSpotsCount}件</span>
            </div>
            <div className="text-sm">
              <span className="text-[var(--text-muted)]">非公開:</span>
              <span className="font-semibold text-amber-600 ml-1">{privateSpotsCount}件</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-light)] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="スポットを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
              }`}
              aria-label="リスト表示"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
              }`}
              aria-label="グリッド表示"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {[
            { key: 'newest', label: '新しい順' },
            { key: 'likes', label: 'いいね数' },
            { key: 'views', label: '閲覧数' },
            { key: 'title', label: 'タイトル' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => handleSortChange(option.key as SortOption)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                sortBy === option.key
                  ? 'bg-primary text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-primary-50 hover:text-primary'
              }`}
            >
              <span>{option.label}</span>
              {sortBy === option.key && (
                sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          // Loading State
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--bg-card)] rounded-xl p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2"></div>
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4"></div>
                    <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSpots.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-primary" />
            </div>
            <h3 className="heading-medium mb-3">
              {searchTerm || selectedCategory !== 'all' 
                ? 'スポットが見つかりません' 
                : 'まだスポットがありません'
              }
            </h3>
            <p className="body-small text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? '検索条件を変更してもう一度お試しください'
                : 'あなたの知っている素敵な場所を共有しませんか？'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={onCreateSpot}
                className="btn-primary px-6 py-3"
              >
                初めてのスポットを投稿
              </button>
            )}
          </div>
        ) : (
          // Spots List
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-4'
          }>
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className={`bg-[var(--bg-card)] rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200 overflow-hidden cursor-pointer ${
                  isDeleting === spot.id ? 'opacity-50 scale-95' : ''
                } ${!spot.isPublic ? 'ring-2 ring-amber-200' : ''}`}
                onClick={(e) => {
                  // Don't open detail if clicking on action menu
                  if (!(e.target as HTMLElement).closest('[data-action-menu]')) {
                    setSelectedSpotId(spot.id || null);
                  }
                }}
              >
                {viewMode === 'list' ? (
                  // List View
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex-shrink-0 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-primary-400" />
                        {!spot.isPublic && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <EyeOff className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            {/* Categories as hashtags and privacy status */}
                            <div className="flex items-center gap-1 flex-wrap mb-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                                #{getCategoryLabel(spot.category.mainCategory)}
                              </span>
                              {spot.category.subCategory && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                                  #{getSubCategoryLabel(spot.category.mainCategory, spot.category.subCategory)}
                                </span>
                              )}
                              {spot.category.tags && spot.category.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                                  #{getTagLabel(tag)}
                                </span>
                              ))}
                              {!spot.isPublic && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                  非公開
                                </span>
                              )}
                            </div>
                            <h3 className="heading-small truncate">{spot.title}</h3>
                          </div>
                          
                          {/* Action Menu */}
                          <div className="relative" data-action-menu>
                            <button
                              onClick={() => setShowDropdownMenu(showDropdownMenu === spot.id ? null : (spot.id ?? null))}
                              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                              aria-label="アクション"
                            >
                              <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                            
                            {showDropdownMenu === spot.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => spot.id && handleSpotAction('edit', spot.id)}
                                  className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                  <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                                  <span>編集</span>
                                </button>
                                <button
                                  onClick={() => spot.id && handleSpotAction('toggle-visibility', spot.id)}
                                  className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                                >
                                  {spot.isPublic ? (
                                    <>
                                      <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
                                      <span>非公開にする</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                                      <span>公開する</span>
                                    </>
                                  )}
                                </button>
                                <hr className="border-[var(--border-light)]" />
                                <button
                                  onClick={() => spot.id && handleSpotAction('delete', spot.id)}
                                  className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-red-50 text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>削除</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="body-small text-[var(--text-muted)] line-clamp-2 mb-3">
                          {spot.description || 'スポットの説明はありません'}
                        </p>
                        
                        {/* Stats and Date */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center text-[var(--text-muted)]">
                              <Heart className="w-4 h-4 mr-1.5" />
                              {spot.stats.likesCount}
                            </span>
                            <span className="flex items-center text-[var(--text-muted)]">
                              <Activity className="w-4 h-4 mr-1.5" />
                              {spot.stats.viewsCount}
                            </span>
                          </div>
                          <div className="flex items-center text-[var(--text-muted)]">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>
                              {spot.createdAt ? new Intl.DateTimeFormat('ja-JP', {
                                month: 'short',
                                day: 'numeric'
                              }).format(spot.createdAt instanceof Date ? spot.createdAt : spot.createdAt.toDate()) : '--'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Grid View
                  <div>
                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-primary-400" />
                      {/* Remove category overlay from grid view image */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {!spot.isPublic && (
                          <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            非公開
                          </span>
                        )}
                        <div className="relative" data-action-menu>
                          <button
                            onClick={() => setShowDropdownMenu(showDropdownMenu === spot.id ? null : (spot.id ?? null))}
                            className="p-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
                            aria-label="アクション"
                          >
                            <MoreVertical className="w-4 h-4 text-white" />
                          </button>
                          
                          {showDropdownMenu === spot.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => spot.id && handleSpotAction('edit', spot.id)}
                                className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                              >
                                <Edit className="w-4 h-4 text-[var(--text-muted)]" />
                                <span>編集</span>
                              </button>
                              <button
                                onClick={() => spot.id && handleSpotAction('toggle-visibility', spot.id)}
                                className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                              >
                                {spot.isPublic ? (
                                  <>
                                    <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span>非公開にする</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                                    <span>公開する</span>
                                  </>
                                )}
                              </button>
                              <hr className="border-[var(--border-light)]" />
                              <button
                                onClick={() => spot.id && handleSpotAction('delete', spot.id)}
                                className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-red-50 text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>削除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4">
                      <h3 className="heading-small mb-2 line-clamp-2">{spot.title}</h3>
                      
                      {/* Categories as hashtags */}
                      <div className="flex items-center gap-1 flex-wrap mb-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                          #{getCategoryLabel(spot.category.mainCategory)}
                        </span>
                        {spot.category.subCategory && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                            #{spot.category.subCategory}
                          </span>
                        )}
                        {spot.category.tags && spot.category.tags.slice(0, 1).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                            #{getTagLabel(tag)}
                          </span>
                        ))}
                      </div>
                      <p className="body-small text-[var(--text-muted)] line-clamp-2 mb-3">
                        {spot.description || 'スポットの説明はありません'}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)]">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center caption text-[var(--text-muted)]">
                            <Heart className="w-4 h-4 mr-1.5" />
                            {spot.stats.likesCount}
                          </span>
                          <span className="flex items-center caption text-[var(--text-muted)]">
                            <Activity className="w-4 h-4 mr-1.5" />
                            {spot.stats.viewsCount}
                          </span>
                        </div>
                        <div className="flex items-center caption text-[var(--text-muted)]">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          <span>
                            {spot.createdAt ? new Intl.DateTimeFormat('ja-JP', {
                              month: 'short',
                              day: 'numeric'
                            }).format(spot.createdAt instanceof Date ? spot.createdAt : spot.createdAt.toDate()) : '--'}
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

      {/* Click outside to close dropdown */}
      {showDropdownMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdownMenu(null)}
        />
      )}

      {/* Spot Detail Modal */}
      {selectedSpotId && (
        <SpotDetailModal 
          spotId={selectedSpotId}
          onClose={() => setSelectedSpotId(null)}
        />
      )}
    </div>
  );
}