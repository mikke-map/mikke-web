'use client';

import { Menu, ArrowLeft, Settings } from 'lucide-react';

interface ScreenHeaderProps {
  currentScreen: 'home' | 'profile' | 'ranking' | 'mySpots';
  onMenuClick: () => void;
  onBack?: () => void;
  onSettingsClick?: () => void;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ 
  currentScreen, 
  onMenuClick, 
  onBack, 
  onSettingsClick,
  showBackButton = false,
  rightAction 
}: ScreenHeaderProps) {
  // Screen-specific titles
  const titles: Record<string, string> = {
    profile: 'プロフィール',
    ranking: 'ランキング',
    mySpots: '投稿したスポット',
  };

  const title = titles[currentScreen] || '';

  return (
    <header className="bg-[var(--bg-card)] border-b border-[var(--border-light)] shadow-soft">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-2">
          {/* Hamburger Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="メニューを開く"
          >
            <Menu className="w-6 h-6 text-[var(--text-primary)]" />
          </button>

          {/* Back Button (if needed) */}
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="戻る"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          )}

          {/* Title */}
          {title && (
            <h1 className="text-lg font-medium text-[var(--text-primary)] ml-2">
              {title}
            </h1>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {rightAction}
          
          {/* Settings button for profile screen */}
          {currentScreen === 'profile' && onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="設定"
            >
              <Settings className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}