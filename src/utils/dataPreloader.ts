/**
 * Data preloader utility to ensure all data types are cached on app startup
 */

import { smartCache } from '@/lib/smartCache';

/**
 * Preload all data types to ensure they are cached
 * This runs in the background and doesn't block the UI
 */
export async function preloadAllData(): Promise<void> {
  try {
    console.log('Preloading all data types for caching...');
    
    // Load all data types in parallel
    await Promise.all([
      smartCache.getCocktails(),
      smartCache.getIngredients(),
      smartCache.getGlassTypes(),
      smartCache.getCategories()
    ]);
    
    console.log('All data types preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some data types:', error);
  }
}

/**
 * Preload glass types and categories specifically
 * These are often not loaded on initial page visits
 */
export async function preloadSecondaryData(): Promise<void> {
  try {
    console.log('Preloading glass types and categories...');
    
    await Promise.all([
      smartCache.getGlassTypes(),
      smartCache.getCategories()
    ]);
    
    console.log('Glass types and categories preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload glass types and categories:', error);
  }
}
