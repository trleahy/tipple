'use client';

import { useEffect } from 'react';
import { setupAutoRefresh } from '@/utils/dataRefreshUtils';
import { preloadSecondaryData } from '@/utils/dataPreloader';

/**
 * Provider component that sets up automatic data refresh when users return from admin pages
 */
export default function DataRefreshProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up auto-refresh listeners
    setupAutoRefresh();

    // Preload glass types and categories in background
    setTimeout(() => {
      preloadSecondaryData();
    }, 2000); // Wait 2 seconds after app startup

    console.log('Data refresh system initialized');
  }, []);

  return <>{children}</>;
}
