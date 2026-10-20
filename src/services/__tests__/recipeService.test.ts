import { describe, it, expect } from 'vitest';
import {
  filterRecipes,
  selectRandomRecipe,
  scaleServings,
  matchIngredients,
  formatQuantity,
  findSimilarRecipes,
  isIngredientMatch,
} from '../recipeService';
import type { Recipe, FilterState } from '../../types/recipe';

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: 'mock-dal',
  name: 'Dal Tadka',
  description: 'Tempered yellow lentils',
  cuisine: 'Indian',
  mealTypes: ['lunch', 'dinner'],
  dietaryTags: ['vegetarian', 'gluten-free'],
  difficulty: 'easy',
  prepTime: 10,
  cookTime: 20,
  servings: 4,
  ingredients: [
    { name: 'yellow lentils', quantity: 1, unit: 'cup' },
    { name: 'tomatoes', quantity: 2, unit: 'medium' },
    { name: 'onions', quantity: 1, unit: 'large' },
    { name: 'garlic', quantity: 4, unit: 'cloves' },
    { name: 'fresh coriander', quantity: 2, unit: 'tbsp', optional: true },
  ],
  steps: [
    { stepNumber: 1, instruction: 'Boil lentils' },
    { stepNumber: 2, instruction: 'Prepare tempering' },
  ],
  ...overrides,
});

const defaultEmptyFilters: FilterState = {
  dietary: [],
  cuisines: [],
  mealTypes: [],
  maxTime: null,
  difficulty: null,
  availableIngredients: [],
  searchQuery: '',
};

describe('filterRecipes', () => {
  it('returns all recipes when filters are empty', () => {
    const list = [createMockRecipe({ id: '1' }), createMockRecipe({ id: '2' })];
    expect(filterRecipes(list, defaultEmptyFilters)).toHaveLength(2);
  });

  it('enforces strict dietary restrictions as hard constraints', () => {
    const veg = createMockRecipe({ id: 'veg', dietaryTags: ['vegetarian'] });
    const vegan = createMockRecipe({ id: 'vegan', dietaryTags: ['vegetarian', 'vegan'] });
    const nonVeg = createMockRecipe({ id: 'nonveg', dietaryTags: ['non-vegetarian'] });

    const pool = [veg, vegan, nonVeg];

    // Filter for vegetarian
    const vegResult = filterRecipes(pool, { ...defaultEmptyFilters, dietary: ['vegetarian'] });
    expect(vegResult.map((r) => r.id)).toEqual(['veg', 'vegan']);

    // Filter for vegan
    const veganResult = filterRecipes(pool, { ...defaultEmptyFilters, dietary: ['vegan'] });
    expect(veganResult.map((r) => r.id)).toEqual(['vegan']);

    // Filter for both vegetarian AND gluten-free
    const bothResult = filterRecipes(
      [
        createMockRecipe({ id: 'both', dietaryTags: ['vegetarian', 'gluten-free'] }),
        createMockRecipe({ id: 'only-veg', dietaryTags: ['vegetarian'] }),
      ],
      { ...defaultEmptyFilters, dietary: ['vegetarian', 'gluten-free'] }
    );
    expect(bothResult.map((r) => r.id)).toEqual(['both']);
  });

  it('filters by cuisine', () => {
    const indian = createMockRecipe({ id: 'ind', cuisine: 'Indian' });
    const italian = createMockRecipe({ id: 'ita', cuisine: 'Italian' });
    const mexican = createMockRecipe({ id: 'mex', cuisine: 'Mexican' });

    const result = filterRecipes([indian, italian, mexican], {
      ...defaultEmptyFilters,
      cuisines: ['Italian', 'Mexican'],
    });

    expect(result.map((r) => r.id)).toEqual(['ita', 'mex']);
  });

  it('filters by meal type', () => {
    const breakfast = createMockRecipe({ id: 'b', mealTypes: ['breakfast'] });
    const dinner = createMockRecipe({ id: 'd', mealTypes: ['dinner'] });

    const result = filterRecipes([breakfast, dinner], {
      ...defaultEmptyFilters,
      mealTypes: ['breakfast'],
    });

    expect(result.map((r) => r.id)).toEqual(['b']);
  });

  it('filters by maximum total cooking time (prepTime + cookTime)', () => {
    const quick = createMockRecipe({ id: 'quick', prepTime: 5, cookTime: 15 }); // 20m
    const slow = createMockRecipe({ id: 'slow', prepTime: 20, cookTime: 40 }); // 60m

    const result = filterRecipes([quick, slow], {
      ...defaultEmptyFilters,
      maxTime: 30,
    });

    expect(result.map((r) => r.id)).toEqual(['quick']);
  });

  it('filters by difficulty level', () => {
    const easy = createMockRecipe({ id: 'e', difficulty: 'easy' });
    const hard = createMockRecipe({ id: 'h', difficulty: 'hard' });

    const result = filterRecipes([easy, hard], {
      ...defaultEmptyFilters,
      difficulty: 'hard',
    });

    expect(result.map((r) => r.id)).toEqual(['h']);
  });

  it('filters by search query matching name, cuisine, and ingredients', () => {
    const recipe1 = createMockRecipe({
      id: '1',
      name: 'Paneer Butter Masala',
      ingredients: [{ name: 'paneer', quantity: 200, unit: 'g' }],
    });
    const recipe2 = createMockRecipe({
      id: '2',
      name: 'Pasta Carbonara',
      cuisine: 'Italian',
      ingredients: [{ name: 'spaghetti', quantity: 200, unit: 'g' }],
    });

    // Match by ingredient
    expect(
      filterRecipes([recipe1, recipe2], {
        ...defaultEmptyFilters,
        searchQuery: 'paneer',
      })
    ).toHaveLength(1);

    // Match by cuisine
    expect(
      filterRecipes([recipe1, recipe2], {
        ...defaultEmptyFilters,
        searchQuery: 'italian',
      })
    ).toHaveLength(1);

    // Match by name
    expect(
      filterRecipes([recipe1, recipe2], {
        ...defaultEmptyFilters,
        searchQuery: 'carbonara',
      })
    ).toHaveLength(1);
  });

  it('returns empty array when no dishes match filters', () => {
    const recipe = createMockRecipe({ cuisine: 'Indian' });
    const result = filterRecipes([recipe], {
      ...defaultEmptyFilters,
      cuisines: ['Japanese'],
    });
    expect(result).toHaveLength(0);
  });
});

describe('selectRandomRecipe', () => {
  it('returns null for an empty recipe pool', () => {
    expect(selectRandomRecipe([])).toBeNull();
  });

  it('returns the single recipe if pool has length 1', () => {
    const single = createMockRecipe({ id: 'only-one' });
    expect(selectRandomRecipe([single])).toEqual(single);
  });

  it('avoids returning recently seen recipes when unseen options exist in pool', () => {
    const r1 = createMockRecipe({ id: 'r1' });
    const r2 = createMockRecipe({ id: 'r2' });
    const r3 = createMockRecipe({ id: 'r3' });
    const pool = [r1, r2, r3];

    // r1 and r2 were recently seen
    for (let i = 0; i < 20; i++) {
      const selected = selectRandomRecipe(pool, ['r1', 'r2'], true);
      expect(selected?.id).toBe('r3');
    }
  });

  it('gracefully falls back to any recipe when all recipes have already been seen', () => {
    const r1 = createMockRecipe({ id: 'r1' });
    const r2 = createMockRecipe({ id: 'r2' });
    const pool = [r1, r2];

    const selected = selectRandomRecipe(pool, ['r1', 'r2'], true);
    expect(selected).not.toBeNull();
    expect(['r1', 'r2']).toContain(selected?.id);
  });
});

describe('scaleServings', () => {
  it('proportionally scales ingredient quantities', () => {
    const recipe = createMockRecipe({
      servings: 4,
      ingredients: [
        { name: 'lentils', quantity: 2, unit: 'cups' },
        { name: 'tomatoes', quantity: 4, unit: 'whole' },
      ],
    });

    const scaled = scaleServings(recipe, 8);
    expect(scaled.servings).toBe(8);
    expect(scaled.ingredients[0].quantity).toBe(4);
    expect(scaled.ingredients[1].quantity).toBe(8);
  });

  it('does not mutate the original recipe object', () => {
    const original = createMockRecipe({
      servings: 4,
      ingredients: [{ name: 'lentils', quantity: 2, unit: 'cups' }],
    });

    scaleServings(original, 6);
    expect(original.servings).toBe(4);
    expect(original.ingredients[0].quantity).toBe(2);
  });

  it('preserves null quantities gracefully (such as pinches or to taste)', () => {
    const recipe = createMockRecipe({
      servings: 4,
      ingredients: [{ name: 'salt', quantity: null, unit: 'to taste' }],
    });

    const scaled = scaleServings(recipe, 8);
    expect(scaled.ingredients[0].quantity).toBeNull();
  });
});

describe('matchIngredients', () => {
  const recipe = createMockRecipe({
    ingredients: [
      { name: 'yellow lentils', quantity: 1, unit: 'cup' },
      { name: 'ripe tomatoes', quantity: 2, unit: 'medium' },
      { name: 'onions', quantity: 1, unit: 'large' },
      { name: 'fresh coriander', quantity: 2, unit: 'tbsp', optional: true },
    ],
  });

  it('matches ingredients accurately ignoring optional ingredients in total count', () => {
    const match = matchIngredients(recipe, ['lentils', 'tomatoes', 'onions']);
    expect(match.totalCount).toBe(3); // excludes optional coriander
    expect(match.matchedCount).toBe(3);
    expect(match.percentMatched).toBe(100);
    expect(match.missingIngredients).toHaveLength(0);
  });

  it('correctly identifies missing ingredients in partial matches', () => {
    const match = matchIngredients(recipe, ['tomatoes']);
    expect(match.matchedCount).toBe(1);
    expect(match.missingIngredients).toContain('yellow lentils');
    expect(match.missingIngredients).toContain('onions');
  });

  it('handles case-insensitivity and plural/singular forms', () => {
    expect(isIngredientMatch('Ripe Tomatoes', 'tomato')).toBe(true);
    expect(isIngredientMatch('eggs', 'egg')).toBe(true);
    expect(isIngredientMatch('garlic cloves', 'garlic')).toBe(true);
  });
});

describe('formatQuantity', () => {
  it('formats whole numbers cleanly', () => {
    expect(formatQuantity(2)).toBe('2');
    expect(formatQuantity(10)).toBe('10');
  });

  it('formats fractional values into culinary symbols', () => {
    expect(formatQuantity(0.5)).toBe('½');
    expect(formatQuantity(0.25)).toBe('¼');
    expect(formatQuantity(0.75)).toBe('¾');
    expect(formatQuantity(0.333)).toBe('⅓');
  });

  it('formats mixed numbers with fractions', () => {
    expect(formatQuantity(1.5)).toBe('1 ½');
    expect(formatQuantity(2.25)).toBe('2 ¼');
  });

  it('returns empty string for null or undefined', () => {
    expect(formatQuantity(null)).toBe('');
  });
});

describe('findSimilarRecipes', () => {
  it('finds recipes with matching cuisine and tags', () => {
    const target = createMockRecipe({ id: 'target', cuisine: 'Indian' });
    const similarIndian = createMockRecipe({ id: 'sim-ind', cuisine: 'Indian' });
    const italian = createMockRecipe({ id: 'ita', cuisine: 'Italian' });

    const results = findSimilarRecipes(target, [target, similarIndian, italian], 2);
    expect(results.some((r) => r.id === 'sim-ind')).toBe(true);
    expect(results.some((r) => r.id === 'target')).toBe(false); // excludes self
  });
});
