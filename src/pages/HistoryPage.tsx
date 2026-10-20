import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2, ArrowRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { recipes } from '../data/recipes';
import { RecipeCard } from '../components/RecipeCard';

export const HistoryPage: React.FC = () => {
  const { history, clearHistory, removeFromHistory } = useApp();

  const historyRecipes = history
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-[#e8ded2] pb-4">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-[#211f1c] flex items-center gap-2.5">
            <Clock size={26} className="text-[#234820]" />
            Recently Discovered & Viewed
          </h1>
          <p className="text-sm text-[#5e5952] mt-1">
            {historyRecipes.length} {historyRecipes.length === 1 ? 'dish' : 'dishes'} in your exploration log.
          </p>
        </div>

        {historyRecipes.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="text-xs font-bold text-[#b8402a] hover:underline flex items-center gap-1"
          >
            <Trash2 size={13} />
            Clear all history
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {historyRecipes.length === 0 ? (
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-white border border-[#e8ded2] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#eaf3ea] text-[#234820] mx-auto flex items-center justify-center">
            <Clock size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#211f1c]">
              No discovery history yet
            </h2>
            <p className="text-sm text-[#5e5952] max-w-sm mx-auto">
              Any recipe you discover using "Surprise Me" or open to inspect will be logged here so you never lose track of a great meal.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#234820] text-white text-xs font-bold shadow-xs hover:bg-[#1a3818] transition-all"
          >
            <span>Start Discovering</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyRecipes.map((recipe) => (
            <div key={recipe.id} className="relative group">
              {/* Remove individual entry button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromHistory(recipe.id);
                }}
                className="absolute top-2 left-2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-[#b8402a] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xs"
                aria-label={`Remove ${recipe.name} from history`}
                title="Remove from history"
              >
                <X size={14} />
              </button>
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
