'use client';

import { useState } from 'react';
import { EditSpotModal } from '@/components/features/EditSpotModal';

// Mock spot ID for testing
const TEST_SPOT_ID = 'test-spot-123';

export default function TestEditPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
          Edit Spot Modal Test
        </h1>

        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              Test Edit Functionality
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              Click the button below to open the EditSpotModal with a test spot.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
            >
              Open Edit Modal
            </button>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Test Spot Information
            </h3>
            <ul className="text-[var(--text-secondary)] space-y-1">
              <li>• Spot ID: {TEST_SPOT_ID}</li>
              <li>• This will load an existing spot from Firebase</li>
              <li>• You can edit all fields including category</li>
              <li>• Changes will be saved to Firebase</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditSpotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        spotId={TEST_SPOT_ID}
        onUpdate={() => {
          console.log('Spot updated successfully!');
          alert('スポットが正常に更新されました！');
        }}
      />
    </div>
  );
}