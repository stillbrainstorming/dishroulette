export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'egg-free'
  | 'gluten-free'
  | 'dairy-free'
  | 'non-vegetarian';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string;
  notes?: string;
  optional?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  mealTypes: MealType[];
  dietaryTags: DietaryTag[];
  difficulty: Difficulty;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  tips?: string[];
  imageUrl?: string;
  imageFallbackEmoji?: string;
  tags?: string[];
  source?: string;
}

export interface FilterState {
  dietary: DietaryTag[];
  cuisines: string[];
  mealTypes: MealType[];
  maxTime: number | null; // Prep + Cook time
  difficulty: Difficulty | null;
  availableIngredients: string[];
  searchQuery: string;
}

export interface IngredientMatch {
  matchedCount: number;
  totalCount: number;
  missingIngredients: string[];
  matchedIngredients: string[];
  percentMatched: number;
  explanation: string;
}
