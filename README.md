# Mikke (見っけ！) - マップベースのスポット発見プラットフォーム

<p align="center">
  <img src="public/icon-512x512.png" alt="Mikke Logo" width="120" height="120">
</p>

<p align="center">
  <strong>みんなでつくる、スポット発見の新体験 🗾✨</strong>
</p>

<p align="center">
  <a href="#主な機能">主な機能</a> •
  <a href="#技術スタック">技術スタック</a> •
  <a href="#はじめに">はじめに</a> •
  <a href="#開発">開発</a> •
  <a href="#アーキテクチャ">アーキテクチャ</a> •
  <a href="#デプロイ">デプロイ</a>
</p>

---

## 🌟 概要

**Mikke (見っけ！)** は、ユーザーが地域の様々なスポットを発見・共有・評価できる最新のマップベースWebアプリケーションです。Next.jsとFirebaseで構築され、Progressive Web App（PWA）機能によってすべてのデバイスでネイティブアプリのような体験を提供します。

## ✨ 主な機能

### コア機能
- **🗺️ インタラクティブマップ** - Google Mapsとカスタムマーカー、クラスタリング機能
- **📍 長押しでスポット作成** - 地図を長押しして簡単にスポット登録（デスクトップ/モバイル対応）
- **🏷️ スマートなカテゴリー分類** - 11のメインカテゴリーとサブカテゴリー、タグ機能
- **🔍 高度なフィルタリング** - カテゴリー、検索、地図範囲でフィルター
- **📊 リアルタイム更新** - Firebase連携によるリアルタイムデータ同期

### ユーザー機能
- **👤 認証システム** - Google OAuthと匿名ログインサポート
- **🏆 ランキングシステム** - ユーザーの投稿数による動的ランキング
- **📈 ユーザー統計** - 投稿数、いいね数、閲覧数、実績の追跡
- **🎖️ 実績バッジ** - 投稿レベルに応じたバッジ獲得
- **📝 スポット管理** - ユーザー作成スポットの完全なCRUD操作

### デザイン＆体験
- **🎨 テラコッタデザインシステム** - 温かみのある配色とカスタムテーマ
- **🌓 ダークモード対応** - 自動・手動のテーマ切り替え
- **📱 PWA機能** - ネイティブアプリとしてインストール可能、オフライン対応、プッシュ通知対応
- **♿ アクセシビリティ** - WCAG 2.1 AA準拠、キーボード操作完全対応
- **📱 レスポンシブデザイン** - モバイルからデスクトップまで全デバイス最適化

### 開発段階機能
- **🔔 ウェルカムモーダル** - 新規ユーザー向けの開発段階通知（一度だけ表示）
- **🚧 モックモードフォールバック** - Firebase無しでも動作（開発/テスト用）

## 🚀 技術スタック

### フロントエンド
- **[Next.js 14](https://nextjs.org/)** - App RouterのReactフレームワーク
- **[React 18](https://react.dev/)** - UIライブラリ
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全なJavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - ユーティリティファーストのCSSフレームワーク

### 状態管理＆データ
- **[Zustand](https://zustand-demo.pmnd.rs/)** - 軽量な状態管理
- **[React Hook Form](https://react-hook-form.com/)** - 高性能フォームとバリデーション
- **[Zod](https://zod.dev/)** - TypeScriptファーストのスキーマ検証

### バックエンド＆サービス
- **[Firebase](https://firebase.google.com/)**
  - Firestore - NoSQLデータベース
  - Authentication - ユーザー管理
  - Storage - 画像ホスティング
- **[Google Maps JavaScript API](https://developers.google.com/maps)** - 地図サービス

### UIコンポーネント＆スタイリング
- **[Lucide React](https://lucide.dev/)** - 美しいアイコンセット
- **[Framer Motion](https://www.framer.com/motion/)** - アニメーションライブラリ
- **[@headlessui/react](https://headlessui.com/)** - スタイルなしUIコンポーネント
- **[Radix UI](https://www.radix-ui.com/)** - 低レベルUIプリミティブ

### PWA＆パフォーマンス
- **[@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)** - Next.js用PWAサポート
- **Service Worker** - オフライン機能とキャッシング

### 開発ツール
- **[ESLint](https://eslint.org/)** - コード検証
- **[Prettier](https://prettier.io/)** - コードフォーマッター
- **[Jest](https://jestjs.io/)** - テストフレームワーク
- **[Testing Library](https://testing-library.com/)** - テストユーティリティ

## 🎨 デザインシステム

### カラーパレット

アプリは温かみのあるテラコッタベースのデザインシステムを採用：

```scss
// プライマリカラー
テラコッタ: #823D2C (主要ブランドカラー)
背景: #F9F2EF (温かみのあるピーチベージュ)

// セマンティックカラー
Success: ポジティブアクション用の緑
Error: エラーと警告用の赤
Info: 情報要素用の青

// ダークモード
テラコッタの本質を保った温かみのあるダークブラウン
```

### タイポグラフィ

- **ヘッドライン/ロゴ**: Playfair Display (エレガントなセリフ体)
- **本文（日本語）**: Noto Sans JP
- **本文（英語）**: Open Sans

### デザイン哲学
「温かみ」「参加型」「生活感」「発見」「親しみ」「ナチュラルで上質」

## 🚀 はじめに

### 必要要件

- Node.js 18.17以上 
- npmまたはyarn
- Git

### インストール

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/yourusername/mikke-web.git
   cd mikke-web
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **環境変数を設定**
   
   ルートディレクトリに`.env.local`ファイルを作成：
   ```env
   # Firebase設定
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

5. **ブラウザでアクセス**
   ```
   http://localhost:3000
   ```

## 💻 開発

### 利用可能なスクリプト

```bash
npm run dev          # 開発サーバーを起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバーを起動
npm run lint         # ESLintを実行
npm test            # テストを実行
npm test:watch      # ウォッチモードでテスト実行
npm test:coverage   # カバレッジ付きでテスト実行
```

### プロジェクト構成

```
mikke-web/
├── app/                      # Next.js App Router
│   ├── page.tsx             # メインアプリケーションページ
│   ├── layout.tsx           # プロバイダー付きルートレイアウト
│   └── globals.css          # グローバルスタイル
├── components/
│   ├── features/            # 機能別コンポーネント
│   │   ├── GoogleMap.tsx    # 地図統合
│   │   ├── AddSpotModal.tsx # スポット作成モーダル
│   │   ├── SpotList.tsx     # スポットリスト表示
│   │   ├── FilterSection.tsx # カテゴリーフィルター
│   │   ├── ProfileScreen.tsx # ユーザープロフィール
│   │   ├── RankingScreen.tsx # ランキング表示
│   │   └── ...
│   ├── layout/              # レイアウトコンポーネント
│   │   ├── Header.tsx       # アプリヘッダー
│   │   ├── HamburgerMenu.tsx # ナビゲーションメニュー
│   │   └── ScreenHeader.tsx # 再利用可能な画面ヘッダー
│   └── ui/                  # 再利用可能なUIコンポーネント
│       ├── Toast.tsx        # 通知トースト
│       ├── LoadingScreen.tsx # ローディング状態
│       └── DevelopmentStageModal.tsx # ウェルカムモーダル
├── contexts/
│   └── AuthContext.tsx      # 認証プロバイダー
├── lib/
│   └── firebase/            # Firebaseサービス
│       ├── config.ts        # Firebase初期化
│       ├── spots.ts         # スポットCRUD操作
│       ├── auth.ts          # 認証ロジック
│       └── userStats.ts     # ユーザー統計
├── stores/                  # Zustand状態管理
│   ├── spotStore.ts         # モックデータストア
│   ├── firebaseSpotStore.ts # Firebaseデータストア
│   └── themeStore.ts        # テーマ管理
├── types/                   # TypeScript定義
│   └── spot.ts              # データ型定義
├── utils/                   # ユーティリティ関数
├── hooks/                   # カスタムReactフック
└── public/                  # 静的アセット
    ├── icons/              # PWAアイコン
    └── manifest.json       # PWAマニフェスト
```

### デュアルモード動作

アプリは2つのモードをサポート：

1. **Firebaseモード** (本番環境)
   - リアルタイムデータで完全な機能
   - ユーザー認証と永続化
   - 画像のクラウドストレージ

2. **モックモード** (開発環境)
   - Firebase設定なしで動作
   - ローカルモックデータを使用
   - UI/UX開発に最適

### 主要な実装詳細

#### 地図長押し機能
- **デスクトップ**: 800ms マウス長押し検出
- **モバイル**: 500ms タッチ長押し検出
- 情報ウィンドウ付き一時マーカーを作成
- AddSpotModalへのスムーズな遷移

#### マーカーパフォーマンス最適化
- O(1)検索のための`Map<spotId, marker>`を使用
- 変更されたマーカーのみ更新
- ハードウェアアクセラレーション対応アニメーション
- ちらつきや点滅なし

#### リアルタイム更新
- ライブデータ用Firebaseリスナー
- 楽観的UI更新
- 自動再接続処理

## 🏗️ アーキテクチャ

### データモデル

#### Spotsコレクション
```typescript
interface Spot {
  id: string;
  title: string;
  description?: string;
  category: SpotCategory;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  userId: string;
  author: {
    displayName: string;
    photoURL?: string;
  };
  stats: {
    likesCount: number;
    dislikesCount: number;
    viewsCount: number;
  };
  images?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

#### Userコレクション
```typescript
interface UserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  stats: {
    totalSpots: number;
    totalLikes: number;
    totalViews: number;
  };
  achievements?: Achievement[];
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    privacy?: 'public' | 'private';
  };
  isActive: boolean;
}
```

### カテゴリー

11のメインカテゴリー：
- `park_outdoor` - 公園・アウトドア
- `family` - 子育て・家族
- `entertainment` - 娯楽・レジャー
- `food_drink` - 飲食
- `shopping` - 買い物・ショップ
- `tourism` - 観光・名所
- `vending_machine` - 自動販売機
- `pet` - ペット
- `public_facility` - 公共施設
- `transportation` - 交通・移動
- `others` - その他

## 🚢 デプロイ

### Firebase設定

1. **Firebaseプロジェクトを作成**
   ```bash
   firebase login
   firebase init
   ```

2. **セキュリティルールをデプロイ**
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

3. **インデックスをビルド**
   - 複合インデックスは自動的にビルド（2〜5分）
   - Firebase Console > Firestore > Indexesで確認

### Vercelデプロイ

1. **Vercelに接続**
   ```bash
   npx vercel
   ```

2. **環境変数を設定**
   - `.env.local`のすべての変数をVercelダッシュボードに追加

3. **デプロイ**
   ```bash
   vercel --prod
   ```

### Dockerサポート（オプション）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 セキュリティ考慮事項

### 現在の状況（開発）
- テスト用に緩和されたFirestoreルール
- 認証はオプショナル

### 本番要件
- [ ] 適切なFirestoreセキュリティルールの実装
- [ ] 必須認証の有効化
- [ ] レート制限の追加
- [ ] 入力検証の実装
- [ ] CSPヘッダーの有効化
- [ ] APIコールへのリクエスト署名追加

## 🧪 テスト

### ユニットテスト

準備中・・・

### E2Eテスト（Playwright）
```bash
npx playwright test
```

### パフォーマンステスト
- Lighthouse CI統合
- バンドルサイズ分析
- Core Web Vitals監視

## 📈 パフォーマンス最適化

- **コード分割** - Next.js App Routerで自動実行
- **画像最適化** - 遅延読み込み付きNext.js Imageコンポーネント
- **キャッシング戦略** - アセット用のキャッシュファーストService Worker
- **データベースインデックス** - 最適化されたFirestoreクエリ
- **デバウンシング** - マップ境界更新（300ms）
- **メモ化** - 高負荷コンポーネント用React.memo

### 開発ワークフロー

1. リポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/AmazingFeature`）
3. 変更をコミット（`git commit -m 'Add AmazingFeature'`）
4. ブランチにプッシュ（`git push origin feature/AmazingFeature`）
5. プルリクエストを開く

## 📝 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細は[LICENSE](LICENSE)ファイルを参照してください。