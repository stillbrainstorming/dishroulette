import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Dices, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { recipes } from '../data/recipes';
import { RecipeCard } from '../components/RecipeCard';

export const FavoritesPage: React.FC = () => {
  const { favorites } = useApp();

  const savedRecipes = recipes.filter((r) => favorites.includes(r.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-[#e8ded2] pb-4">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-[#211f1c] flex items-center gap-2.5">
            <Heart size={26} className="text-[#b8402a] fill-[#b8402a]" />
            Saved Recipes
          </h1>
          <p className="text-sm text-[#5e5952] mt-1">
            {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} bookmarked locally in your browser.
          </p>
        </div>

        <Link
          to="/"
          className="text-xs font-bold text-[#234820] hover:underline flex items-center gap-1"
        >
          <Dices size={14} />
          Discover more
        </Link>
      </div>

      {/* Grid or Empty State */}
      {savedRecipes.length === 0 ? (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-[#e8ded2] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#fcedea] text-[#b8402a] mx-auto flex items-center justify-center">
            <Heart size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#211f1c]">
              No saved recipes yet
            </h2>
            <p className="text-sm text-[#5e5952] max-w-sm mx-auto">
              Whenever you see a dish you love on Dishroulette, tap the heart icon to save it here for cooking later!
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#234820] text-white text-xs font-bold shadow-xs hover:bg-[#1a3818] transition-all"
          >
            <span>Surprise Me With a Recipe</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};
