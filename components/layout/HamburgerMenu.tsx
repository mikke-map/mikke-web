'use client';

import { useEffect, useState } from 'react';
import { X, Home, Trophy, User, MapPin, Plus } from 'lucide-react';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: 'home' | 'ranking' | 'profile' | 'mySpots';
  onScreenChange: (screen: 'home' | 'ranking' | 'profile' | 'mySpots') => void;
  onAddSpot?: () => void;
}

export function HamburgerMenu({ isOpen, onClose, currentScreen, onScreenChange, onAddSpot }: HamburgerMenuProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Close menu when screen changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen]);

  // Handle menu visibility and animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(false); // Start with false to ensure off-screen position
      // Small delay to ensure the element is rendered in off-screen position before starting animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Keep the menu visible during exit animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Match the transition duration
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close menu on escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const menuItems = [
    { id: 'home', label: 'ホーム', icon: Home },
    { id: 'ranking', label: 'ランキング', icon: Trophy },
    { id: 'profile', label: 'プロフィール', icon: User },
  ] as const;

  // Don't render anything if not visible (after exit animation completes)
  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-out
                   ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[var(--bg-card)] z-50 
                    transform transition-all duration-300 ease-out shadow-soft-lg
                    ${isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        style={{
          // Ensure hardware acceleration for smooth animations
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-6 right-6 z-10 p-2 rounded-lg bg-[var(--bg-tertiary)] 
                     hover:bg-primary-100 transition-all duration-200 hover:shadow-soft
                     transform
                     ${isAnimating 
                       ? 'translate-x-0 opacity-100 scale-100' 
                       : 'translate-x-4 opacity-0 scale-95'
                     }`}
          style={{ 
            transitionDelay: isAnimating ? '250ms' : '0ms',
            transitionDuration: '300ms',
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Bouncy easing
          }}
          aria-label="メニューを閉じる"
        >
          <X className="w-5 h-5 text-primary transition-transform duration-200 hover:rotate-90" />
        </button>

        {/* Menu Header */}
        <div className={`p-6 border-b border-[var(--border-light)] transform transition-all duration-300 ease-out
                        ${isAnimating 
                          ? 'translate-x-0 opacity-100' 
                          : '-translate-x-8 opacity-0'
                        }`}
             style={{ transitionDelay: isAnimating ? '100ms' : '0ms' }}
        >
          <div className="flex items-center space-x-3 mt-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-primary">Mikke</h2>
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            地域の隠れたスポットを発見
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;

              return (
                <li 
                  key={item.id}
                  className={`transform transition-all duration-300 ease-out
                            ${isAnimating 
                              ? 'translate-x-0 opacity-100' 
                              : '-translate-x-8 opacity-0'
                            }`}
                  style={{
                    transitionDelay: isAnimating ? `${150 + index * 50}ms` : '0ms',
                  }}
                >
                  <button
                    onClick={() => {
                      onScreenChange(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                              ${isActive 
                                ? 'bg-primary-100 text-primary shadow-soft' 
                                : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:shadow-soft'
                              }`}
                  >
                    <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-[var(--text-muted)]'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Add Spot Button */}
          {onAddSpot && (
            <div className={`mt-6 pt-6 border-t border-[var(--border-light)] transform transition-all duration-300 ease-out
                           ${isAnimating 
                             ? 'translate-x-0 opacity-100' 
                             : '-translate-x-8 opacity-0'
                           }`}
                 style={{ transitionDelay: isAnimating ? `${150 + menuItems.length * 50}ms` : '0ms' }}
            >
              <button
                onClick={() => {
                  onAddSpot();
                  onClose();
                }}
                className="w-full btn-primary flex items-center justify-center space-x-2 shadow-soft hover:shadow-soft-lg"
              >
                <Plus className="w-5 h-5" />
                <span>スポットを追加</span>
              </button>
            </div>
          )}
        </nav>

        {/* Menu Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--border-light)] transform transition-all duration-300 ease-out
                        ${isAnimating 
                          ? 'translate-x-0 opacity-100' 
                          : '-translate-x-8 opacity-0'
                        }`}
             style={{ transitionDelay: isAnimating ? `${200 + menuItems.length * 50}ms` : '0ms' }}
        >
          <div className="text-xs text-[var(--text-muted)] space-y-1">
            <p>© 2024 Mikke</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}