// 新しいカテゴリシステムの型定義
// サブカテゴリとタグをサポート

export interface CategoryColor {
  red: number;
  green: number;
  blue: number;
  hex: string;
}

export interface SubCategory {
  id: string;
  name: string;
  tags: string[];
}

export interface Category {
  id: string;
  displayName: string;
  icon: string;
  color: CategoryColor;
  subCategories: SubCategory[];
}

export interface ItemStatus {
  id: string;
  displayName: string;
}

// 新しいカテゴリIDの型（メインカテゴリのみ）
export type CategoryId =
  | 'park_outdoor'
  | 'family'
  | 'entertainment'
  | 'food_drink'
  | 'shopping'
  | 'tourism'
  | 'vending_machine'
  | 'pet'
  | 'public_facility'
  | 'transportation'
  | 'trash_can'
  | 'others';

// カテゴリデータをロードする関数
export async function loadCategoryData(): Promise<{ categories: Category[]; itemStatus: ItemStatus[] }> {
  const response = await fetch('/command/categories.json');
  const data = await response.json();
  return data;
}

// 絵文字アイコンへのマッピング（UIで使用）
export const CATEGORY_EMOJI_ICONS: Record<CategoryId, string> = {
  'park_outdoor': '🌳',
  'family': '👨‍👩‍👧‍👦',
  'entertainment': '🎮',
  'food_drink': '🍽️',
  'shopping': '🛍️',
  'tourism': '📸',
  'vending_machine': '🥤',
  'pet': '🐕',
  'public_facility': '🏢',
  'transportation': '🚗',
  'trash_can': '🗑️',
  'others': '✨'
};