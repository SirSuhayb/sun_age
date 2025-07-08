'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';

export default function SoldashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  const navItems = [
    {
      path: '/soldash/journey',
      label: 'Journey',
      icon: '/tabIcons/radiance.svg',
      color: '#C0AAFF',
    },
    {
      path: '/soldash/vows',
      label: 'Vows',
      icon: '/tabIcons/starburst.svg',
      color: '#76EC9F',
    },
    {
      path: '/soldash/journal',
      label: 'Journal',
      icon: '/tabIcons/galaxy.svg',
      color: '#9CC8FF',
    },
    {
      path: '/soldash/you',
      label: 'You',
      icon: '/tabIcons/outstar.svg',
      color: '#E0D09D',
    },
  ];

  const isActive = (path: string) => pathname === path;

  // Handle tab navigation with loading state
  const handleTabClick = (path: string) => {
    if (path === pathname) return; // Don't reload if already on the same tab
    
    setIsLoading(true);
    setLoadingPath(path);
    
    // Add a small delay to show loading state for better UX
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  // Reset loading state when pathname changes
  useEffect(() => {
    if (pathname === loadingPath) {
      setIsLoading(false);
      setLoadingPath(null);
    }
  }, [pathname, loadingPath]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white relative">
      {/* Background layers - similar to the interstitial */}
      <div className="absolute inset-0 z-0" style={{ background: '#FFFCF2', opacity: 0.5 }} aria-hidden="true" />
      <div className="fixed inset-0 w-full h-full z-10 pointer-events-none" style={{ background: 'url(/sol_constellation.png) center/cover no-repeat', filter: 'blur(2px)' }} aria-hidden="true" />
      <div className="absolute inset-0 z-20 backdrop-blur" style={{ background: '#FFFCF2', opacity: .5 }} aria-hidden="true" />

      {/* Navigation Header */}
      <div className="relative z-30 w-full border-b border-gray-200 bg-white">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-mono text-gray-600 hover:text-black transition-colors"
            >
              <span>←</span>
              <span>BACK</span>
            </button>

            {/* Title */}
            <div className="text-lg font-serif font-bold text-black">SOL DASH</div>

            {/* Placeholder for balance */}
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 flex-1 pb-24">
        <div className="max-w-md mx-auto w-full px-4 py-6 relative">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <PulsingStarSpinner />
                <div className="mt-2 font-mono text-xs text-gray-600">
                  NAVIGATING TO {loadingPath?.split('/').pop()?.toUpperCase()}...
                </div>
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Tab Navigation at Bottom */}
      <div className="fixed bottom-0 left-0 w-screen z-40 bg-white flex justify-center" style={{boxShadow: '0 -2px 12px 0 rgba(0,0,0,0.04)', borderTop: '1px solid #D7D7D7'}}>
        <div className="max-w-md w-full flex gap-1">
          {navItems.map((item, idx) => {
            const isLargeIcon = item.label === 'Vows' || item.label === 'Journal';
            const active = isActive(item.path);
            const isCurrentlyLoading = loadingPath === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleTabClick(item.path)}
                className={`flex-1 flex flex-col items-center pt-3 pb-6 transition-all duration-300`}
                style={{
                  borderRadius: 0,
                  borderTop: active ? `6px solid ${item.color}` : '6px solid transparent',
                  backgroundColor: '#FFFFFF',
                }}
                disabled={isLoading}
              >
                <motion.div
                  animate={{ 
                    scale: active ? 1.05 : 1,
                    filter: active ? 'brightness(1.1)' : 'brightness(1)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCurrentlyLoading ? (
                    <div className="flex items-center justify-center mb-1">
                      <PulsingStarSpinner />
                    </div>
                  ) : (
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={isLargeIcon ? 40 : 24}
                      height={isLargeIcon ? 40 : 24}
                      className="object-contain mb-1"
                    />
                  )}
                </motion.div>
                <span className="text-xs font-mono uppercase tracking-widest">
                  {isCurrentlyLoading ? 'LOADING...' : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
