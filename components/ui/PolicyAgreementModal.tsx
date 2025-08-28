'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, FileText, Shield } from 'lucide-react';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../constant/constant';

interface PolicyAgreementModalProps {
  isOpen: boolean;
  onAgree: () => void;
}

export default function PolicyAgreementModal({ isOpen, onAgree }: PolicyAgreementModalProps) {
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);
  const [isPrivacyExpanded, setIsPrivacyExpanded] = useState(false);

  if (!isOpen) return null;

  const handleDisagree = () => {
    window.close();
    window.location.href = 'about:blank';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-terracotta-400 to-terracotta-500 p-6">
            <h2 className="text-2xl font-bold text-neutral-800 text-center dark:text-neutral-100 mb-2">
              利用規約・プライバシーポリシーへの同意
            </h2>
            <p className="text-neutral-800 text-center mt-2">
              Mikkeをご利用いただくには、以下の内容に同意いただく必要があります
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="bg-terracotta-50 dark:bg-terracotta-900/20 rounded-lg p-4">
                <button
                  onClick={() => setIsTermsExpanded(!isTermsExpanded)}
                  className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-terracotta-600 dark:text-terracotta-400" />
                    <span className="font-semibold text-lg text-neutral-800 dark:text-neutral-100">
                      利用規約
                    </span>
                  </div>
                  {isTermsExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  )}
                </button>

                {isTermsExpanded && (
                  <div className="mt-4 p-4 bg-white dark:bg-neutral-900 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-700 dark:text-neutral-300">
                      {TERMS_OF_SERVICE}
                    </pre>
                  </div>
                )}
              </div>

              <div className="bg-terracotta-50 dark:bg-terracotta-900/20 rounded-lg p-4">
                <button
                  onClick={() => setIsPrivacyExpanded(!isPrivacyExpanded)}
                  className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-terracotta-600 dark:text-terracotta-400" />
                    <span className="font-semibold text-lg text-neutral-800 dark:text-neutral-100">
                      プライバシーポリシー
                    </span>
                  </div>
                  {isPrivacyExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  )}
                </button>

                {isPrivacyExpanded && (
                  <div className="mt-4 p-4 bg-white dark:bg-neutral-900 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-700 dark:text-neutral-300">
                      {PRIVACY_POLICY}
                    </pre>
                  </div>
                )}
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold">重要：</span>
                  上記の利用規約およびプライバシーポリシーをよくお読みください。
                  同意いただけない場合は、本サービスをご利用いただけません。
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onAgree}
              className="px-4 sm:px-6 py-3 rounded-lg bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap min-w-[120px] shadow-md"
            >
              同意する
            </button>
            <button
              onClick={handleDisagree}
              className="px-4 sm:px-6 py-3 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-medium text-xs sm:text-base whitespace-nowrap"
            >
              同意せずページを閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  );
}