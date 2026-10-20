import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SurpriseMachine } from '../components/SurpriseMachine';
import { RecipeCard } from '../components/RecipeCard';
import { FilterDrawer } from '../components/FilterDrawer';
import { IngredientPantryModal } from '../components/IngredientPantryModal';
import { useApp } from '../context/AppContext';
import { recipes } from '../data/recipes';
import { filterRecipes } from '../services/recipeService';
import type { DietaryTag } from '../types/recipe';
import { Sparkles, ArrowRight, Heart, ChefHat, RotateCcw, SlidersHorizontal } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filters,
    setFilters,
    resetFilters,
    discoveredRecipe,
    setDiscoveredRecipe,
    favorites,
    toggleFavorite,
    setActiveCookingRecipe,
  } = useApp();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);

  const eligibleRecipes = filterRecipes(recipes, filters);

  const quickDietaryChips: { tag: DietaryTag; label: string }[] = [
    { tag: 'vegetarian', label: '🌱 Vegetarian' },
    { tag: 'vegan', label: '🌿 Vegan' },
    { tag: 'gluten-free', label: '🌾 Gluten-Free' },
    { tag: 'non-vegetarian', label: '🍗 Non-Veg' },
  ];

  const toggleDietaryChip = (tag: DietaryTag) => {
    setFilters((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(tag)
        ? prev.dietary.filter((t) => t !== tag)
        : [...prev.dietary, tag],
    }));
  };

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Central Surprise Engine */}
      <SurpriseMachine
        onOpenFilters={() => setIsFilterOpen(true)}
        onOpenPantry={() => setIsPantryOpen(true)}
        onRecipeDiscovered={(recipe) => setDiscoveredRecipe(recipe)}
      />

      {/* 2. Discovered Recipe Spotlight Showcase (Appears when user rolls) */}
      {discoveredRecipe && (
        <section
          aria-labelledby="spotlight-title"
          className="rounded-3xl bg-white border-2 border-[#234820] p-5 sm:p-8 shadow-lg relative overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="absolute top-0 right-0 bg-[#234820] text-white px-4 py-1.5 rounded-bl-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles size={13} className="text-[#d97706]" />
            Your Discovery!
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Image Thumbnail */}
            <div className="w-full md:w-5/12 aspect-[4/3] rounded-2xl overflow-hidden bg-[#f4ede4] shrink-0 border border-[#e8ded2] relative group">
              {discoveredRecipe.imageUrl ? (
                <img
                  src={discoveredRecipe.imageUrl}
                  alt={discoveredRecipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  {discoveredRecipe.imageFallbackEmoji || '🍲'}
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/60 text-white text-xs font-bold backdrop-blur-md">
                {discoveredRecipe.prepTime + discoveredRecipe.cookTime} mins total
              </div>
            </div>

            {/* Description & Interactive Controls */}
            <div className="flex-1 space-y-4 text-left w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#586638]">
                <span>{discoveredRecipe.cuisine} Cuisine</span>
                <span>•</span>
                <span className="capitalize">{discoveredRecipe.difficulty} difficulty</span>
                <span>•</span>
                <span>{discoveredRecipe.servings} Servings</span>
              </div>

              <h2
                id="spotlight-title"
                className="font-serif text-2xl sm:text-3xl font-extrabold text-[#211f1c]"
              >
                {discoveredRecipe.name}
              </h2>

              <p className="text-sm text-[#5e5952] leading-relaxed">
                {discoveredRecipe.description}
              </p>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {discoveredRecipe.dietaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#eaf3ea] text-[#234820] border border-[#234820]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/recipe/${discoveredRecipe.id}`)}
                  className="px-5 py-2.5 rounded-xl bg-[#234820] text-white text-sm font-bold shadow-xs hover:bg-[#1a3818] transition-all flex items-center gap-2"
                >
                  <span>View Full Recipe</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCookingRecipe(discoveredRecipe)}
                  className="px-4 py-2.5 rounded-xl bg-[#fcedea] text-[#b8402a] border border-[#b8402a]/30 text-sm font-bold hover:bg-[#b8402a] hover:text-white transition-all flex items-center gap-1.5"
                >
                  <ChefHat size={16} />
                  <span>Cook Now (Step-by-Step)</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(discoveredRecipe.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    favorites.includes(discoveredRecipe.id)
                      ? 'bg-[#b8402a] text-white border-[#b8402a]'
                      : 'bg-white border-[#e8ded2] text-[#5e5952] hover:text-[#b8402a]'
                  }`}
                  aria-label="Save recipe"
                >
                  <Heart
                    size={18}
                    className={favorites.includes(discoveredRecipe.id) ? 'fill-white stroke-white' : ''}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Quick Dietary Filter Bar */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#e8ded2]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#211f1c]">
            Quick Diet:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickDietaryChips.map((chip) => {
              const active = filters.dietary.includes(chip.tag);
              return (
                <button
                  key={chip.tag}
                  type="button"
                  onClick={() => toggleDietaryChip(chip.tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-[#234820] text-white border-[#234820] shadow-xs'
                      : 'bg-[#faf7f2] text-[#5e5952] border-[#e8ded2] hover:border-[#234820]/40'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPantryOpen(true)}
            className="text-xs font-bold text-[#586638] hover:underline"
          >
            {filters.availableIngredients.length > 0
              ? `Pantry (${filters.availableIngredients.length})`
              : '+ Use Ingredients'}
          </button>
          <span className="text-[#e8ded2]">|</span>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="text-xs font-bold text-[#234820] hover:underline flex items-center gap-1"
          >
            <SlidersHorizontal size={13} />
            All Filters
          </button>
        </div>
      </section>

      {/* 4. Filtered Catalog Grid */}
      <section aria-labelledby="catalog-heading" className="space-y-5">
        <div className="flex items-baseline justify-between border-b border-[#e8ded2] pb-3">
          <div>
            <h2 id="catalog-heading" className="font-serif text-2xl font-bold text-[#211f1c]">
              Explore Eligible Recipes
            </h2>
            <p className="text-xs text-[#5e5952]">
              Showing {eligibleRecipes.length} of {recipes.length} dishes in our kitchen
            </p>
          </div>

          {filters.dietary.length > 0 || filters.cuisines.length > 0 ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#b8402a] hover:underline flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Reset filters
            </button>
          ) : null}
        </div>

        {/* Empty State */}
        {eligibleRecipes.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#e8ded2] space-y-3">
            <span className="text-5xl">🍲</span>
            <h3 className="font-serif text-xl font-bold text-[#211f1c]">
              No dishes match your current filter settings
            </h3>
            <p className="text-sm text-[#5e5952] max-w-md mx-auto">
              You may have combined mutually exclusive dietary filters or chosen a time limit that is too restrictive.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#234820] text-white text-xs font-bold shadow-xs hover:bg-[#1a3818] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibleRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showMatchInfo />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onOpenPantry={() => setIsPantryOpen(true)}
      />

      <IngredientPantryModal
        isOpen={isPantryOpen}
        onClose={() => setIsPantryOpen(false)}
        onSurpriseMeWithIngredients={() => {
          // Trigger a roll matching ingredients
          const matched = filterRecipes(recipes, filters);
          if (matched.length > 0) {
            const picked = matched[Math.floor(Math.random() * matched.length)];
            setDiscoveredRecipe(picked);
          }
        }}
      />
    </div>
  );
};
