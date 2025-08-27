'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, X, Sparkles, ChevronRight } from 'lucide-react';
import { Badge, BADGE_METADATA, BADGE_THRESHOLDS, BadgeCelebration } from '@/types/badge';

interface BadgeCelebrationModalProps {
  celebration: BadgeCelebration | null;
  onClose: () => void;
  onViewBadges?: () => void;
  onContinue?: () => void;
}

export function BadgeCelebrationModal({ 
  celebration, 
  onClose, 
  onViewBadges,
  onContinue 
}: BadgeCelebrationModalProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [confettiParticles, setConfettiParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!celebration) {
      setAnimationStage(0);
      return;
    }

    // Start animation sequence
    const timers: NodeJS.Timeout[] = [];
    
    // Stage 1: Modal appears
    timers.push(setTimeout(() => setAnimationStage(1), 100));
    
    // Stage 2: Badge scales in
    timers.push(setTimeout(() => setAnimationStage(2), 300));
    
    // Stage 3: Shine effect
    timers.push(setTimeout(() => setAnimationStage(3), 600));
    
    // Stage 4: Text appears
    timers.push(setTimeout(() => setAnimationStage(4), 900));
    
    // Stage 5: Confetti
    timers.push(setTimeout(() => {
      setAnimationStage(5);
      generateConfetti();
    }, 1200));

    // Stage 6: Buttons appear
    timers.push(setTimeout(() => setAnimationStage(6), 1500));

    // Stage 7: Full interactive
    timers.push(setTimeout(() => setAnimationStage(7), 1800));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [celebration]);

  const generateConfetti = () => {
    const particles = [];
    const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD'];
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setConfettiParticles(particles);
  };

  if (!celebration) return null;

  const badge = celebration.badge;
  const metadata = BADGE_METADATA[badge.category];
  const threshold = BADGE_THRESHOLDS.find(t => t.level === badge.level);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        animationStage >= 1 ? 'bg-black/70 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
      }`}
      onClick={animationStage >= 7 ? onClose : undefined}
    >
      {/* Confetti */}
      {animationStage >= 5 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-3 h-3 animate-fall"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transform: `rotate(${particle.rotation}deg)`,
                backgroundColor: particle.color,
                animation: `fall ${3 + Math.random() * 2}s linear forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div 
        className={`relative bg-[var(--bg-card)] rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transition-all duration-700 ${
          animationStage >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {animationStage >= 7 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-all duration-200 z-10"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        )}

        {/* Shine effect overlay */}
        {animationStage >= 3 && animationStage <= 5 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
          </div>
        )}

        {/* Content */}
        <div className="p-8 text-center">
          {/* Sparkles decoration */}
          {animationStage >= 4 && (
            <div className="absolute top-4 left-4 text-yellow-400 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          {animationStage >= 4 && (
            <div className="absolute top-4 right-12 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }}>
              <Sparkles className="w-5 h-5" />
            </div>
          )}

          {/* Badge Display */}
          <div className={`relative mb-6 transition-all duration-700 ${
            animationStage >= 2 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            <div 
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl shadow-xl ${
                animationStage >= 3 ? 'animate-bounce-subtle' : ''
              }`}
              style={{ 
                background: threshold?.gradient,
                boxShadow: animationStage >= 3 ? `0 0 40px ${threshold?.color}40` : undefined,
              }}
            >
              {metadata.icon}
            </div>
            
            {/* Medal indicator */}
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
              animationStage >= 3 ? 'scale-100' : 'scale-0'
            }`}>
              <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg flex items-center space-x-1">
                <Medal className="w-5 h-5" style={{ color: threshold?.color }} />
                <span className="text-sm font-bold" style={{ color: threshold?.color }}>
                  {badge.level === 'bronze' ? '銅' : badge.level === 'silver' ? '銀' : '金'}
                </span>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className={`transition-all duration-500 ${
            animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">
              バッジ獲得！
            </h2>
            <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
              {metadata.label}
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              {celebration.previousLevel ? (
                <>
                  {badge.level === 'silver' && '銅バッジから銀バッジにランクアップ！'}
                  {badge.level === 'gold' && '銀バッジから金バッジにランクアップ！'}
                  <br />
                </>
              ) : (
                <>最初の{badge.level === 'bronze' ? '銅' : badge.level === 'silver' ? '銀' : '金'}バッジを獲得しました！<br /></>
              )}
              {badge.category}カテゴリで{badge.requiredPosts}件の投稿を達成！
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-3 transition-all duration-500 ${
            animationStage >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {onViewBadges && (
              <button
                onClick={onViewBadges}
                className="w-full btn-primary flex items-center justify-center space-x-2 shadow-soft hover:shadow-soft-lg"
              >
                <Trophy className="w-5 h-5" />
                <span>バッジコレクションを見る</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onContinue || onClose}
              className="w-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] py-3 px-6 rounded-xl hover:bg-primary-50 transition-all duration-200"
            >
              探索を続ける
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(calc(100vh + 100px)) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(200%);
          }
        }
        
        .animate-fall {
          animation: fall 3s linear forwards;
        }
        
        .animate-shine {
          animation: shine 1s ease-out;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}