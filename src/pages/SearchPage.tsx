import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw, ChefHat } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { recipes } from '../data/recipes';
import { filterRecipes } from '../services/recipeService';
import { RecipeCard } from '../components/RecipeCard';
import { FilterDrawer } from '../components/FilterDrawer';
import { IngredientPantryModal } from '../components/IngredientPantryModal';

export const SearchPage: React.FC = () => {
  const { filters, setFilters, resetFilters } = useApp();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);

  const searchResults = filterRecipes(recipes, filters);

  const activeFiltersCount =
    filters.dietary.length +
    filters.cuisines.length +
    filters.mealTypes.length +
    (filters.maxTime !== null ? 1 : 0) +
    (filters.difficulty !== null ? 1 : 0) +
    (filters.availableIngredients.length > 0 ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Search Bar */}
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-extrabold text-[#211f1c]">
          Search & Pantry Matching
        </h1>
        <p className="text-sm text-[#5e5952]">
          Find dishes by name, cuisine, dietary restrictions, or ingredients in your pantry.
        </p>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8378]"
            />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              placeholder="Search recipes, ingredients (e.g. paneer, pasta, cumin)..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[#e8ded2] text-sm text-[#211f1c] placeholder-[#8a8378] focus:outline-hidden focus:ring-2 focus:ring-[#234820] shadow-xs"
              aria-label="Search recipes or ingredients"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a8378] hover:text-[#211f1c]"
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Open Pantry Button */}
            <button
              type="button"
              onClick={() => setIsPantryOpen(true)}
              className={`px-4 py-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                filters.availableIngredients.length > 0
                  ? 'bg-[#586638] text-white border-[#586638]'
                  : 'bg-white text-[#211f1c] border-[#e8ded2] hover:border-[#586638]'
              }`}
            >
              <ChefHat size={16} />
              <span>
                Pantry {filters.availableIngredients.length > 0 ? `(${filters.availableIngredients.length})` : ''}
              </span>
            </button>

            {/* Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className={`px-4 py-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                activeFiltersCount > 0
                  ? 'bg-[#234820] text-white border-[#234820]'
                  : 'bg-white text-[#211f1c] border-[#e8ded2] hover:border-[#234820]'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Ingredients Chips Bar if user selected any */}
      {filters.availableIngredients.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#f1f4e9] border border-[#586638]/30 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#586638]">Matching with your ingredients:</span>
          {filters.availableIngredients.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#586638] text-xs font-semibold border border-[#586638]/20"
            >
              <span className="capitalize">{ing}</span>
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    availableIngredients: prev.availableIngredients.filter((i) => i !== ing),
                  }))
                }
                className="hover:text-[#b8402a]"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, availableIngredients: [] }))}
            className="text-xs text-[#b8402a] font-semibold hover:underline ml-auto"
          >
            Clear pantry
          </button>
        </div>
      )}

      {/* Results Meta & Reset */}
      <div className="flex items-center justify-between border-b border-[#e8ded2] pb-3 text-xs text-[#5e5952]">
        <div>
          <span className="font-bold text-[#211f1c]">{searchResults.length}</span> recipes found
          {filters.searchQuery && <span> for "{filters.searchQuery}"</span>}
        </div>

        {activeFiltersCount > 0 || filters.searchQuery ? (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[#b8402a] hover:underline font-semibold flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Reset all
          </button>
        ) : null}
      </div>

      {/* Results Grid */}
      {searchResults.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#e8ded2] space-y-3">
          <span className="text-5xl">🔍</span>
          <h2 className="font-serif text-xl font-bold text-[#211f1c]">No recipes found</h2>
          <p className="text-sm text-[#5e5952] max-w-sm mx-auto">
            Try checking for typos, searching for general ingredients like "tomato" or "rice", or clearing filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#234820] text-white text-xs font-bold shadow-xs hover:bg-[#1a3818] transition-colors"
          >
            Clear Filters & Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} showMatchInfo />
          ))}
        </div>
      )}

      {/* Modals */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onOpenPantry={() => setIsPantryOpen(true)}
      />

      <IngredientPantryModal
        isOpen={isPantryOpen}
        onClose={() => setIsPantryOpen(false)}
      />
    </div>
  );
};
