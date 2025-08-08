/**
 * Smart caching layer that manages data between local cache and Supabase
 * Reduces API calls while maintaining data freshness
 */

import { localDatabase } from './localDatabase';
import { adminDataStorage } from './storage';
import { Cocktail, Ingredient, GlassType, Category } from '@/types/cocktail';
import { cocktails as staticCocktails } from '@/data/cocktails';
import { ingredients as staticIngredients, glassTypes as staticGlassTypes } from '@/data/ingredients';
import { initialCategories as staticCategories } from '@/data/categories';

class SmartCache {
  private isRefreshing = false;
  private refreshPromises: Map<string, Promise<unknown>> = new Map();

  /**
   * Get cocktails with smart caching
   */
  async getCocktails(): Promise<Cocktail[]> {
    try {
      // First, try to get from local cache
      const { data: cachedCocktails, isFresh } = await localDatabase.getCocktails();
      
      // If we have fresh cached data, return it immediately
      if (isFresh && cachedCocktails.length > 0) {
        console.log(`Using fresh cached cocktails: ${cachedCocktails.length} items`);
        return cachedCocktails;
      }
      
      // If we have stale cached data, return it but refresh in background
      if (cachedCocktails.length > 0) {
        console.log(`Using stale cached cocktails: ${cachedCocktails.length} items, refreshing in background`);
        this.refreshCocktailsInBackground();
        return cachedCocktails;
      }
      
      // No cached data, fetch from Supabase
      console.log('No cached cocktails found, fetching from Supabase');
      return await this.fetchAndCacheCocktails();
      
    } catch (error) {
      console.error('Error in smart cache getCocktails:', error);
      
      // Fallback to any cached data we might have
      try {
        const { data: fallbackData } = await localDatabase.getCocktails();
        if (fallbackData.length > 0) {
          console.log('Using fallback cached data');
          return fallbackData;
        }
      } catch (fallbackError) {
        console.error('Fallback cache also failed:', fallbackError);
      }
      
      // Final fallback to static data
      console.log('Using static cocktails as final fallback');
      return staticCocktails;
    }
  }

  /**
   * Get ingredients with smart caching
   */
  async getIngredients(): Promise<Ingredient[]> {
    try {
      // First, try to get from local cache
      const { data: cachedIngredients, isFresh } = await localDatabase.getIngredients();
      
      // If we have fresh cached data, return it immediately
      if (isFresh && cachedIngredients.length > 0) {
        console.log(`Using fresh cached ingredients: ${cachedIngredients.length} items`);
        return cachedIngredients;
      }
      
      // If we have stale cached data, return it but refresh in background
      if (cachedIngredients.length > 0) {
        console.log(`Using stale cached ingredients: ${cachedIngredients.length} items, refreshing in background`);
        this.refreshIngredientsInBackground();
        return cachedIngredients;
      }
      
      // No cached data, fetch from Supabase
      console.log('No cached ingredients found, fetching from Supabase');
      return await this.fetchAndCacheIngredients();
      
    } catch (error) {
      console.error('Error in smart cache getIngredients:', error);
      
      // Fallback to any cached data we might have
      try {
        const { data: fallbackData } = await localDatabase.getIngredients();
        if (fallbackData.length > 0) {
          console.log('Using fallback cached ingredients');
          return fallbackData;
        }
      } catch (fallbackError) {
        console.error('Fallback cache also failed:', fallbackError);
      }
      
      // Final fallback to static data
      console.log('Using static ingredients as final fallback');
      return staticIngredients;
    }
  }

  /**
   * Get glass types with smart caching
   */
  async getGlassTypes(): Promise<GlassType[]> {
    try {
      const { data: cachedGlassTypes, isFresh } = await localDatabase.getGlassTypes();
      
      if (isFresh && cachedGlassTypes.length > 0) {
        console.log(`Using fresh cached glass types: ${cachedGlassTypes.length} items`);
        return cachedGlassTypes;
      }
      
      if (cachedGlassTypes.length > 0) {
        console.log(`Using stale cached glass types: ${cachedGlassTypes.length} items, refreshing in background`);
        this.refreshGlassTypesInBackground();
        return cachedGlassTypes;
      }
      
      console.log('No cached glass types found, fetching from Supabase');
      return await this.fetchAndCacheGlassTypes();
      
    } catch (error) {
      console.error('Error in smart cache getGlassTypes:', error);

      // Fallback to any cached data we might have
      try {
        const { data: fallbackData } = await localDatabase.getGlassTypes();
        if (fallbackData.length > 0) {
          console.log('Using fallback cached glass types data');
          return fallbackData;
        }
      } catch (fallbackError) {
        console.error('Fallback glass types cache also failed:', fallbackError);
      }

      // Final fallback to static data
      console.log('Using static glass types as final fallback');
      return staticGlassTypes;
    }
  }

  /**
   * Get categories with smart caching
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data: cachedCategories, isFresh } = await localDatabase.getCategories();

      if (isFresh && cachedCategories.length > 0) {
        console.log(`Using fresh cached categories: ${cachedCategories.length} items`);
        return cachedCategories;
      }

      if (cachedCategories.length > 0) {
        console.log(`Using stale cached categories: ${cachedCategories.length} items, refreshing in background`);
        this.refreshCategoriesInBackground();
        return cachedCategories;
      }

      console.log('No cached categories found, fetching from Supabase');
      return await this.fetchAndCacheCategories();

    } catch (error) {
      console.error('Error in smart cache getCategories:', error);

      // Fallback to any cached data we might have
      try {
        const { data: fallbackData } = await localDatabase.getCategories();
        if (fallbackData.length > 0) {
          console.log('Using fallback cached categories');
          return fallbackData;
        }
      } catch (fallbackError) {
        console.error('Fallback categories cache also failed:', fallbackError);
      }

      // Final fallback to static data
      console.log('Using static categories as final fallback');
      return staticCategories;
    }
  }

  /**
   * Fetch cocktails from Supabase and cache them
   */
  private async fetchAndCacheCocktails(): Promise<Cocktail[]> {
    const cacheKey = 'cocktails';
    
    // Prevent multiple simultaneous requests
    if (this.refreshPromises.has(cacheKey)) {
      return await this.refreshPromises.get(cacheKey)! as Cocktail[];
    }
    
    const promise = this.doFetchAndCacheCocktails();
    this.refreshPromises.set(cacheKey, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.refreshPromises.delete(cacheKey);
    }
  }

  private async doFetchAndCacheCocktails(): Promise<Cocktail[]> {
    try {
      const cocktails = await adminDataStorage.getCocktails();
      await localDatabase.saveCocktails(cocktails);
      console.log(`Fetched and cached ${cocktails.length} cocktails from Supabase`);
      return cocktails;
    } catch (error) {
      console.error('Failed to fetch cocktails from Supabase:', error);

      // Fallback to static data
      console.log('Falling back to static cocktail data');
      try {
        await localDatabase.saveCocktails(staticCocktails);
        console.log(`Using static cocktail data: ${staticCocktails.length} items`);
        return staticCocktails;
      } catch (cacheError) {
        console.error('Failed to cache static cocktails:', cacheError);
        return staticCocktails;
      }
    }
  }

  /**
   * Fetch ingredients from Supabase and cache them
   */
  private async fetchAndCacheIngredients(): Promise<Ingredient[]> {
    const cacheKey = 'ingredients';
    
    if (this.refreshPromises.has(cacheKey)) {
      return await this.refreshPromises.get(cacheKey)! as Ingredient[];
    }
    
    const promise = this.doFetchAndCacheIngredients();
    this.refreshPromises.set(cacheKey, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      this.refreshPromises.delete(cacheKey);
    }
  }

  private async doFetchAndCacheIngredients(): Promise<Ingredient[]> {
    try {
      const ingredients = await adminDataStorage.getIngredients();
      await localDatabase.saveIngredients(ingredients);
      console.log(`Fetched and cached ${ingredients.length} ingredients from Supabase`);
      return ingredients;
    } catch (error) {
      console.error('Failed to fetch ingredients from Supabase:', error);

      // Fallback to static data
      console.log('Falling back to static ingredient data');
      try {
        await localDatabase.saveIngredients(staticIngredients);
        console.log(`Using static ingredient data: ${staticIngredients.length} items`);
        return staticIngredients;
      } catch (cacheError) {
        console.error('Failed to cache static ingredients:', cacheError);
        return staticIngredients;
      }
    }
  }

  /**
   * Fetch glass types from Supabase and cache them
   */
  private async fetchAndCacheGlassTypes(): Promise<GlassType[]> {
    try {
      const glassTypes = await adminDataStorage.getGlassTypes();
      await localDatabase.saveGlassTypes(glassTypes);
      console.log(`Fetched and cached ${glassTypes.length} glass types from Supabase`);
      return glassTypes;
    } catch (error) {
      console.error('Failed to fetch glass types from Supabase:', error);

      // Fallback to static data
      console.log('Falling back to static glass types data');
      try {
        await localDatabase.saveGlassTypes(staticGlassTypes);
        console.log(`Using static glass types data: ${staticGlassTypes.length} items`);
        return staticGlassTypes;
      } catch (cacheError) {
        console.error('Failed to cache static glass types:', cacheError);
        return staticGlassTypes;
      }
    }
  }

  /**
   * Fetch categories from Supabase and cache them
   */
  private async fetchAndCacheCategories(): Promise<Category[]> {
    try {
      const categories = await adminDataStorage.getCategories();
      await localDatabase.saveCategories(categories);
      console.log(`Fetched and cached ${categories.length} categories from Supabase`);
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories from Supabase:', error);

      // Fallback to static data
      console.log('Falling back to static category data');
      try {
        await localDatabase.saveCategories(staticCategories);
        console.log(`Using static category data: ${staticCategories.length} items`);
        return staticCategories;
      } catch (cacheError) {
        console.error('Failed to cache static categories:', cacheError);
        return staticCategories;
      }
    }
  }

  /**
   * Background refresh methods (don't block UI)
   */
  private refreshCocktailsInBackground(): void {
    if (this.isRefreshing) return;
    
    setTimeout(async () => {
      try {
        await this.fetchAndCacheCocktails();
      } catch (error) {
        console.error('Background cocktail refresh failed:', error);
      }
    }, 100); // Small delay to not block UI
  }

  private refreshIngredientsInBackground(): void {
    if (this.isRefreshing) return;
    
    setTimeout(async () => {
      try {
        await this.fetchAndCacheIngredients();
      } catch (error) {
        console.error('Background ingredient refresh failed:', error);
      }
    }, 100);
  }

  private refreshGlassTypesInBackground(): void {
    if (this.isRefreshing) return;
    
    setTimeout(async () => {
      try {
        await this.fetchAndCacheGlassTypes();
      } catch (error) {
        console.error('Background glass types refresh failed:', error);
      }
    }, 100);
  }

  private refreshCategoriesInBackground(): void {
    if (this.isRefreshing) return;
    
    setTimeout(async () => {
      try {
        await this.fetchAndCacheCategories();
      } catch (error) {
        console.error('Background categories refresh failed:', error);
      }
    }, 100);
  }

  /**
   * Force refresh all data from Supabase
   */
  async forceRefreshAll(): Promise<void> {
    console.log('Force refreshing all data from Supabase');
    this.isRefreshing = true;

    try {
      await Promise.all([
        this.fetchAndCacheCocktails(),
        this.fetchAndCacheIngredients(),
        this.fetchAndCacheGlassTypes(),
        this.fetchAndCacheCategories()
      ]);
      console.log('Force refresh completed successfully');
    } catch (error) {
      console.error('Force refresh failed:', error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Force refresh glass types from Supabase
   */
  async forceRefreshGlassTypes(): Promise<void> {
    console.log('Force refreshing glass types from Supabase');
    try {
      await this.fetchAndCacheGlassTypes();
      console.log('Glass types force refresh completed successfully');
    } catch (error) {
      console.error('Glass types force refresh failed:', error);
      throw error;
    }
  }

  /**
   * Force refresh categories from Supabase
   */
  async forceRefreshCategories(): Promise<void> {
    console.log('Force refreshing categories from Supabase');
    try {
      await this.fetchAndCacheCategories();
      console.log('Categories force refresh completed successfully');
    } catch (error) {
      console.error('Categories force refresh failed:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await localDatabase.clearCache();
    console.log('All cache cleared');
  }

  /**
   * Invalidate glass types cache
   */
  async invalidateGlassTypesCache(): Promise<void> {
    await localDatabase.clearGlassTypesCache();
    console.log('Glass types cache invalidated');
  }

  /**
   * Invalidate categories cache
   */
  async invalidateCategoriesCache(): Promise<void> {
    await localDatabase.clearCategoriesCache();
    console.log('Categories cache invalidated');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await localDatabase.getCacheStats();
  }
}

// Export singleton instance
export const smartCache = new SmartCache();
