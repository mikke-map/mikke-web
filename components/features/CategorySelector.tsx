'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { Category, CategoryId, CATEGORY_EMOJI_ICONS } from '@/types/category';
import { useCategoryStore } from '@/stores/categoryStore';

interface CategorySelectorProps {
  value: CategoryId;
  onChange: (category: CategoryId, subCategoryId?: string, tags?: string[]) => void;
  mode?: 'grid' | 'list';
}

export function CategorySelector({ value, onChange, mode = 'grid' }: CategorySelectorProps) {
  const { categories, initialize } = useCategoryStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(value);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSubCategories, setShowSubCategories] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleCategorySelect = (categoryId: CategoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    setSelectedCategoryId(categoryId);
    
    // サブカテゴリがある場合は表示
    if (category.subCategories.length > 0) {
      setShowSubCategories(true);
    } else {
      // サブカテゴリがない場合は直接選択
      onChange(categoryId);
      setShowSubCategories(false);
    }
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    if (!selectedCategoryId) return;
    
    setSelectedSubCategoryId(subCategoryId);
    onChange(selectedCategoryId, subCategoryId, selectedTags);
    
    // サブカテゴリのタグを取得
    const category = categories.find(c => c.id === selectedCategoryId);
    const subCategory = category?.subCategories.find(s => s.id === subCategoryId);
    if (subCategory?.tags && subCategory.tags.length > 0) {
      // タグがある場合は表示（将来の実装用）
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    
    if (selectedCategoryId && selectedSubCategoryId) {
      onChange(selectedCategoryId, selectedSubCategoryId, newTags);
    }
  };

  if (mode === 'list') {
    return (
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id as CategoryId)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedCategoryId === category.id
                ? 'border-primary bg-primary-50'
                : 'border-[var(--border-color)] hover:border-primary-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{CATEGORY_EMOJI_ICONS[category.id as CategoryId]}</span>
                <span className="font-medium">{category.displayName}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* メインカテゴリグリッド */}
      {!showSubCategories && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id as CategoryId)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                value === category.id
                  ? 'border-primary bg-primary-50 text-primary shadow-soft'
                  : 'border-[var(--border-color)] hover:border-primary-300 hover:bg-primary-25 hover:shadow-soft'
              }`}
            >
              <span className="text-2xl mb-2">{CATEGORY_EMOJI_ICONS[category.id as CategoryId]}</span>
              <span className="caption font-medium text-center leading-tight">{category.displayName}</span>
            </button>
          ))}
        </div>
      )}

      {/* サブカテゴリ選択 */}
      {showSubCategories && selectedCategoryId && (
        <div className="mt-4">
          <button
            onClick={() => {
              setShowSubCategories(false);
              setSelectedCategoryId(null);
              setSelectedSubCategoryId(null);
            }}
            className="mb-4 text-sm text-primary hover:underline flex items-center"
          >
            ← カテゴリに戻る
          </button>
          
          <div className="mb-3">
            <h4 className="font-medium text-[var(--text-secondary)]">
              {categories.find(c => c.id === selectedCategoryId)?.displayName} のサブカテゴリ
            </h4>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories
              .find(c => c.id === selectedCategoryId)
              ?.subCategories.map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={() => handleSubCategorySelect(subCategory.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedSubCategoryId === subCategory.id
                      ? 'border-primary bg-primary-50 text-primary shadow-soft'
                      : 'border-[var(--border-color)] hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{subCategory.name}</span>
                    {selectedSubCategoryId === subCategory.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
          </div>

          {/* タグ選択（選択されたサブカテゴリにタグがある場合） */}
          {selectedSubCategoryId && (() => {
            const category = categories.find(c => c.id === selectedCategoryId);
            const subCategory = category?.subCategories.find(s => s.id === selectedSubCategoryId);
            if (!subCategory?.tags.length) return null;

            return (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-[var(--text-secondary)] mb-2">タグ（任意）</h4>
                <div className="flex flex-wrap gap-2">
                  {subCategory.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-[var(--bg-tertiary)] hover:bg-primary-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}