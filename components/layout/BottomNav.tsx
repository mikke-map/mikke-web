'use client';

import { Home, Trophy, User } from 'lucide-react';

interface BottomNavProps {
  currentScreen: 'home' | 'ranking' | 'profile' | 'mySpots';
  onScreenChange: (screen: 'home' | 'ranking' | 'profile' | 'mySpots') => void;
}

export function BottomNav({ currentScreen, onScreenChange }: BottomNavProps) {
  const navItems = [
    {
      id: 'home' as const,
      label: 'ホーム',
      icon: Home,
    },
    {
      id: 'ranking' as const,
      label: 'ランキング',
      icon: Trophy,
    },
    {
      id: 'profile' as const,
      label: 'プロフィール',
      icon: User,
    },
  ];

  return (
    <nav className="bg-[var(--bg-card)] border-t border-[var(--border-light)] shadow-soft-lg safe-bottom">
      <div className="flex justify-around px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'text-primary bg-primary-50 shadow-soft'
                  : 'text-[var(--text-muted)] hover:text-primary hover:bg-primary-25 hover:shadow-soft'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="caption font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}