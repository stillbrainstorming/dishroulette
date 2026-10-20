import React, { useState } from 'react';
import { X, Plus, Sparkles, ChefHat, Check, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { recipes } from '../data/recipes';
import { filterRecipes } from '../services/recipeService';

interface IngredientPantryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSurpriseMeWithIngredients?: () => void;
}

const COMMON_STAPLES = [
  'Tomatoes',
  'Onions',
  'Garlic',
  'Ginger',
  'Eggs',
  'Potatoes',
  'Rice',
  'Pasta',
  'Spinach',
  'Chickpeas',
  'Paneer',
  'Chicken',
  'Lentils',
  'Mushrooms',
  'Avocado',
  'Cheese',
  'Bread',
  'Butter',
  'Milk',
  'Yogurt',
  'Green Chilies',
  'Lemon',
];

export const IngredientPantryModal: React.FC<IngredientPantryModalProps> = ({
  isOpen,
  onClose,
  onSurpriseMeWithIngredients,
}) => {
  const { filters, setFilters } = useApp();
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const currentIngredients = filters.availableIngredients;

  const addIngredient = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !currentIngredients.includes(trimmed)) {
      setFilters((prev) => ({
        ...prev,
        availableIngredients: [...prev.availableIngredients, trimmed],
      }));
    }
  };

  const removeIngredient = (name: string) => {
    setFilters((prev) => ({
      ...prev,
      availableIngredients: prev.availableIngredients.filter((i) => i !== name),
    }));
  };

  const clearAllIngredients = () => {
    setFilters((prev) => ({ ...prev, availableIngredients: [] }));
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      addIngredient(customInput);
      setCustomInput('');
    }
  };

  const matchingRecipes = filterRecipes(recipes, filters);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#faf7f2] rounded-3xl shadow-2xl border border-[#e8ded2] overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#e8ded2] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#586638] text-white flex items-center justify-center">
              <ChefHat size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#211f1c]">
                Use What I Have (Pantry)
              </h2>
              <p className="text-xs text-[#5e5952]">
                Select ingredients you have on hand to find matching dishes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#5e5952] hover:text-[#211f1c] hover:bg-[#f0e8de] flex items-center justify-center transition-colors"
            aria-label="Close pantry modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Custom Ingredient Input Bar */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type an ingredient (e.g. cauliflower, cream, lime)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e8ded2] bg-white text-sm text-[#211f1c] placeholder-[#8a8378] focus:outline-hidden focus:ring-2 focus:ring-[#234820] shadow-2xs"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#234820] text-white text-sm font-semibold hover:bg-[#1a3818] disabled:opacity-50 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus size={16} />
              Add
            </button>
          </form>

          {/* Active Ingredients Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#211f1c]">
                Your Selected Ingredients ({currentIngredients.length})
              </span>
              {currentIngredients.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllIngredients}
                  className="text-xs text-[#b8402a] hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Clear all
                </button>
              )}
            </div>

            {currentIngredients.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#e8ded2] text-center text-xs text-[#8a8378]">
                No ingredients added yet. Tap common staples below or type custom ones above!
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-white border border-[#e8ded2]">
                {currentIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eaf3ea] text-[#234820] text-xs font-semibold border border-[#234820]/30 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <Check size={12} className="stroke-[3]" />
                    <span className="capitalize">{ing}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(ing)}
                      className="hover:text-[#b8402a] transition-colors ml-0.5"
                      aria-label={`Remove ${ing}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Common Staples Quick Selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#211f1c] mb-2">
              Quick Tap Staples
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_STAPLES.map((staple) => {
                const isSelected = currentIngredients.includes(staple.toLowerCase());
                return (
                  <button
                    key={staple}
                    type="button"
                    onClick={() =>
                      isSelected
                        ? removeIngredient(staple.toLowerCase())
                        : addIngredient(staple.toLowerCase())
                    }
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#234820] text-white border-[#234820] shadow-xs'
                        : 'bg-white text-[#5e5952] border-[#e8ded2] hover:border-[#234820]/40 hover:bg-[#f0e8de]/40'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {staple}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e8ded2] bg-white flex items-center justify-between gap-3">
          <div className="text-xs font-medium text-[#5e5952]">
            <span className="font-bold text-[#234820]">{matchingRecipes.length}</span> recipes match
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#e8ded2] text-xs font-bold text-[#5e5952] hover:bg-[#f0e8de] transition-colors"
            >
              Done
            </button>
            {onSurpriseMeWithIngredients && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSurpriseMeWithIngredients();
                }}
                disabled={matchingRecipes.length === 0}
                className="px-4 py-2.5 rounded-xl bg-[#234820] text-white text-xs font-bold shadow-sm hover:bg-[#1a3818] disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                Surprise With These
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
