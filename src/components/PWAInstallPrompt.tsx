'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for install prompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installation accepted');
        setIsInstalled(true);
      }
      
      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  if (isInstalled) {
    return (
      <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 text-center">
        <div className="text-lg font-serif font-bold mb-2" style={{ letterSpacing: '-0.06em' }}>
          ✨ Solara Installed
        </div>
        <div className="text-xs font-mono text-gray-500 tracking-widest uppercase">
          Launch from your home screen
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6">
      <div className="text-center mb-6">
        <div className="text-xl font-serif font-bold mb-3" style={{ letterSpacing: '-0.06em' }}>
          📱 Add Solara to Home Screen
        </div>
        <div className="text-xs font-mono text-gray-500 tracking-widest uppercase">
          Get quick access to track your sol age anytime
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleInstallClick}
          className="w-full max-w-xs bg-[#7C65C1] text-white py-3 px-6 transition-colors hover:bg-[#6952A3] font-mono text-sm tracking-widest uppercase"
        >
          {isInstallable ? '📲 Install App' : '📖 Show Instructions'}
        </button>
      </div>

      {(showInstructions || isIOS) && (
        <div className="mt-6 p-4 bg-white/80 border border-gray-300">
          <div className="text-lg font-serif font-bold mb-4" style={{ letterSpacing: '-0.06em' }}>
            Installation Guide
          </div>
          
          {isIOS ? (
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mr-4 mt-1 flex-shrink-0">Step 1</span>
                <div className="text-sm">
                  Tap the Share button <span className="text-lg mx-1">⎋</span> in Safari
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mr-4 mt-1 flex-shrink-0">Step 2</span>
                <div className="text-sm">
                  Scroll down and tap "Add to Home Screen" <span className="text-lg mx-1">➕</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mr-4 mt-1 flex-shrink-0">Step 3</span>
                <div className="text-sm">
                  Tap "Add" to confirm installation
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mr-4 mt-1 flex-shrink-0">Chrome</span>
                <div className="text-sm">Look for the install icon ⚡ in the address bar</div>
              </div>
              <div className="flex items-start">
                <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mr-4 mt-1 flex-shrink-0">Firefox</span>
                <div className="text-sm">Use the three-dot menu → "Install" or "Add to Home Screen"</div>
              </div>
              <div className="flex items-start">
                <span className="text-xs font-mono text-gray-500 tracking-widest uppercase mr-4 mt-1 flex-shrink-0">Safari</span>
                <div className="text-sm">File menu → "Add to Dock" (macOS only)</div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-4 text-xs font-mono text-gray-500 hover:text-gray-700 tracking-widest uppercase transition-colors"
          >
            ← Close Guide
          </button>
        </div>
      )}
    </div>
  );
}