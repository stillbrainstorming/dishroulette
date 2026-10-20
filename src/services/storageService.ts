const FAVORITES_KEY = 'dishroulette_favorites';
const HISTORY_KEY = 'dishroulette_history';
const MAX_HISTORY_ITEMS = 50;

// In-memory fallback if localStorage is disabled or throws (e.g. strict privacy mode)
const memoryStore: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // LocalStorage inaccessible
  }
  return memoryStore[key] ?? null;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // LocalStorage inaccessible
  }
  memoryStore[key] = value;
};

const safeRemoveItem = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // LocalStorage inaccessible
  }
  delete memoryStore[key];
};

const safeParseJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as unknown as T) : fallback;
  } catch {
    return fallback;
  }
};

// Favorites management
export const getFavorites = (): string[] => {
  return safeParseJson<string[]>(safeGetItem(FAVORITES_KEY), []);
};

export const toggleFavorite = (recipeId: string): boolean => {
  const current = getFavorites();
  const index = current.indexOf(recipeId);
  let isSavedNow = false;

  if (index >= 0) {
    current.splice(index, 1);
    isSavedNow = false;
  } else {
    current.unshift(recipeId);
    isSavedNow = true;
  }

  safeSetItem(FAVORITES_KEY, JSON.stringify(current));
  return isSavedNow;
};

export const isFavorite = (recipeId: string): boolean => {
  return getFavorites().includes(recipeId);
};

// History management
export const getHistory = (): string[] => {
  return safeParseJson<string[]>(safeGetItem(HISTORY_KEY), []);
};

export const addToHistory = (recipeId: string): void => {
  if (!recipeId) return;
  const current = getHistory().filter((id) => id !== recipeId);
  current.unshift(recipeId);

  if (current.length > MAX_HISTORY_ITEMS) {
    current.splice(MAX_HISTORY_ITEMS);
  }

  safeSetItem(HISTORY_KEY, JSON.stringify(current));
};

export const removeFromHistory = (recipeId: string): void => {
  const current = getHistory().filter((id) => id !== recipeId);
  safeSetItem(HISTORY_KEY, JSON.stringify(current));
};

export const clearHistory = (): void => {
  safeRemoveItem(HISTORY_KEY);
};
