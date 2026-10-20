import React from 'react';
import { X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAllCuisines, recipes } from '../data/recipes';
import { filterRecipes } from '../services/recipeService';
import type { DietaryTag, MealType, Difficulty } from '../types/recipe';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPantry?: () => void;
}

const DIETARY_OPTIONS: { id: DietaryTag; label: string; desc: string }[] = [
  { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', desc: '100% plant-based' },
  { id: 'egg-free', label: 'Egg-Free', desc: 'Zero eggs' },
  { id: 'gluten-free', label: 'Gluten-Free', desc: 'No wheat / gluten' },
  { id: 'dairy-free', label: 'Dairy-Free', desc: 'No milk or butter' },
  { id: 'non-vegetarian', label: 'Non-Vegetarian', desc: 'Contains poultry/meat' },
];

const MEAL_TYPES: { id: MealType; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍲' },
  { id: 'snack', label: 'Snack', emoji: '🥟' },
  { id: 'dessert', label: 'Dessert', emoji: '🍮' },
];

const TIME_PRESETS = [
  { label: 'Any', value: null },
  { label: '≤ 15 min', value: 15 },
  { label: '≤ 30 min', value: 30 },
  { label: '≤ 45 min', value: 45 },
  { label: '≤ 60 min', value: 60 },
  { label: '≤ 90 min', value: 90 },
];

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Advanced' },
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, onOpenPantry }) => {
  const { filters, setFilters, resetFilters } = useApp();
  const allCuisines = getAllCuisines();

  if (!isOpen) return null;

  // Real-time calculation of matched recipes with current filters
  const currentMatches = filterRecipes(recipes, filters);

  const toggleDietary = (tag: DietaryTag) => {
    setFilters((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(tag)
        ? prev.dietary.filter((t) => t !== tag)
        : [...prev.dietary, tag],
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const toggleMealType = (meal: MealType) => {
    setFilters((prev) => ({
      ...prev,
      mealTypes: prev.mealTypes.includes(meal)
        ? prev.mealTypes.filter((m) => m !== meal)
        : [...prev.mealTypes, meal],
    }));
  };

  const activeCount =
    filters.dietary.length +
    filters.cuisines.length +
    filters.mealTypes.length +
    (filters.maxTime !== null ? 1 : 0) +
    (filters.difficulty !== null ? 1 : 0) +
    (filters.availableIngredients.length > 0 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#faf7f2] h-full shadow-2xl flex flex-col z-10 border-l border-[#e8ded2] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e8ded2] bg-[#ffffff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#234820] text-white flex items-center justify-center">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#211f1c]">Filters & Preferences</h2>
              <p className="text-xs text-[#5e5952]">
                {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} applied` : 'Tailor your discovery'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1 text-xs font-semibold text-[#b8402a] hover:bg-[#fcedea] rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-[#5e5952] hover:text-[#211f1c] hover:bg-[#f0e8de] flex items-center justify-center transition-colors"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* 1. Dietary Restrictions (Hard Constraints) */}
          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#211f1c]">
                Dietary Requirements
              </h3>
              <span className="text-[11px] text-[#234820] font-medium">Strict hard constraint</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const isSelected = filters.dietary.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleDietary(opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#234820] text-white border-[#234820] shadow-xs'
                        : 'bg-white text-[#211f1c] border-[#e8ded2] hover:border-[#234820]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold leading-tight">{opt.label}</span>
                      {isSelected && <Check size={13} className="text-white" />}
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${
                        isSelected ? 'text-white/80' : 'text-[#8a8378]'
                      }`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Meal Type */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#211f1c] mb-2">
              Meal Category
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {MEAL_TYPES.map((m) => {
                const isSelected = filters.mealTypes.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMealType(m.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#234820] text-white border-[#234820] shadow-xs'
                        : 'bg-white text-[#5e5952] border-[#e8ded2] hover:border-[#234820]/40'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Maximum Total Cooking Time */}
          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#211f1c]">
                Max Time (Prep + Cook)
              </h3>
              <span className="text-xs text-[#5e5952] font-semibold">
                {filters.maxTime !== null ? `${filters.maxTime} minutes` : 'Any duration'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_PRESETS.map((t) => {
                const isSelected = filters.maxTime === t.value;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, maxTime: t.value }))}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? 'bg-[#234820] text-white border-[#234820] shadow-xs'
                        : 'bg-white text-[#5e5952] border-[#e8ded2] hover:border-[#234820]/40'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Cuisines */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#211f1c] mb-2">
              Cuisine
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {allCuisines.map((c) => {
                const isSelected = filters.cuisines.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCuisine(c)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#234820] text-white border-[#234820]'
                        : 'bg-white text-[#5e5952] border-[#e8ded2] hover:border-[#234820]/40'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5. Difficulty */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#211f1c] mb-2">
              Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => {
                const isSelected = filters.difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        difficulty: prev.difficulty === d.id ? null : d.id,
                      }))
                    }
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? 'bg-[#234820] text-white border-[#234820] shadow-xs'
                        : 'bg-white text-[#5e5952] border-[#e8ded2] hover:border-[#234820]/40'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 6. Available Ingredients Pantry Link */}
          {onOpenPantry && (
            <div className="p-3.5 rounded-xl bg-[#eaf3ea] border border-[#234820]/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#234820]">Use What I Have (Pantry)</p>
                <p className="text-[11px] text-[#586638]">
                  {filters.availableIngredients.length > 0
                    ? `${filters.availableIngredients.length} ingredients selected`
                    : 'Match dishes with ingredients at home'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPantry();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#234820] text-white text-xs font-semibold shadow-xs hover:bg-[#1a3818] transition-colors"
              >
                Open Pantry
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#e8ded2] bg-[#ffffff] flex items-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 py-2.5 rounded-xl border border-[#e8ded2] text-xs font-bold text-[#5e5952] hover:bg-[#f0e8de] transition-colors"
          >
            Reset All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[2] py-2.5 rounded-xl bg-[#234820] text-white text-xs font-bold shadow-sm hover:bg-[#1a3818] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Show {currentMatches.length} Recipes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
