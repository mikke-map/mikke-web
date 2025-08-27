'use client';

import React from 'react';
import { X, Sparkles, Heart } from 'lucide-react';

interface DevelopmentStageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevelopmentStageModal({ isOpen, onClose }: DevelopmentStageModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-60 p-4">
        <div
          className="relative bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full animate-modalSlideIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Icon and Title */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Sparkles className="w-12 h-12 text-primary-500 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-400 rounded-full animate-ping" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary-300 rounded-full animate-ping animation-delay-200" />
              </div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                このアプリは現在、試験公開中です！
              </h2>
            </div>

            {/* Message sections */}
            <div className="space-y-4">
              {/* First message */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/10 rounded-2xl p-4">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  まだ完成形ではありませんが、少しずつ手を加えながら、もっと心地よい体験を目指しています。
                </p>
              </div>

              {/* Sprout message with gradient */}
              <div className="bg-gradient-to-r from-green-50 to-primary-50 dark:from-green-900/20 dark:to-primary-900/20 rounded-2xl p-4 border border-green-200/30 dark:border-green-700/30">
                <p className="text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-2">
                  あなたのひとこと・ひと声が、このアプリの未来をつくります
                  <span className="text-2xl animate-bounce animation-delay-300">🌱</span>
                </p>
              </div>

              {/* Feedback message */}
              <div className="space-y-3">
                <p className="text-neutral-600 dark:text-neutral-400">
                  気づいたことや、こうだったらもっと良いのに！というアイデアがあれば、ぜひ教えてください。
                </p>

                <div className="flex items-start gap-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4">
                  <Heart className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0 animate-heartbeat" />
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
                    一緒につくってくださる皆さんのフィードバックが、何よりの力になります。
                  </p>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>アプリを始める</span>
              <Heart className="w-4 h-4 animate-heartbeat" />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>

          {/* Decorative dots */}
          <div className="absolute -z-10 top-10 left-10 w-20 h-20 bg-primary-200/20 dark:bg-primary-400/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -z-10 bottom-10 right-10 w-32 h-32 bg-primary-300/20 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse animation-delay-500" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.4s ease-out;
        }

        .animate-heartbeat {
          animation: heartbeat 2s infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </>
  );
}