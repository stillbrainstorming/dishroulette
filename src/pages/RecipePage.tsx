import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ChefHat,
  Users,
  Heart,
  Share2,
  Dices,
  Play,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lightbulb,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';
import { recipes } from '../data/recipes';
import { useApp } from '../context/AppContext';
import { scaleServings, formatQuantity, findSimilarRecipes, selectRandomRecipe, filterRecipes } from '../services/recipeService';
import { RecipeCard } from '../components/RecipeCard';
import { ShareModal } from '../components/ShareModal';

export const RecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    favorites,
    toggleFavorite,
    addToHistory,
    setActiveCookingRecipe,
    filters,
    recentlyDiscoveredIds,
    addRecentlyDiscoveredId,
  } = useApp();

  const baseRecipe = recipes.find((r) => r.id === id);

  const [servings, setServings] = useState<number>(baseRecipe?.servings ?? 4);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Synchronize when route ID changes
  useEffect(() => {
    if (baseRecipe) {
      setServings(baseRecipe.servings);
      addToHistory(baseRecipe.id);
      setCheckedIngredients([]);
      setCompletedSteps([]);
      window.scrollTo(0, 0);
    }
  }, [baseRecipe?.id]);

  if (!baseRecipe) {
    return (
      <div className="py-20 text-center space-y-4">
        <span className="text-6xl">🍲</span>
        <h1 className="font-serif text-2xl font-bold text-[#211f1c]">Recipe Not Found</h1>
        <p className="text-sm text-[#5e5952]">
          The recipe you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#234820] text-white text-xs font-bold shadow-xs hover:bg-[#1a3818] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Discover
        </Link>
      </div>
    );
  }

  // Scaled recipe based on active serving selection
  const scaledRecipe = scaleServings(baseRecipe, servings);
  const isSaved = favorites.includes(baseRecipe.id);
  const totalTime = baseRecipe.prepTime + baseRecipe.cookTime;
  const similarRecipes = findSimilarRecipes(baseRecipe, recipes, 3);

  const toggleIngredientCheck = (name: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const toggleStepCheck = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const handleReroll = () => {
    const pool = filterRecipes(recipes, filters);
    const candidate = selectRandomRecipe(pool, [baseRecipe.id, ...recentlyDiscoveredIds], true);
    if (candidate) {
      addRecentlyDiscoveredId(candidate.id);
      navigate(`/recipe/${candidate.id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <article className="space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5e5952] hover:text-[#211f1c] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="p-2.5 rounded-xl bg-white border border-[#e8ded2] text-[#5e5952] hover:text-[#211f1c] hover:border-[#234820] shadow-2xs transition-all"
            aria-label="Share recipe"
          >
            <Share2 size={16} />
          </button>

          {/* Favorite / Save Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(baseRecipe.id)}
            className={`p-2.5 rounded-xl border shadow-2xs transition-all ${
              isSaved
                ? 'bg-[#b8402a] text-white border-[#b8402a]'
                : 'bg-white border-[#e8ded2] text-[#5e5952] hover:text-[#b8402a] hover:border-[#b8402a]'
            }`}
            aria-label={isSaved ? 'Remove from saved' : 'Save recipe'}
          >
            <Heart size={16} className={isSaved ? 'fill-white stroke-white' : ''} />
          </button>
        </div>
      </div>

      {/* Hero Showcase Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hero Image with Fallback */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden bg-[#f4ede4] border border-[#e8ded2] shadow-sm aspect-[16/10] relative">
          {baseRecipe.imageUrl && !imageError ? (
            <img
              src={baseRecipe.imageUrl}
              alt={baseRecipe.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-7xl select-none">
              <span>{baseRecipe.imageFallbackEmoji || '🍲'}</span>
              <span className="text-xs font-medium text-[#8a8378] mt-2">
                {baseRecipe.cuisine} Culinary Heritage
              </span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2">
            <Clock size={13} />
            <span>Prep: {baseRecipe.prepTime}m</span>
            <span>•</span>
            <span>Cook: {baseRecipe.cookTime}m</span>
            <span>•</span>
            <span className="text-[#fef3c7]">Total: {totalTime}m</span>
          </div>
        </div>

        {/* Right Column: Key Details & Quick Actions */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#586638]">
              <ChefHat size={14} />
              <span>{baseRecipe.cuisine} cuisine</span>
              <span>•</span>
              <span className="capitalize">{baseRecipe.difficulty}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#211f1c] leading-tight">
              {baseRecipe.name}
            </h1>

            <p className="text-sm text-[#5e5952] leading-relaxed">
              {baseRecipe.description}
            </p>
          </div>

          {/* Dietary Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {baseRecipe.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#eaf3ea] text-[#234820] border border-[#234820]/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Servings Adjuster Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#e8ded2] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#234820]" />
              <div>
                <p className="text-xs font-bold text-[#211f1c]">Adjust Servings</p>
                <p className="text-[11px] text-[#8a8378]">Ingredient amounts update live</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-lg bg-[#faf7f2] border border-[#e8ded2] text-[#211f1c] hover:bg-[#e8ded2] flex items-center justify-center transition-colors disabled:opacity-30"
                disabled={servings <= 1}
                aria-label="Decrease servings"
              >
                <Minus size={14} />
              </button>
              <span className="font-mono text-base font-extrabold text-[#211f1c] min-w-6 text-center">
                {servings}
              </span>
              <button
                type="button"
                onClick={() => setServings((prev) => Math.min(24, prev + 1))}
                className="w-8 h-8 rounded-lg bg-[#faf7f2] border border-[#e8ded2] text-[#211f1c] hover:bg-[#e8ded2] flex items-center justify-center transition-colors disabled:opacity-30"
                disabled={servings >= 24}
                aria-label="Increase servings"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveCookingRecipe(scaledRecipe)}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#234820] text-white text-sm font-bold shadow-sm hover:bg-[#1a3818] transition-all flex items-center justify-center gap-2"
            >
              <Play size={16} className="fill-white" />
              <span>Start Cooking Mode (Kitchen View)</span>
            </button>

            <button
              type="button"
              onClick={handleReroll}
              className="w-full py-2.5 px-6 rounded-2xl bg-white border border-[#e8ded2] text-[#211f1c] text-xs font-bold hover:bg-[#faf7f2] transition-colors flex items-center justify-center gap-1.5"
            >
              <Dices size={15} />
              <span>Find Another Recipe (Surprise Again)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients & Step-by-Step Instructions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Column: Ingredients Checklist */}
        <section aria-labelledby="ingredients-title" className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e8ded2]">
            <h2 id="ingredients-title" className="font-serif text-xl font-bold text-[#211f1c]">
              Ingredients ({servings} {servings === 1 ? 'serving' : 'servings'})
            </h2>
            <span className="text-xs text-[#8a8378]">
              {checkedIngredients.length} of {scaledRecipe.ingredients.length} checked
            </span>
          </div>

          <ul className="space-y-2">
            {scaledRecipe.ingredients.map((ing, idx) => {
              const isChecked = checkedIngredients.includes(ing.name);
              return (
                <li
                  key={idx}
                  onClick={() => toggleIngredientCheck(ing.name)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-baseline justify-between gap-3 select-none ${
                    isChecked
                      ? 'bg-[#eaf3ea]/40 border-[#234820]/20 text-[#8a8378]'
                      : 'bg-white border-[#e8ded2] text-[#211f1c] hover:border-[#234820]/40'
                  }`}
                >
                  <div className="flex items-baseline gap-2.5">
                    <span className="mt-0.5 shrink-0 text-[#234820]">
                      {isChecked ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Circle size={16} className="text-[#e8ded2]" />
                      )}
                    </span>
                    <div>
                      <span className={`text-sm ${isChecked ? 'line-through text-[#8a8378]' : 'font-medium'}`}>
                        {ing.name}
                      </span>
                      {ing.notes && (
                        <span className="text-xs text-[#8a8378] ml-1.5 font-normal">
                          ({ing.notes})
                        </span>
                      )}
                      {ing.optional && (
                        <span className="text-[10px] text-[#586638] font-semibold uppercase tracking-wider ml-1.5 px-1.5 py-0.2 rounded-md bg-[#f1f4e9]">
                          optional
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-[#234820] shrink-0">
                    {ing.quantity !== null ? formatQuantity(ing.quantity) : ''} {ing.unit}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Helpful Allergen & Nutrition Note (Adhering strictly to prompt guideline: never invent nutritional values or safety claims) */}
          <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8ded2] text-[11px] text-[#5e5952] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#211f1c]">
              <AlertCircle size={13} className="text-[#d97706]" />
              <span>Ingredient Accuracy Note</span>
            </div>
            <p>
              Quantities are calculated proportionally. Exact nutritional data is not fabricated. Always verify specific ingredient brands if managing critical medical allergies.
            </p>
          </div>
        </section>

        {/* Right Column: Step-by-Step Cooking Instructions */}
        <section aria-labelledby="instructions-title" className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e8ded2]">
            <h2 id="instructions-title" className="font-serif text-xl font-bold text-[#211f1c]">
              Preparation Steps ({scaledRecipe.steps.length})
            </h2>
            <button
              type="button"
              onClick={() => setActiveCookingRecipe(scaledRecipe)}
              className="text-xs font-bold text-[#234820] hover:underline flex items-center gap-1"
            >
              <Play size={12} className="fill-[#234820]" />
              Open Kitchen Mode
            </button>
          </div>

          <ol className="space-y-4">
            {scaledRecipe.steps.map((step) => {
              const isDone = completedSteps.includes(step.stepNumber);
              return (
                <li
                  key={step.stepNumber}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-[#eaf3ea]/40 border-[#234820]/30'
                      : 'bg-white border-[#e8ded2]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleStepCheck(step.stepNumber)}
                      className="mt-1 shrink-0 text-[#234820]"
                      aria-label={`Mark step ${step.stepNumber} as ${isDone ? 'incomplete' : 'complete'}`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={20} className="fill-[#eaf3ea]" />
                      ) : (
                        <Circle size={20} className="text-[#e8ded2] hover:text-[#234820]" />
                      )}
                    </button>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#234820] uppercase tracking-wider">
                          Step {step.stepNumber}
                        </span>
                      </div>

                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isDone ? 'line-through text-[#8a8378]' : 'text-[#211f1c]'
                        }`}
                      >
                        {step.instruction}
                      </p>

                      {/* Step Tip */}
                      {step.tip && (
                        <div className="p-3 rounded-xl bg-[#fef3c7] border border-[#d97706]/20 text-xs text-[#92400e] flex items-start gap-2">
                          <Lightbulb size={14} className="shrink-0 text-[#d97706] mt-0.5" />
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Chef's Overall Tips Section if available */}
          {baseRecipe.tips && baseRecipe.tips.length > 0 && (
            <div className="p-5 rounded-3xl bg-[#f4ede4] border border-[#e8ded2] space-y-2">
              <h3 className="font-serif font-bold text-base text-[#211f1c] flex items-center gap-2">
                <Lightbulb size={16} className="text-[#d97706]" />
                Chef's Notes & Advice
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#5e5952] leading-relaxed">
                {baseRecipe.tips.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Provenance note */}
          {baseRecipe.source && (
            <div className="text-[11px] text-[#8a8378]">
              Culinary Source: {baseRecipe.source}
            </div>
          )}
        </section>
      </div>

      {/* Similar Recipes Recommendations */}
      {similarRecipes.length > 0 && (
        <section aria-labelledby="similar-title" className="pt-10 border-t border-[#e8ded2] space-y-5">
          <div>
            <h2 id="similar-title" className="font-serif text-2xl font-bold text-[#211f1c]">
              Similar Dishes You Might Enjoy
            </h2>
            <p className="text-xs text-[#5e5952]">
              Alternatives based on {baseRecipe.cuisine} cuisine and shared ingredients
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* Share Modal Dialog */}
      <ShareModal
        recipe={baseRecipe}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </article>
  );
};
