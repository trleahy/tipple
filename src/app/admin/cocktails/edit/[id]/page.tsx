'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CocktailForm from '@/components/CocktailForm';
import { getAdminCocktails } from '@/utils/adminDataUtils';
import { Cocktail } from '@/types/cocktail';

export default function EditCocktailPage() {
  const params = useParams();
  const cocktailId = params.id as string;
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCocktail = async () => {
      try {
        const cocktails = await getAdminCocktails();
        const foundCocktail = cocktails.find(c => c.id === cocktailId);
        setCocktail(foundCocktail || null);
      } catch (error) {
        console.error('Error loading cocktail:', error);
        setCocktail(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (cocktailId) {
      loadCocktail();
    }
  }, [cocktailId]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏳</div>
        <div className="text-xl font-semibold text-gray-900">Loading cocktail...</div>
      </div>
    );
  }

  if (!cocktail) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍸</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Cocktail Not Found</h1>
        <p className="text-gray-600 mb-6">
          The cocktail you&apos;re trying to edit doesn&apos;t exist or may have been removed.
        </p>
        <a
          href="/admin/cocktails"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Cocktails
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Cocktail</h1>
        <p className="text-gray-600">Modify the details of &quot;{cocktail.name}&quot;</p>
      </div>

      {/* Form */}
      <CocktailForm cocktail={cocktail} isEditing={true} />
    </div>
  );
}
