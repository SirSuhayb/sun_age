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
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
          ✨ Solara is installed! Launch it from your home screen.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          📱 Add Solara to Your Home Screen
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Get quick access to track your sol age anytime!
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleInstallClick}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-lg"
        >
          {isInstallable ? '📲 Install App' : '📖 Show Install Instructions'}
        </button>
      </div>

      {(showInstructions || isIOS) && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            How to install Solara:
          </h4>
          
          {isIOS ? (
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p className="flex items-center">
                <span className="mr-2">1.</span>
                Tap the Share button 
                <span className="mx-1 text-lg">⎋</span>
                in Safari
              </p>
              <p className="flex items-center">
                <span className="mr-2">2.</span>
                Scroll down and tap "Add to Home Screen"
                <span className="mx-1 text-lg">➕</span>
              </p>
              <p className="flex items-center">
                <span className="mr-2">3.</span>
                Tap "Add" to confirm
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p><strong>Chrome/Edge:</strong> Look for the install icon ⚡ in the address bar</p>
              <p><strong>Firefox:</strong> Use the three-dot menu → "Install" or "Add to Home Screen"</p>
              <p><strong>Safari (macOS):</strong> File menu → "Add to Dock"</p>
            </div>
          )}
          
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            ← Close Instructions
          </button>
        </div>
      )}
    </div>
  );
}