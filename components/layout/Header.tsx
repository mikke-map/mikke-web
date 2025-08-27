'use client';

import { MapPin, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="bg-[var(--bg-card)] border-b border-[var(--border-light)] shadow-soft safe-top">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <MapPin className="w-7 h-7 text-primary" />
          </div>
          <h1 className="heading-large text-primary font-serif tracking-tight">Mikke</h1>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-primary-100 
                     transition-all duration-200 hover:shadow-soft
                     focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
          aria-label="テーマ切り替え"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-[var(--text-secondary)] hover:text-primary transition-colors" />
          ) : (
            <Sun className="w-5 h-5 text-[var(--text-secondary)] hover:text-primary transition-colors" />
          )}
        </button>
      </div>
    </header>
  );
}