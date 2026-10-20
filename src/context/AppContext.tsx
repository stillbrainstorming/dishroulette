import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FilterState, Recipe } from '../types/recipe';
import {
  getFavorites,
  toggleFavorite as toggleFavStorage,
  getHistory,
  addToHistory as addToHistStorage,
  removeFromHistory as removeFromHistStorage,
  clearHistory as clearHistStorage,
} from '../services/storageService';

export const initialFilterState: FilterState = {
  dietary: [],
  cuisines: [],
  mealTypes: [],
  maxTime: null,
  difficulty: null,
  availableIngredients: [],
  searchQuery: '',
};

interface AppContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilters: (partial: Partial<FilterState>) => void;
  resetFilters: () => void;
  favorites: string[];
  toggleFavorite: (recipeId: string) => boolean;
  history: string[];
  addToHistory: (recipeId: string) => void;
  removeFromHistory: (recipeId: string) => void;
  clearHistory: () => void;
  discoveredRecipe: Recipe | null;
  setDiscoveredRecipe: (recipe: Recipe | null) => void;
  recentlyDiscoveredIds: string[];
  addRecentlyDiscoveredId: (id: string) => void;
  isRolling: boolean;
  setIsRolling: (val: boolean) => void;
  activeCookingRecipe: Recipe | null;
  setActiveCookingRecipe: (recipe: Recipe | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [discoveredRecipe, setDiscoveredRecipe] = useState<Recipe | null>(null);
  const [recentlyDiscoveredIds, setRecentlyDiscoveredIds] = useState<string[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);

  // Initialize storage once mounted
  useEffect(() => {
    setFavorites(getFavorites());
    setHistory(getHistory());
  }, []);

  const updateFilters = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  const toggleFavorite = useCallback((recipeId: string) => {
    const isSaved = toggleFavStorage(recipeId);
    setFavorites(getFavorites());
    return isSaved;
  }, []);

  const addToHistory = useCallback((recipeId: string) => {
    addToHistStorage(recipeId);
    setHistory(getHistory());
  }, []);

  const removeFromHistory = useCallback((recipeId: string) => {
    removeFromHistStorage(recipeId);
    setHistory(getHistory());
  }, []);

  const clearHistory = useCallback(() => {
    clearHistStorage();
    setHistory([]);
  }, []);

  const addRecentlyDiscoveredId = useCallback((id: string) => {
    setRecentlyDiscoveredIds((prev) => [id, ...prev.filter((item) => item !== id).slice(0, 15)]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        filters,
        setFilters,
        updateFilters,
        resetFilters,
        favorites,
        toggleFavorite,
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        discoveredRecipe,
        setDiscoveredRecipe,
        recentlyDiscoveredIds,
        addRecentlyDiscoveredId,
        isRolling,
        setIsRolling,
        activeCookingRecipe,
        setActiveCookingRecipe,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
