'use client';

import { useEffect, useState } from 'react';
import { X, MoreVertical, ThumbsUp, ThumbsDown, Eye, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spot, useSpotStore } from '@/stores/spotStore';
import { useFirebaseSpotStore } from '@/stores/firebaseSpotStore';
import { getSpotById } from '@/lib/firebase/spots';
import { useCategoryStore } from '@/stores/categoryStore';
import Image from 'next/image';

interface SpotDetailModalProps {
  spotId: string;
  onClose: () => void;
}

export function SpotDetailModal({ spotId, onClose }: SpotDetailModalProps) {
  const { spots: mockSpots } = useSpotStore();
  const { spots: firebaseSpots } = useFirebaseSpotStore();
  const { getCategoryById, getSubCategory, initialize } = useCategoryStore();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [userRating, setUserRating] = useState<'like' | 'dislike' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const loadSpot = async () => {
      setIsLoading(true);
      
      // First try to find in Firebase spots
      let foundSpot = firebaseSpots.find(s => s.id === spotId);
      
      // If not found in Firebase spots, try mock spots
      if (!foundSpot) {
        foundSpot = mockSpots.find(s => s.id === spotId);
      }
      
      // If still not found and we have Firebase, try fetching directly
      if (!foundSpot && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        try {
          const firebaseSpot = await getSpotById(spotId);
          if (firebaseSpot) {
            foundSpot = {
              ...firebaseSpot,
              id: firebaseSpot.id!,
              createdAt: firebaseSpot.createdAt instanceof Date ? firebaseSpot.createdAt : new Date(),
              updatedAt: firebaseSpot.updatedAt instanceof Date ? firebaseSpot.updatedAt : new Date(),
            };
          }
        } catch (error) {
          console.error('Error fetching spot:', error);
        }
      }
      
      if (foundSpot && foundSpot.id) {
        setSpot(foundSpot as Spot);
        // Increment view count (in real app, this would be an API call)
        if (foundSpot.stats) {
          foundSpot.stats.viewsCount++;
        }
      }
      
      setIsLoading(false);
    };
    
    loadSpot();
  }, [spotId, mockSpots, firebaseSpots]);

  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!spot) {
    return null;
  }

  const handleRating = (type: 'like' | 'dislike') => {
    if (userRating === type) {
      // Remove rating
      setUserRating(null);
      if (type === 'like') {
        spot.stats.likesCount--;
      } else {
        spot.stats.dislikesCount--;
      }
    } else {
      // Add or change rating
      if (userRating === 'like') {
        spot.stats.likesCount--;
      } else if (userRating === 'dislike') {
        spot.stats.dislikesCount--;
      }
      
      setUserRating(type);
      if (type === 'like') {
        spot.stats.likesCount++;
      } else {
        spot.stats.dislikesCount++;
      }
    }
    // In real app, this would be an API call
  };

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
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
            <span className="sr-only">閉じる</span>
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <MoreVertical className="w-6 h-6" />
            <span className="sr-only">メニュー</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image display */}
          <div className="h-48 relative">
            {spot.images && spot.images.length > 0 ? (
              <>
                <Image
                  src={spot.images[currentImageIndex]}
                  alt={`${spot.title} - 写真 ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 512px"
                />
                {/* Image navigation arrows */}
                {spot.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : spot.images!.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                      aria-label="前の画像"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev < spot.images!.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors"
                      aria-label="次の画像"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      {currentImageIndex + 1} / {spot.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="h-full bg-gradient-to-br from-green-400 to-blue-500 opacity-30 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Spot Information */}
          <div className="p-4 space-y-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {spot.title}
              </h1>
              {/* Categories as hashtags */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                  #{getCategoryLabel(spot.category.mainCategory)}
                </span>
                {spot.category.subCategory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                    #{getSubCategoryLabel(spot.category.mainCategory, spot.category.subCategory)}
                  </span>
                )}
                {spot.category.tags && spot.category.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary text-xs font-medium">
                    #{getTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>

            {spot.description && (
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  {spot.description}
                </p>
              </div>
            )}


            {/* Rating Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                評価
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleRating('like')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userRating === 'like'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>{spot.stats.likesCount}</span>
                </button>
                
                <button
                  onClick={() => handleRating('dislike')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    userRating === 'dislike'
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>{spot.stats.dislikesCount}</span>
                </button>
                
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <Eye className="w-5 h-5" />
                  <span>{spot.stats.viewsCount}</span>
                </div>
              </div>
            </div>

            {/* Location Coordinates */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                位置情報
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">緯度:</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {spot.location.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">経度:</span>
                  <span className="text-gray-900 dark:text-white font-mono">
                    {spot.location.longitude.toFixed(6)}
                  </span>
                </div>
                {spot.location.address && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {spot.location.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Author info */}
            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {spot.author.displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(spot.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}