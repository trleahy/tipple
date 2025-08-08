'use client';

import CocktailForm from '@/components/CocktailForm';

export default function NewCocktailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Cocktail</h1>
        <p className="text-gray-600">Create a new cocktail recipe for your collection</p>
      </div>

      {/* Form */}
      <CocktailForm />
    </div>
  );
}
