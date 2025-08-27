'use client';

import { useState, useEffect } from 'react';
import { X, Check, Camera, Image as ImageIcon, MapPin } from 'lucide-react';
import { useSpotStore, SpotCategory } from '@/stores/spotStore';
import { createSpot } from '@/lib/firebase/spots';
import { uploadSpotImages } from '@/lib/firebase/storage';
import { CategorySelector } from './CategorySelector';
import { ImageUpload } from './ImageUpload';
import { CategoryId } from '@/types/category';
import { useBadges } from '@/contexts/BadgeContext';
import { useAuth } from '@/contexts/AuthContext';

interface AddSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number; address?: string };
  useFirebase?: boolean;
}

export function AddSpotModal({ 
  isOpen, 
  onClose, 
  initialLocation,
  useFirebase = false 
}: AddSpotModalProps) {
  const { addSpot: addMockSpot } = useSpotStore();
  const { user } = useAuth();
  const { checkForNewBadge } = useBadges();
  
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('park_outdoor');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [spotName, setSpotName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(
    initialLocation 
      ? { latitude: initialLocation.lat, longitude: initialLocation.lng, address: initialLocation.address }
      : { latitude: 0, longitude: 0, address: undefined }
  );
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationSource, setShowLocationSource] = useState(false);

  // Update location when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setLocation({
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
        address: initialLocation.address
      });
      setShowLocationSource(true);
      // Hide the source indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowLocationSource(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [initialLocation]);

  const canSubmit = spotName.trim() && location.latitude !== 0 && location.longitude !== 0;

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: undefined,
          });
          alert('現在地を取得しました！');
        },
        (error) => {
          console.error('Failed to get location:', error);
          alert('現在地の取得に失敗しました。ブラウザの位置情報設定を確認してください。');
        }
      );
    } else {
      alert('お使いのブラウザは位置情報に対応していません。');
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      
      // Upload images if any are selected
      if (selectedImages.length > 0 && useFirebase) {
        // Create a temporary spot ID for organizing images
        const tempSpotId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          imageUrls = await uploadSpotImages(selectedImages, tempSpotId);
        } catch (error) {
          console.error('Failed to upload images:', error);
          alert('画像のアップロードに失敗しました。画像なしで続行しますか？');
          // Continue without images if upload fails
        }
      }
      
      // Build category object without undefined fields
      const categoryData: any = {
        mainCategory: selectedCategory,
      };
      if (selectedSubCategory) {
        categoryData.subCategory = selectedSubCategory;
      }
      if (selectedTags.length > 0) {
        categoryData.tags = selectedTags;
      }

      // Build author object without undefined fields
      const authorData: any = {
        displayName: user?.displayName || 'ゲストユーザー',
      };
      if (user?.photoURL) {
        authorData.photoURL = user.photoURL;
      }

      // Build spot data object without undefined fields
      const spotData: any = {
        title: spotName,
        description: description || '',
        category: categoryData as SpotCategory,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || '未設定',
        },
        userId: user?.uid || 'anonymous',
        author: authorData,
      };
      
      // Only add images if there are any
      if (imageUrls.length > 0) {
        spotData.images = imageUrls;
      }

      if (useFirebase) {
        // Use Firebase to create spot directly
        const spotId = await createSpot(spotData);
        
        // Check for badge after successful spot creation
        if (user?.uid) {
          await checkForNewBadge(selectedCategory);
        }
      } else {
        // Use mock store
        await addMockSpot(spotData);
      }
      
      // Reset form
      setSelectedImages([]);
      setSpotName('');
      setDescription('');
      setSelectedCategory('park_outdoor');
      setSelectedSubCategory(undefined);
      setSelectedTags([]);
      
      onClose();
      // Remove alert since we'll show badge celebration if earned
      if (!user?.uid || !useFirebase) {
        alert('スポットを追加しました！');
      }
    } catch (error) {
      console.error('Failed to add spot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('スポットの追加に失敗しました: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-light)]">
          <button
            onClick={onClose}
            className="btn-ghost p-2"
          >
            <X className="w-6 h-6" />
            <span className="sr-only">キャンセル</span>
          </button>
          <h2 className="heading-medium">
            スポットを追加
          </h2>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`btn-primary flex items-center space-x-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner w-4 h-4" />
                <span>追加中...</span>
              </>
            ) : (
              <>
                <span>追加</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Location notification */}
          {showLocationSource && initialLocation && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
              <p className="body-small text-primary flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">地図上で選択した場所が設定されています</span>
              </p>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <h3 className="heading-small mb-4">
              カテゴリー選択 <span className="text-primary">*</span>
            </h3>
            
            <CategorySelector
              value={selectedCategory}
              onChange={(category, subCategoryId, tags) => {
                setSelectedCategory(category);
                setSelectedSubCategory(subCategoryId);
                setSelectedTags(tags || []);
              }}
            />
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="heading-small mb-4">
              基本情報
            </h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="spot-name" className="block body-small font-medium text-[var(--text-secondary)] mb-2">
                  スポット名 <span className="text-primary">*</span>
                </label>
                <input
                  id="spot-name"
                  type="text"
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                  className="input-field"
                  placeholder="スポット名を入力してください"
                  maxLength={50}
                />
                <p className="caption mt-1 text-[var(--text-muted)]">
                  {50 - spotName.length}文字残っています
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="block body-small font-medium text-[var(--text-secondary)] mb-2">
                  説明
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea-field"
                  placeholder="スポットの詳細を入力してください"
                  rows={4}
                  maxLength={500}
                />
                <p className="caption mt-1 text-[var(--text-muted)] text-right">
                  {description.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <h3 className="heading-small mb-4">
              写真
            </h3>
            <ImageUpload 
              onImagesChange={setSelectedImages}
              maxImages={5}
            />
          </div>

          {/* Location */}
          <div>
            <h3 className="heading-small mb-4">
              位置情報 <span className="text-primary">*</span>
            </h3>
            <div className="bg-[var(--bg-tertiary)] rounded-xl p-6">
              {location ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-card)] rounded-lg p-3">
                      <p className="caption text-[var(--text-muted)] mb-1">緯度</p>
                      <p className="body-small font-mono text-[var(--text-primary)]">
                        {location.latitude.toFixed(6)}
                      </p>
                    </div>
                    <div className="bg-[var(--bg-card)] rounded-lg p-3">
                      <p className="caption text-[var(--text-muted)] mb-1">経度</p>
                      <p className="body-small font-mono text-[var(--text-primary)]">
                        {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  {location.address && (
                    <div className="bg-[var(--bg-card)] rounded-lg p-3">
                      <p className="caption text-[var(--text-muted)] mb-1">位置</p>
                      <p className="body-small text-[var(--text-primary)]">
                        {location.address}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="body-small text-[var(--text-muted)] mb-4">
                    位置情報が設定されていません
                  </p>
                  <button
                    onClick={handleGetLocation}
                    className="btn-primary mx-auto"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    現在地を取得
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}