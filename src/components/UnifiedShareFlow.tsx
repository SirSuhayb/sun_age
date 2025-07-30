"use client";

import React, { useState } from 'react';
import { ShareSelectionModal } from './ShareSelectionModal';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import Image from 'next/image';

interface UnifiedShareFlowProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    type: 'sol_age' | 'journal_entry' | 'roll' | 'pledge';
    title: string;
    description: string;
    data: any;
  };
  userName?: string;
  profilePicUrl?: string;
  onShareComplete?: (platform: string, shareId: string) => void;
}

export function UnifiedShareFlow({
  isOpen,
  onClose,
  content,
  userName = 'TRAVELLER',
  profilePicUrl,
  onShareComplete
}: UnifiedShareFlowProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const { isInFrame } = useFrameSDK();

  // Don't show interstitial for Farcaster users - they use the existing flow
  if (isInFrame) {
    return (
      <ShareSelectionModal
        isOpen={isOpen}
        onClose={onClose}
        content={content}
        userName={userName}
        profilePicUrl={profilePicUrl}
        onShareComplete={onShareComplete}
      />
    );
  }

  const getContentIcon = () => {
    if (!content) return '🌞';
    switch (content.type) {
      case 'sol_age': return '☀️';
      case 'journal_entry': return '📓';
      case 'roll': return '🎲';
      case 'pledge': return '🌟';
      default: return '🌞';
    }
  };

  const getContentEmoji = () => {
    if (!content) return 'Your cosmic journey is ready!';
    switch (content.type) {
      case 'sol_age': return 'Your cosmic age calculation is ready!';
      case 'journal_entry': return 'Your reflection is complete!';
      case 'roll': return 'The cosmos has spoken!';
      case 'pledge': return 'Your vow is inscribed!';
      default: return 'Your cosmic journey is ready!';
    }
  };

  if (!isOpen || !content) return null;

  return (
    <>
      {/* Main Interstitial */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        
        {/* Interstitial Content */}
        <div className="relative z-10 w-full max-w-lg mx-4">
          <div className="bg-white border border-[#d4af37] p-8 shadow-lg" style={{ boxShadow: '0 4px 20px 0 #e6c75a33' }}>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{getContentIcon()}</div>
              <h1 className="text-2xl font-serif font-bold mb-3">
                {getContentEmoji()}
              </h1>
              <p className="text-gray-600 text-sm font-mono tracking-wider uppercase" style={{ letterSpacing: '0.15em' }}>
                Share your cosmic journey and connect with the universe
              </p>
            </div>

            {/* Content Preview */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 mb-6 rounded-sm">
              <div className="text-center">
                <h3 className="font-serif font-bold text-lg mb-2">{content.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{content.description}</p>
                
                {/* Dynamic content preview based on type */}
                {content.type === 'sol_age' && (
                  <div className="text-3xl font-bold text-orange-600">
                    {content.data.solAge?.toLocaleString()} days
                  </div>
                )}
                
                                 {content.type === 'journal_entry' && (
                   <div className="text-gray-600 italic">
                     &ldquo;{content.data.preview?.slice(0, 80)}...&rdquo;
                   </div>
                 )}
                
                {content.type === 'roll' && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{content.data.icon}</span>
                    <span className="font-bold">{content.data.title}</span>
                  </div>
                )}
                
                                 {content.type === 'pledge' && (
                   <div className="text-gray-600 italic">
                     &ldquo;{content.data.signatureMsg?.slice(0, 80)}...&rdquo;
                   </div>
                 )}
              </div>
            </div>

            {/* Share Benefits */}
            <div className="mb-6">
              <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3 text-center">
                Why Share Your Journey?
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span>Earn $SOLAR tokens for sharing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-blue-500">🌐</span>
                  <span>Connect with your cosmic community</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-500">📈</span>
                  <span>Inspire others on their journey</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-purple-500">🔮</span>
                  <span>Unlock achievement milestones</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-mono text-sm font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-md"
                style={{ letterSpacing: '0.1em' }}
              >
                🚀 SHARE YOUR JOURNEY
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-100 text-gray-600 font-mono text-sm font-bold hover:bg-gray-200 transition-colors"
                style={{ letterSpacing: '0.1em' }}
              >
                CONTINUE WITHOUT SHARING
              </button>
            </div>

            {/* Platform Icons Preview */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center font-mono mb-3" style={{ letterSpacing: '0.1em' }}>
                SHARE TO YOUR FAVORITE PLATFORMS
              </p>
              <div className="flex justify-center gap-4 text-2xl opacity-60">
                <span title="Twitter">🐦</span>
                <span title="Facebook">📘</span>
                <span title="Instagram">📷</span>
                <span title="TikTok">🎵</span>
                <span title="LinkedIn">💼</span>
                <span title="SMS">💬</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Selection Modal */}
      <ShareSelectionModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          onClose(); // Close the interstitial too
        }}
        content={content}
        userName={userName}
        profilePicUrl={profilePicUrl}
        onShareComplete={onShareComplete}
      />
    </>
  );
}

// Hook for triggering the unified share flow
export function useUnifiedShare() {
  const [shareState, setShareState] = useState<{
    isOpen: boolean;
    content: {
      type: 'sol_age' | 'journal_entry' | 'roll' | 'pledge';
      title: string;
      description: string;
      data: any;
    } | null;
    userName?: string;
    profilePicUrl?: string;
    onShareComplete?: (platform: string, shareId: string) => void;
  }>({
    isOpen: false,
    content: null
  });

  const triggerShare = (params: {
    content: {
      type: 'sol_age' | 'journal_entry' | 'roll' | 'pledge';
      title: string;
      description: string;
      data: any;
    };
    userName?: string;
    profilePicUrl?: string;
    onShareComplete?: (platform: string, shareId: string) => void;
  }) => {
    setShareState({
      isOpen: true,
      ...params
    });
  };

  const closeShare = () => {
    setShareState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    shareState,
    triggerShare,
    closeShare,
    ShareFlowComponent: () => (
      <UnifiedShareFlow
        isOpen={shareState.isOpen}
        onClose={closeShare}
        content={shareState.content}
        userName={shareState.userName}
        profilePicUrl={shareState.profilePicUrl}
        onShareComplete={shareState.onShareComplete}
      />
    )
  };
}