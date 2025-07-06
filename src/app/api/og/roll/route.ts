import { ImageResponse } from '@vercel/og';
import React from 'react';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Cosmic Guidance';
    const archetype = searchParams.get('archetype') || 'Sol Being';
    const rarity = searchParams.get('rarity') || 'common';
    const icon = searchParams.get('icon') || '✨';
    const type = searchParams.get('type') || 'activity';
    const solarEarned = searchParams.get('solarEarned');
    const streak = searchParams.get('streak');

    // Determine the base URL for fetching assets
    const baseUrl = req.headers.get('host')
      ? `http://${req.headers.get('host')}`
      : 'http://localhost:3000';
    const logoUrl = `${baseUrl}/logo.png`;

    // Try to load the font from the public directory
    let gtAlpinaFont: ArrayBuffer | null = null;
    try {
      const fontUrl = `${baseUrl}/fonts/GT-Alpina.ttf`;
      console.log('[OG IMAGE] Attempting to load font from:', fontUrl);
      
      const fontRes = await fetch(fontUrl);
      if (fontRes.ok) {
        gtAlpinaFont = await fontRes.arrayBuffer();
        console.log('[OG IMAGE] Font loaded successfully, size:', gtAlpinaFont.byteLength);
      } else {
        console.log('[OG IMAGE] Font fetch failed with status:', fontRes.status);
      }
    } catch (e) {
      console.error('[OG IMAGE] Font loading error:', e);
    }

    const fontConfig = gtAlpinaFont ? {
      fonts: [
        {
          name: 'GT Alpina',
          data: gtAlpinaFont,
          style: 'normal' as const,
          weight: 600 as const,
        },
      ],
    } : {};

    // Get rarity colors and emoji
    const rarityColors = {
      common: { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' },
      rare: { bg: '#F3E8FF', text: '#7C3AED', border: '#C4B5FD' },
      legendary: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
    };
    
    const rarityEmoji = rarity === 'legendary' ? '🌟' : rarity === 'rare' ? '💎' : '✨';
    const colors = rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            width: '1200px',
            height: '630px',
            background: '#FFFCF2',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            fontFamily: 'monospace, sans-serif',
          },
        },
        [
          // Background gradient
          React.createElement(
            'div',
            {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${colors.bg} 0%, #FFFCF2 100%)`,
                opacity: 0.8,
              },
            }
          ),
          // Header
          React.createElement(
            'div',
            {
              style: {
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: 24,
                color: '#6B7280',
                letterSpacing: 3,
                fontWeight: 600,
              },
            },
            'COSMIC GUIDANCE RECEIVED'
          ),
          // Main icon
          React.createElement(
            'div',
            {
              style: {
                fontSize: 120,
                marginBottom: 20,
                textAlign: 'center',
              },
            },
            icon
          ),
          // Title
          React.createElement(
            'div',
            {
              style: {
                fontFamily: gtAlpinaFont ? 'GT Alpina, Georgia, serif' : 'Georgia, serif',
                fontSize: 52,
                color: '#111827',
                textAlign: 'center',
                fontWeight: 600,
                maxWidth: 900,
                lineHeight: 1.2,
                marginBottom: 30,
              },
            },
            title
          ),
          // Rarity and archetype info
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                marginBottom: 40,
              },
            },
            [
              React.createElement(
                'div',
                {
                  style: {
                    background: colors.bg,
                    color: colors.text,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: `2px solid ${colors.border}`,
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  },
                },
                `${rarityEmoji} ${rarity} ${type}`
              ),
              React.createElement(
                'div',
                {
                  style: {
                    background: '#F3F4F6',
                    color: '#374151',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '2px solid #D1D5DB',
                    fontFamily: 'monospace',
                    fontSize: 18,
                    fontWeight: 600,
                    letterSpacing: 1,
                  },
                },
                archetype
              ),
            ]
          ),
          // SOLAR earnings and streak info
          (solarEarned || streak) && React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 30,
                marginBottom: 20,
              },
            },
            [
              solarEarned && React.createElement(
                'div',
                {
                  style: {
                    background: '#D4AF37',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: 1,
                  },
                },
                `+${solarEarned} $SOLAR`
              ),
              streak && parseInt(streak) > 1 && React.createElement(
                'div',
                {
                  style: {
                    background: '#EF4444',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: 1,
                  },
                },
                `🔥 ${streak} DAY STREAK`
              ),
            ]
          ),
          // Footer
          React.createElement(
            'div',
            {
              style: {
                position: 'absolute',
                bottom: 60,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: 20,
                color: '#6B7280',
                letterSpacing: 2,
              },
            },
            'Get your daily cosmic guidance at solara.fyi'
          ),
          // SOLARA Logo - partially cut off at bottom
          React.createElement('img', {
            src: logoUrl,
            alt: 'Solara',
            width: 400,
            height: 100,
            style: {
              position: 'absolute',
              left: '50%',
              bottom: -20,
              transform: 'translateX(-50%)',
              opacity: 0.15,
            },
          })
        ]
      ),
      {
        width: 1200,
        height: 630,
        ...fontConfig,
        headers: {
          'Cache-Control': 'public, immutable, no-transform, max-age=300',
        },
      }
    );
  } catch (err: any) {
    console.error('[OG IMAGE] Error generating roll image:', err);
    return new Response(`OG image error: ${err.message}`, { status: 500 });
  }
}