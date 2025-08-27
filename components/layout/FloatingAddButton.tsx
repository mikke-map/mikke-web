'use client';

import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(40vh+1.5rem)] right-6 z-30 w-14 h-14 bg-primary text-white rounded-full shadow-xl 
                 hover:bg-primary-600 hover:shadow-2xl hover:scale-110 
                 transition-all duration-200 
                 flex items-center justify-center
                 focus:outline-none focus:ring-4 focus:ring-primary-300"
      aria-label="スポットを追加"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}