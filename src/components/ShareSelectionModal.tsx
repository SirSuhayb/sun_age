"use client";

import React, { useState } from 'react';
import { shareSolAge } from '~/lib/sharing';
import { useFrameSDK } from '~/hooks/useFrameSDK';

interface ShareSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  solAge: number;
  archetype?: string;
  quote?: string;
  userName?: string;
  profilePicUrl?: string;
  onShareComplete?: (platform: string, shareId: string) => void;
}

type SharePlatform = 'farcaster' | 'twitter' | 'linkedin' | 'copy';

export function ShareSelectionModal({
  isOpen,
  onClose,
  solAge,
  archetype,
  quote,
  userName = 'TRAVELLER',
  profilePicUrl,
  onShareComplete
}: ShareSelectionModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform | null>(null);
  const { sdk, isInFrame } = useFrameSDK();

  const handleShare = async (platform: SharePlatform) => {
    setIsSharing(true);
    setSelectedPlatform(platform);
    
    try {
      const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
      const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      
      // Create share parameters
      const shareParams = new URLSearchParams({
        solAge: solAge.toString(),
        ...(archetype && { archetype }),
        ...(quote && { quote })
      });
      
      // Generate a unique share ID for tracking
      const shareId = `solage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      switch (platform) {
        case 'farcaster':
          // Use existing farcaster sharing logic
          await shareSolAge(
            solAge,
            Math.floor(solAge / 365.25),
            new Date().toISOString().split('T')[0],
            userName,
            profilePicUrl,
            archetype,
            quote,
            sdk,
            isInFrame
          );
          break;
          
        case 'twitter':
          const twitterText = `I'm a ${archetype || 'Solar Being'} powered by ${solAge} days of pure sunlight ☀️\n\nDiscover your Solar Identity: ${baseUrl}`;
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
          window.open(twitterUrl, '_blank');
          break;
          
        case 'linkedin':
          const linkedinText = `I'm a ${archetype || 'Solar Being'} powered by ${solAge} days of pure sunlight ☀️\n\nDiscover your Solar Identity: ${baseUrl}`;
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}&summary=${encodeURIComponent(linkedinText)}`;
          window.open(linkedinUrl, '_blank');
          break;
          
        case 'copy':
          const copyText = `I'm a ${archetype || 'Solar Being'} powered by ${solAge} days of pure sunlight ☀️\n\nDiscover your Solar Identity: ${baseUrl}`;
          await navigator.clipboard.writeText(copyText);
          break;
      }
      
      // Track the share for claim eligibility
      if (onShareComplete) {
        onShareComplete(platform, shareId);
      }
      
      // Store share info locally for claim tracking
      localStorage.setItem('latest_solage_share', JSON.stringify({
        shareId,
        platform,
        solAge,
        archetype,
        quote,
        timestamp: Date.now()
      }));
      
      onClose();
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
      setSelectedPlatform(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white border border-[#d4af37] p-6 shadow-sm" style={{ boxShadow: '0 2px 8px 0 #e6c75a22' }}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🌞</div>
            <h2 className="text-xl font-serif font-bold mb-2">Share Your Sol Age</h2>
            <p className="text-gray-600 text-xs font-mono tracking-widest uppercase text-center max-w-xs mx-auto" style={{ letterSpacing: '0.15em' }}>
              Choose where you'd like to share your cosmic journey and earn $SOLAR tokens
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleShare('farcaster')}
              disabled={isSharing}
              className="w-full px-4 py-3 bg-[#8A63D2] text-white font-mono text-sm font-bold hover:bg-[#9c7ce6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-none"
              style={{ letterSpacing: '0.1em' }}
            >
              {isSharing && selectedPlatform === 'farcaster' ? (
                'SHARING...'
              ) : (
                <>
                  <span>📢</span>
                  SHARE ON FARCASTER
                </>
              )}
            </button>

            <button
              onClick={() => handleShare('twitter')}
              disabled={isSharing}
              className="w-full px-4 py-3 bg-[#1DA1F2] text-white font-mono text-sm font-bold hover:bg-[#1a8cd8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-none"
              style={{ letterSpacing: '0.1em' }}
            >
              {isSharing && selectedPlatform === 'twitter' ? (
                'SHARING...'
              ) : (
                <>
                  <span>🐦</span>
                  SHARE ON TWITTER
                </>
              )}
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              disabled={isSharing}
              className="w-full px-4 py-3 bg-[#0077B5] text-white font-mono text-sm font-bold hover:bg-[#006299] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-none"
              style={{ letterSpacing: '0.1em' }}
            >
              {isSharing && selectedPlatform === 'linkedin' ? (
                'SHARING...'
              ) : (
                <>
                  <span>💼</span>
                  SHARE ON LINKEDIN
                </>
              )}
            </button>

            <button
              onClick={() => handleShare('copy')}
              disabled={isSharing}
              className="w-full px-4 py-3 bg-gray-600 text-white font-mono text-sm font-bold hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-none"
              style={{ letterSpacing: '0.1em' }}
            >
              {isSharing && selectedPlatform === 'copy' ? (
                'COPYING...'
              ) : (
                <>
                  <span>📋</span>
                  COPY TO CLIPBOARD
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center font-mono tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
              After sharing, return to Solara to claim your $SOLAR tokens
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 text-gray-500 font-mono text-sm font-bold hover:text-gray-700 transition-colors"
            style={{ letterSpacing: '0.1em' }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}