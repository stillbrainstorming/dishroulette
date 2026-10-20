import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChefHat, Users, Heart, CheckCircle2 } from 'lucide-react';
import type { Recipe } from '../types/recipe';
import { useApp } from '../context/AppContext';
import { matchIngredients } from '../services/recipeService';

interface RecipeCardProps {
  recipe: Recipe;
  showMatchInfo?: boolean;
}

const dietaryBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  vegetarian: { bg: 'bg-[#eaf3ea]', text: 'text-[#234820]', border: 'border-[#234820]/30' },
  vegan: { bg: 'bg-[#f1f4e9]', text: 'text-[#586638]', border: 'border-[#586638]/30' },
  'gluten-free': { bg: 'bg-[#fef3c7]', text: 'text-[#92400e]', border: 'border-[#92400e]/30' },
  'dairy-free': { bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]', border: 'border-[#0369a1]/30' },
  'egg-free': { bg: 'bg-[#fce7f3]', text: 'text-[#9d174d]', border: 'border-[#9d174d]/30' },
  'non-vegetarian': { bg: 'bg-[#fcedea]', text: 'text-[#b8402a]', border: 'border-[#b8402a]/30' },
};

const difficultyBadge = {
  easy: { label: 'Easy', dot: 'bg-emerald-500' },
  medium: { label: 'Medium', dot: 'bg-amber-500' },
  hard: { label: 'Master Chef', dot: 'bg-rose-500' },
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, showMatchInfo = false }) => {
  const { favorites, toggleFavorite, filters } = useApp();
  const isSaved = favorites.includes(recipe.id);
  const [imageError, setImageError] = useState(false);

  const totalTime = recipe.prepTime + recipe.cookTime;
  const matchResult =
    showMatchInfo && filters.availableIngredients.length > 0
      ? matchIngredients(recipe, filters.availableIngredients)
      : null;

  return (
    <article
      className="group flex flex-col bg-white rounded-2xl border border-[#e8ded2] overflow-hidden shadow-xs hover:shadow-md hover:border-[#234820]/40 transition-all duration-300 relative"
      tabIndex={0}
      aria-labelledby={`recipe-title-${recipe.id}`}
    >
      {/* Recipe Image & Top Overlays */}
      <div className="relative aspect-[16/10] bg-[#f4ede4] overflow-hidden">
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#f4ede4] text-[#8a8378]">
            <span className="text-6xl drop-shadow-xs select-none">
              {recipe.imageFallbackEmoji || '🍲'}
            </span>
            <span className="text-xs font-medium mt-2 text-[#5e5952]">{recipe.cuisine} Dish</span>
          </div>
        )}

        {/* Total Time Badge */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 shadow-sm">
          <Clock size={12} className="stroke-[2.5]" />
          <span>{totalTime} min</span>
        </div>

        {/* Cuisine Badge */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.8 rounded-lg bg-white/90 backdrop-blur-md text-[#211f1c] text-xs font-semibold flex items-center gap-1 shadow-xs border border-white/50">
          <ChefHat size={12} className="text-[#234820]" />
          <span>{recipe.cuisine}</span>
        </div>

        {/* Save / Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(recipe.id);
          }}
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-[#b8402a] text-white shadow-sm scale-105'
              : 'bg-white/85 text-[#5e5952] hover:text-[#b8402a] hover:bg-white shadow-xs'
          }`}
          aria-label={isSaved ? `Remove ${recipe.name} from saved` : `Save ${recipe.name}`}
        >
          <Heart
            size={17}
            className={`transition-transform duration-200 ${isSaved ? 'fill-white stroke-white' : ''}`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Difficulty and Servings Meta */}
          <div className="flex items-center justify-between text-xs text-[#5e5952] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2 h-2 rounded-full ${difficultyBadge[recipe.difficulty].dot}`} />
              {difficultyBadge[recipe.difficulty].label}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Users size={12} />
              {recipe.servings} servings
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/recipe/${recipe.id}`}
            className="text-decoration-none group-hover:text-[#234820] transition-colors"
          >
            <h3
              id={`recipe-title-${recipe.id}`}
              className="font-serif text-lg font-bold text-[#211f1c] leading-snug line-clamp-1 mb-1.5"
            >
              {recipe.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-[#5e5952] line-clamp-2 leading-relaxed mb-3">
            {recipe.description}
          </p>

          {/* Ingredient Match Explanation if available */}
          {matchResult && matchResult.matchedCount > 0 && (
            <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-[#eaf3ea] border border-[#234820]/20 flex items-center gap-1.5 text-xs text-[#234820] font-medium">
              <CheckCircle2 size={13} className="shrink-0 text-[#234820]" />
              <span className="line-clamp-1">{matchResult.explanation}</span>
            </div>
          )}

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Dietary information">
            {recipe.dietaryTags.map((tag) => {
              const style = dietaryBadgeStyles[tag] || {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-200',
              };
              return (
                <span
                  key={tag}
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* View Complete Recipe CTA */}
        <div className="pt-2 border-t border-[#f0e8de] flex items-center justify-between mt-auto">
          <span className="text-xs text-[#8a8378]">
            {recipe.ingredients.length} ingredients · {recipe.steps.length} steps
          </span>
          <Link
            to={`/recipe/${recipe.id}`}
            className="text-xs font-bold text-[#234820] hover:text-[#1a3818] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            View Recipe →
          </Link>
        </div>
      </div>
    </article>
  );
};
