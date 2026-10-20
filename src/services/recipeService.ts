import type { Recipe, FilterState, IngredientMatch } from '../types/recipe';

// Helper to normalize ingredient terms for forgiving matching (e.g., tomatoes -> tomato)
export const normalizeIngredient = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\b(fresh|dried|raw|cooked|chopped|minced|sliced|diced|grated|peeled|crushed|powder|leaves|seeds|paste|canned|organic)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Check if an available ingredient matches a recipe ingredient
export const isIngredientMatch = (recipeIngName: string, userIng: string): boolean => {
  const normRecipe = normalizeIngredient(recipeIngName);
  const normUser = normalizeIngredient(userIng);

  if (!normUser || !normRecipe) return false;

  // Direct inclusion
  if (normRecipe.includes(normUser) || normUser.includes(normRecipe)) {
    return true;
  }

  // Common singular/plural check (e.g. egg/eggs, tomato/tomatoes, potato/potatoes, onion/onions)
  const stripPlural = (s: string) => s.replace(/(es|s)$/, '');
  if (stripPlural(normRecipe) === stripPlural(normUser)) {
    return true;
  }

  return false;
};

// Calculate ingredient matching score and explanation
export const matchIngredients = (
  recipe: Recipe,
  availableIngredients: string[]
): IngredientMatch => {
  const required = recipe.ingredients.filter((i) => !i.optional);
  const totalCount = required.length;

  if (availableIngredients.length === 0) {
    return {
      matchedCount: 0,
      totalCount,
      missingIngredients: required.map((i) => i.name),
      matchedIngredients: [],
      percentMatched: 0,
      explanation: 'No ingredients specified',
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const item of required) {
    const isMatched = availableIngredients.some((userIng) =>
      isIngredientMatch(item.name, userIng)
    );
    if (isMatched) {
      matched.push(item.name);
    } else {
      missing.push(item.name);
    }
  }

  const matchedCount = matched.length;
  const percentMatched = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 100;

  let explanation = '';
  if (matchedCount === totalCount && totalCount > 0) {
    explanation = 'You have all the required ingredients!';
  } else if (matchedCount > 0) {
    const missingPreview = missing.slice(0, 2).join(', ');
    const moreMissing = missing.length > 2 ? ` and ${missing.length - 2} more` : '';
    explanation = `Uses ${matchedCount} of ${totalCount} ingredients (need ${missingPreview}${moreMissing})`;
  } else {
    explanation = 'Requires ingredients you haven\'t selected yet';
  }

  return {
    matchedCount,
    totalCount,
    missingIngredients: missing,
    matchedIngredients: matched,
    percentMatched,
    explanation,
  };
};

// Filter recipes according to active filter state
export const filterRecipes = (recipes: Recipe[], filters: FilterState): Recipe[] => {
  return recipes.filter((recipe) => {
    // 1. Dietary restrictions are STRICT hard constraints
    if (filters.dietary.length > 0) {
      const meetsAllDietary = filters.dietary.every((tag) =>
        recipe.dietaryTags.includes(tag)
      );
      if (!meetsAllDietary) return false;
    }

    // 2. Cuisine filter
    if (filters.cuisines.length > 0) {
      if (!filters.cuisines.includes(recipe.cuisine)) return false;
    }

    // 3. Meal type filter (match at least one)
    if (filters.mealTypes.length > 0) {
      const hasMealType = filters.mealTypes.some((m) =>
        recipe.mealTypes.includes(m)
      );
      if (!hasMealType) return false;
    }

    // 4. Max cooking time (prepTime + cookTime)
    if (filters.maxTime !== null && filters.maxTime > 0) {
      const totalTime = recipe.prepTime + recipe.cookTime;
      if (totalTime > filters.maxTime) return false;
    }

    // 5. Difficulty filter
    if (filters.difficulty !== null) {
      if (recipe.difficulty !== filters.difficulty) return false;
    }

    // 6. Search query (matches name, description, cuisine, ingredients, tags)
    if (filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      const nameMatch = recipe.name.toLowerCase().includes(q);
      const descMatch = recipe.description.toLowerCase().includes(q);
      const cuisineMatch = recipe.cuisine.toLowerCase().includes(q);
      const ingMatch = recipe.ingredients.some((i) =>
        i.name.toLowerCase().includes(q)
      );
      const tagMatch = (recipe.tags || []).some((t) =>
        t.toLowerCase().includes(q)
      );

      if (!nameMatch && !descMatch && !cuisineMatch && !ingMatch && !tagMatch) {
        return false;
      }
    }

    // 7. Available ingredients ("Use what I have" mode)
    if (filters.availableIngredients.length > 0) {
      const match = matchIngredients(recipe, filters.availableIngredients);
      // Only keep recipes that use at least one of the user's ingredients
      if (match.matchedCount === 0) return false;
    }

    return true;
  });
};

// Random recipe selection with smart repeat avoidance
export const selectRandomRecipe = (
  pool: Recipe[],
  recentlySeenIds: string[] = [],
  avoidRepeat = true
): Recipe | null => {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  if (avoidRepeat && recentlySeenIds.length > 0) {
    // Candidates that haven't been seen recently
    const unseen = pool.filter((r) => !recentlySeenIds.includes(r.id));
    if (unseen.length > 0) {
      const idx = Math.floor(Math.random() * unseen.length);
      return unseen[idx];
    }
  }

  // Fallback: pick any random recipe from the pool
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
};

// Servings scaling logic with clean precision
export const scaleServings = (recipe: Recipe, targetServings: number): Recipe => {
  if (targetServings <= 0 || targetServings === recipe.servings) {
    return recipe;
  }

  const ratio = targetServings / recipe.servings;

  const scaledIngredients = recipe.ingredients.map((ing) => {
    if (ing.quantity === null) {
      return { ...ing };
    }

    const rawScaled = ing.quantity * ratio;
    // Round to sensible culinary fractions (e.g., 0.125, 0.25, 0.33, 0.5, etc.)
    const rounded = Math.round(rawScaled * 8) / 8;

    return {
      ...ing,
      quantity: rounded,
    };
  });

  return {
    ...recipe,
    servings: targetServings,
    ingredients: scaledIngredients,
  };
};

// Format numeric ingredient quantity into readable fractions or decimals
export const formatQuantity = (quantity: number | null): string => {
  if (quantity === null || quantity === undefined) return '';

  const whole = Math.floor(quantity);
  const frac = Math.round((quantity - whole) * 1000) / 1000;

  // Fraction lookup table with reasonable tolerances
  const fractionMap: [number, string][] = [
    [0.125, '⅛'],
    [0.25, '¼'],
    [0.333, '⅓'],
    [0.375, '⅜'],
    [0.5, '½'],
    [0.625, '⅝'],
    [0.667, '⅔'],
    [0.75, '¾'],
    [0.875, '⅞'],
  ];

  for (const [val, sym] of fractionMap) {
    if (Math.abs(frac - val) < 0.04) {
      return whole > 0 ? `${whole} ${sym}` : sym;
    }
  }

  if (frac < 0.05) return whole > 0 ? `${whole}` : '0';
  if (frac > 0.95) return `${whole + 1}`;

  // If decimal is clean
  return Number.isInteger(quantity) ? `${quantity}` : quantity.toFixed(1).replace(/\.0$/, '');
};

// Find similar recipes for recommendations
export const findSimilarRecipes = (
  target: Recipe,
  allRecipes: Recipe[],
  limit = 3
): Recipe[] => {
  const others = allRecipes.filter((r) => r.id !== target.id);

  const scored = others.map((candidate) => {
    let score = 0;
    // Same cuisine
    if (candidate.cuisine === target.cuisine) score += 3;
    // Shared meal types
    const sharedMeals = candidate.mealTypes.filter((m) =>
      target.mealTypes.includes(m)
    ).length;
    score += sharedMeals * 1.5;
    // Shared tags
    if (candidate.tags && target.tags) {
      const sharedTags = candidate.tags.filter((t) => target.tags?.includes(t)).length;
      score += sharedTags * 2;
    }
    // Shared ingredients
    const targetIngNames = target.ingredients.map((i) => normalizeIngredient(i.name));
    const candIngNames = candidate.ingredients.map((i) => normalizeIngredient(i.name));
    const sharedIngs = candIngNames.filter((ci) =>
      targetIngNames.some((ti) => ci.includes(ti) || ti.includes(ci))
    ).length;
    score += sharedIngs;

    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.candidate);
};
