import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Dices, RotateCw, SlidersHorizontal, ChefHat, Zap, Coffee, Moon, IceCream } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { recipes } from '../data/recipes';
import { filterRecipes, selectRandomRecipe } from '../services/recipeService';
import type { Recipe, MealType } from '../types/recipe';

interface SurpriseMachineProps {
  onOpenFilters: () => void;
  onOpenPantry: () => void;
  onRecipeDiscovered: (recipe: Recipe) => void;
}

export const SurpriseMachine: React.FC<SurpriseMachineProps> = ({
  onOpenFilters,
  onOpenPantry,
  onRecipeDiscovered,
}) => {
  const {
    filters,
    setFilters,
    resetFilters,
    recentlyDiscoveredIds,
    addRecentlyDiscoveredId,
    addToHistory,
    isRolling,
    setIsRolling,
  } = useApp();

  const [rollingTitle, setRollingTitle] = useState('Finding the perfect meal...');

  // Pool of recipes matching current filters
  const eligiblePool = filterRecipes(recipes, filters);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#234820', '#b8402a', '#586638', '#d97706'],
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti fail silently if canvas unsupported
    }
  };

  const handleRoll = (relaxedMode = false) => {
    if (isRolling) return;

    let targetPool = eligiblePool;

    // Genuine surprise mode: relax non-essential filters (time, mealType, difficulty) but KEEP hard dietary constraints!
    if (relaxedMode) {
      targetPool = filterRecipes(recipes, {
        ...filters,
        mealTypes: [],
        maxTime: null,
        difficulty: null,
        availableIngredients: [],
      });
    }

    if (targetPool.length === 0) return;

    setIsRolling(true);

    // Rapid title flicker animation during the roll
    const titles = [
      'Stirring the pot...',
      'Chopping fresh herbs...',
      'Heating the pan...',
      'Tasting for seasoning...',
      'Plating perfection...',
    ];
    let step = 0;
    const interval = setInterval(() => {
      setRollingTitle(titles[step % titles.length]);
      step++;
    }, 110);

    setTimeout(() => {
      clearInterval(interval);
      const chosen = selectRandomRecipe(targetPool, recentlyDiscoveredIds, true);
      setIsRolling(false);

      if (chosen) {
        addRecentlyDiscoveredId(chosen.id);
        addToHistory(chosen.id);
        onRecipeDiscovered(chosen);
        triggerConfetti();
      }
    }, 700);
  };

  const rollCategory = (mealType: MealType) => {
    setFilters((prev) => ({ ...prev, mealTypes: [mealType] }));
    setTimeout(() => {
      const catPool = filterRecipes(recipes, { ...filters, mealTypes: [mealType] });
      const chosen = selectRandomRecipe(catPool, recentlyDiscoveredIds, true);
      if (chosen) {
        addRecentlyDiscoveredId(chosen.id);
        addToHistory(chosen.id);
        onRecipeDiscovered(chosen);
        triggerConfetti();
      }
    }, 50);
  };

  const rollQuickMeals = () => {
    setFilters((prev) => ({ ...prev, maxTime: 30 }));
    setTimeout(() => {
      const quickPool = filterRecipes(recipes, { ...filters, maxTime: 30 });
      const chosen = selectRandomRecipe(quickPool, recentlyDiscoveredIds, true);
      if (chosen) {
        addRecentlyDiscoveredId(chosen.id);
        addToHistory(chosen.id);
        onRecipeDiscovered(chosen);
        triggerConfetti();
      }
    }, 50);
  };

  const activeFiltersCount =
    filters.dietary.length +
    filters.cuisines.length +
    filters.mealTypes.length +
    (filters.maxTime !== null ? 1 : 0) +
    (filters.difficulty !== null ? 1 : 0) +
    (filters.availableIngredients.length > 0 ? 1 : 0);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#ffffff] to-[#faf7f2] border border-[#e8ded2] p-6 sm:p-10 shadow-sm text-center">
      {/* Decorative background glows */}
      <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-[#eaf3ea]/70 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#fcedea]/70 blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-6">
        {/* Subhead / Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf3ea] border border-[#234820]/20 text-[#234820] text-xs font-bold tracking-wide">
          <Dices size={14} className="stroke-[2.5]" />
          <span>SPONTANEOUS DISCOVERY ENGINE</span>
        </div>

        {/* Hero Heading */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#211f1c] tracking-tight leading-[1.15]">
            What should you cook today?
          </h1>
          <p className="text-sm sm:text-base text-[#5e5952] max-w-lg mx-auto">
            Discover an unexpected, chef-curated recipe with a single tap. Filter by diet, available ingredients, or let pure chance decide.
          </p>
        </div>

        {/* Current Pool Status Badge */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-[#5e5952]">
          <span className="font-semibold text-[#211f1c]">
            {eligiblePool.length} of {recipes.length} recipes
          </span>
          <span>eligible based on your preferences</span>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#b8402a] font-semibold underline hover:text-[#943220] transition-colors"
            >
              (reset filters)
            </button>
          )}
        </div>

        {/* Primary Surprise Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleRoll(false)}
            disabled={isRolling || eligiblePool.length === 0}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#234820] text-white text-base sm:text-lg font-bold shadow-md hover:bg-[#1a3818] hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 select-none group"
            aria-label="Discover a random recipe"
          >
            {isRolling ? (
              <>
                <RotateCw size={22} className="animate-spin text-white" />
                <span>{rollingTitle}</span>
              </>
            ) : (
              <>
                <Dices size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Surprise Me</span>
              </>
            )}
          </button>

          {/* Genuine Surprise Mode Button */}
          <button
            type="button"
            onClick={() => handleRoll(true)}
            disabled={isRolling}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white border border-[#e8ded2] text-[#211f1c] text-sm font-bold shadow-xs hover:border-[#234820] hover:bg-[#f0e8de]/30 transition-all flex items-center justify-center gap-2 group"
            title="Relaxes time & category limits while preserving your strict dietary requirements"
          >
            <Sparkles size={16} className="text-[#d97706]" />
            <span>Wild Surprise Mode</span>
          </button>

          {/* Filters Button */}
          <button
            type="button"
            onClick={onOpenFilters}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white border border-[#e8ded2] text-[#5e5952] hover:text-[#211f1c] hover:border-[#234820]/40 text-sm font-semibold transition-all flex items-center justify-center gap-2 relative shadow-2xs"
            aria-label="Open filter settings"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#234820] text-white text-[11px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Empty State warning if filters are too tight */}
        {eligiblePool.length === 0 && (
          <div className="p-4 rounded-2xl bg-[#fcedea] border border-[#b8402a]/30 text-center space-y-2 animate-in fade-in duration-200">
            <p className="text-sm font-bold text-[#b8402a]">
              No recipes match your active filter combination!
            </p>
            <p className="text-xs text-[#5e5952]">
              Try relaxing a cuisine, increasing cook time, or clearing ingredients.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-1.5 rounded-xl bg-[#b8402a] text-white text-xs font-bold shadow-xs hover:bg-[#943220] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Quick Discovery Presets */}
        <div className="pt-4 border-t border-[#f0e8de]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8a8378] mb-3">
            Quick Discovery Presets
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={rollQuickMeals}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#e8ded2] text-xs font-medium text-[#211f1c] hover:border-[#234820] hover:bg-[#eaf3ea]/50 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Zap size={13} className="text-[#d97706]" />
              <span>≤ 30 Min Quick</span>
            </button>
            <button
              type="button"
              onClick={() => rollCategory('breakfast')}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#e8ded2] text-xs font-medium text-[#211f1c] hover:border-[#234820] hover:bg-[#eaf3ea]/50 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Coffee size={13} className="text-[#586638]" />
              <span>Breakfast Idea</span>
            </button>
            <button
              type="button"
              onClick={() => rollCategory('dinner')}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#e8ded2] text-xs font-medium text-[#211f1c] hover:border-[#234820] hover:bg-[#eaf3ea]/50 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Moon size={13} className="text-[#234820]" />
              <span>Dinner Comfort</span>
            </button>
            <button
              type="button"
              onClick={() => rollCategory('dessert')}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#e8ded2] text-xs font-medium text-[#211f1c] hover:border-[#234820] hover:bg-[#eaf3ea]/50 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <IceCream size={13} className="text-[#b8402a]" />
              <span>Sweet Treat</span>
            </button>
            <button
              type="button"
              onClick={onOpenPantry}
              className="px-3 py-1.5 rounded-xl bg-[#f1f4e9] border border-[#586638]/30 text-xs font-bold text-[#586638] hover:bg-[#586638] hover:text-white transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ChefHat size={13} />
              <span>Use What I Have</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
