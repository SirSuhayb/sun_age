'use client';

import { PROJECT_TITLE } from "~/lib/constants";
import SunCycleAge from '~/components/SunCycleAge';
import { useEffect } from 'react';

export default function MobileMainPage() {
  useEffect(() => {
    // Mobile-specific initialization
    if (typeof window !== 'undefined') {
      document.title = PROJECT_TITLE;
      
      // Mobile app viewport configuration
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
      
      // iOS-specific mobile web app configuration
      const metaTags = [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-touch-fullscreen', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ];
      
      metaTags.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
    }
  }, []);

  return (
    <div className="min-h-screen">
      <SunCycleAge />
    </div>
  );
}