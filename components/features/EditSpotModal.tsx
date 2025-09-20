'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Upload, Loader2, Check } from 'lucide-react';
import { CategorySelector } from '@/components/features/CategorySelector';
import { updateSpot, getSpotById } from '@/lib/firebase/spots';
import { FirebaseSpot } from '@/lib/firebase/spots';
import { CategoryId } from '@/types/category';
import { useAuth } from '@/contexts/AuthContext';

interface EditSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotId: string;
  onUpdate?: () => void;
}

export function EditSpotModal({
  isOpen,
  onClose,
  spotId,
  onUpdate
}: EditSpotModalProps) {
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('park_outdoor');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [spotName, setSpotName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    address: undefined as string | undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalSpot, setOriginalSpot] = useState<FirebaseSpot | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load spot data when modal opens
  useEffect(() => {
    const loadSpotData = async () => {
      setIsLoading(true);
      try {
        const spot = await getSpotById(spotId);
        if (spot) {
          setOriginalSpot(spot);
          setSpotName(spot.title);
          setDescription(spot.description || '');
          setSelectedCategory(spot.category.mainCategory as CategoryId);
          setSelectedSubCategory(spot.category.subCategory);
          setSelectedTags(spot.category.tags || []);
          setLocation({
            latitude: spot.location.latitude,
            longitude: spot.location.longitude,
            address: spot.location.address
          });
        }
      } catch (error) {
        console.error('Failed to load spot data:', error);
        alert('スポット情報の読み込みに失敗しました');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && spotId) {
      loadSpotData();
    }
  }, [isOpen, spotId, onClose]);

  const canSubmit = spotName.trim() && location.latitude !== 0 && location.longitude !== 0;

  const handleGetLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Try to get address using reverse geocoding
          let address = undefined;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ja`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                address = data.results[0].formatted_address;
              }
            }
          } catch (error) {
            console.error('Failed to get address:', error);
          }

          setLocation({
            latitude: lat,
            longitude: lng,
            address: address,
          });
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
    if (!canSubmit || !originalSpot) return;

    setIsSubmitting(true);
    try {
      // Build category object
      const categoryData: any = {
        mainCategory: selectedCategory,
      };
      if (selectedSubCategory) {
        categoryData.subCategory = selectedSubCategory;
      }
      if (selectedTags.length > 0) {
        categoryData.tags = selectedTags;
      }

      // Build updates object
      const updates: Partial<FirebaseSpot> = {
        title: spotName,
        description: description || '',
        category: categoryData,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address || '未設定',
        },
      };

      // Update spot in Firebase
      await updateSpot(spotId, updates);

      // Show success message
      setShowSuccess(true);

      // Call update callback if provided
      if (onUpdate) {
        onUpdate();
      }

      // Close modal after a short delay
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Failed to update spot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('スポットの更新に失敗しました: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-[var(--text-primary)]">スポット情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-[var(--text-primary)] font-semibold">更新が完了しました！</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">スポットを編集</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Spot Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              スポット名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="例: ○○公園"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              カテゴリー <span className="text-red-500">*</span>
            </label>
            <CategorySelector
              value={selectedCategory}
              onChange={(categoryId, subCategoryId, tags) => {
                setSelectedCategory(categoryId);
                setSelectedSubCategory(subCategoryId);
                setSelectedTags(tags || []);
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="このスポットの特徴や魅力を教えてください"
              rows={3}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              場所 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <button
                onClick={handleGetLocation}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                現在地を更新
              </button>
              {location.latitude !== 0 && location.longitude !== 0 && (
                <div className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
                  <p className="font-medium mb-1">設定された位置:</p>
                  <p>{location.address || `緯度: ${location.latitude.toFixed(6)}, 経度: ${location.longitude.toFixed(6)}`}</p>
                </div>
              )}
            </div>
          </div>

          {/* Note about images */}
          <div className="px-3 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium">注意:</p>
            <p>現在、画像の編集はサポートされていません。画像を変更する場合は、新しいスポットとして追加してください。</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                更新中...
              </>
            ) : (
              '編集完了'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}