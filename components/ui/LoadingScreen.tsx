'use client';

import { MapPin } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center z-50">
      <div className="text-center text-white">
        <div className="mb-8">
          <MapPin className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Mikke</h1>
        </div>
        <div className="loading-spinner mx-auto mb-4 border-white border-t-transparent"></div>
        <p className="text-lg">スポットを読み込み中...</p>
      </div>
    </div>
  );
}