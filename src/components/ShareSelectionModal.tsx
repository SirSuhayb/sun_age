"use client";

import React, { useState } from 'react';
import { shareSolAge } from '~/lib/sharing';
import { useFrameSDK } from '~/hooks/useFrameSDK';

interface ShareSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Content details for sharing
  content: {
    type: 'sol_age' | 'journal_entry' | 'roll' | 'pledge';
    title: string;
    description: string;
    data: any; // Specific data for each content type
  };
  // Legacy props for backward compatibility
  solAge?: number;
  archetype?: string;
  quote?: string;
  userName?: string;
  profilePicUrl?: string;
  onShareComplete?: (platform: string, shareId: string) => void;
}

type SharePlatform = 'farcaster' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'sms' | 'copy';

// Platform configuration
const platformConfig = {
  farcaster: {
    name: 'FARCASTER',
    icon: '📢',
    color: 'bg-[#8A63D2] hover:bg-[#9c7ce6]',
    enabled: true
  },
  twitter: {
    name: 'TWITTER',
    icon: '🐦',
    color: 'bg-[#1DA1F2] hover:bg-[#1a8cd8]',
    enabled: true
  },
  facebook: {
    name: 'FACEBOOK',
    icon: '📘',
    color: 'bg-[#1877F2] hover:bg-[#166fe5]',
    enabled: true
  },
  instagram: {
    name: 'INSTAGRAM',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    enabled: true
  },
  tiktok: {
    name: 'TIKTOK',
    icon: '🎵',
    color: 'bg-black hover:bg-gray-800',
    enabled: true
  },
  linkedin: {
    name: 'LINKEDIN',
    icon: '💼',
    color: 'bg-[#0077B5] hover:bg-[#006299]',
    enabled: true
  },
  sms: {
    name: 'TEXT MESSAGE',
    icon: '💬',
    color: 'bg-green-600 hover:bg-green-700',
    enabled: true
  },
  copy: {
    name: 'COPY TO CLIPBOARD',
    icon: '📋',
    color: 'bg-gray-600 hover:bg-gray-700',
    enabled: true
  }
};

export function ShareSelectionModal({
  isOpen,
  onClose,
  content,
  // Legacy props for backward compatibility
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

  // Helper to generate share text based on content type
  const generateShareText = (platform: SharePlatform) => {
    const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    // Use legacy props if content is not provided (backward compatibility)
    if (!content && solAge) {
      return `I'm a ${archetype || 'Solar Being'} powered by ${solAge} days of pure sunlight ☀️\n\nDiscover your Solar Identity: ${baseUrl}`;
    }

    if (!content) return '';

    switch (content.type) {
      case 'sol_age':
        const { solAge: days, archetype: arch, quote: q } = content.data;
        return `I'm a ${arch || 'Solar Being'} powered by ${days} days of pure sunlight ☀️\n\nDiscover your Solar Identity: ${baseUrl}`;
      
      case 'journal_entry':
        const { preview, shareUrl } = content.data;
        return `🌞 My Solara reflection:\n\n${preview}...\n\nRead more: ${shareUrl}`;
      
      case 'roll':
        const { title, archetype: rollArch, rarity, icon, solarEarned, streak } = content.data;
        const rarityEmoji = rarity === 'legendary' ? '🌟' : rarity === 'rare' ? '💎' : '✨';
        const solarText = solarEarned ? ` (+${solarEarned} $SOLAR earned!)` : '';
        const streakText = streak && streak > 1 ? ` • ${streak} day streak! 🔥` : '';
        return `The cosmos guided me to: "${title}" ${icon}\n\n${rarityEmoji} ${rarity} guidance for ${rollArch}${solarText}${streakText}\n\nGet your daily cosmic guidance: ${baseUrl}/surprise-me`;
      
      case 'pledge':
        const { signatureMsg } = content.data;
        return `I've inscribed my Solar Vow into eternity:\n"${signatureMsg}"\n\nMake a vow and join the convergence: ${baseUrl}`;
      
      default:
        return `Check out my cosmic journey on Solara: ${baseUrl}`;
    }
  };

  const handleShare = async (platform: SharePlatform) => {
    setIsSharing(true);
    setSelectedPlatform(platform);
    
    try {
      const shareText = generateShareText(platform);
      const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
      const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      
      // Generate a unique share ID for tracking
      const shareId = `${content?.type || 'solage'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      switch (platform) {
        case 'farcaster':
          // Use existing farcaster sharing logic for backward compatibility
          if (content?.type === 'sol_age' || solAge) {
            const data = content?.data || { solAge, archetype, quote };
            await shareSolAge(
              data.solAge || solAge!,
              Math.floor((data.solAge || solAge!) / 365.25),
              new Date().toISOString().split('T')[0],
              userName,
              profilePicUrl,
              data.archetype || archetype,
              data.quote || quote,
              sdk,
              isInFrame
            );
          }
          break;
          
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
          window.open(twitterUrl, '_blank');
          break;
          
        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}&quote=${encodeURIComponent(shareText)}`;
          window.open(facebookUrl, '_blank');
          break;
          
        case 'instagram':
          // Instagram doesn't have a direct web share API, so we copy text and provide instructions
          await navigator.clipboard.writeText(shareText);
          alert('Text copied to clipboard! Open Instagram and paste this in your story or post.');
          break;
          
        case 'tiktok':
          // TikTok doesn't have a direct web share API, copy text and provide instructions
          await navigator.clipboard.writeText(shareText);
          alert('Text copied to clipboard! Open TikTok and paste this in your video description.');
          break;
          
        case 'linkedin':
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}&summary=${encodeURIComponent(shareText)}`;
          window.open(linkedinUrl, '_blank');
          break;
          
        case 'sms':
          const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`;
          window.location.href = smsUrl;
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(shareText);
          break;
      }
      
      // Track the share for claim eligibility
      if (onShareComplete) {
        onShareComplete(platform, shareId);
      }
      
      // Store share info locally for claim tracking
      localStorage.setItem('latest_share', JSON.stringify({
        shareId,
        platform,
        contentType: content?.type || 'sol_age',
        contentData: content?.data || { solAge, archetype, quote },
        timestamp: Date.now()
      }));
      
      onClose();
    } catch (error) {
      console.error('Share failed:', error);
      alert('Share failed. Please try again.');
    } finally {
      setIsSharing(false);
      setSelectedPlatform(null);
    }
  };

  if (!isOpen) return null;

  // Determine which platforms to show based on environment
  const availablePlatforms: SharePlatform[] = isInFrame 
    ? ['farcaster', 'copy'] // In Farcaster frame, prioritize Farcaster
    : ['twitter', 'facebook', 'instagram', 'tiktok', 'linkedin', 'sms', 'copy']; // Web users get full selection

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white border border-[#d4af37] p-6 shadow-sm" style={{ boxShadow: '0 2px 8px 0 #e6c75a22' }}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🌞</div>
            <h2 className="text-xl font-serif font-bold mb-2">
              {content?.title || 'Share Your Sol Age'}
            </h2>
            <p className="text-gray-600 text-xs font-mono tracking-widest uppercase text-center max-w-xs mx-auto" style={{ letterSpacing: '0.15em' }}>
              {content?.description || 'Choose where you\'d like to share your cosmic journey and earn $SOLAR tokens'}
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availablePlatforms.map((platform) => {
              const config = platformConfig[platform];
              if (!config.enabled) return null;
              
              return (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  disabled={isSharing}
                  className={`w-full px-4 py-3 text-white font-mono text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 rounded-none ${config.color}`}
                  style={{ letterSpacing: '0.1em' }}
                >
                  {isSharing && selectedPlatform === platform ? (
                    'SHARING...'
                  ) : (
                    <>
                      <span>{config.icon}</span>
                      SHARE ON {config.name}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center font-mono tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
              {isInFrame ? 'Share to connect with your Farcaster community' : 'After sharing, return to Solara to claim your $SOLAR tokens'}
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