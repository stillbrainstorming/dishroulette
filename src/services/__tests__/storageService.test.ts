import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getFavorites,
  toggleFavorite,
  isFavorite,
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
} from '../storageService';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('storageService - Favorites', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('starts with an empty favorites list', () => {
    expect(getFavorites()).toEqual([]);
  });

  it('toggles a recipe into favorites and persists it', () => {
    const isSaved = toggleFavorite('dal-tadka');
    expect(isSaved).toBe(true);
    expect(getFavorites()).toContain('dal-tadka');
    expect(isFavorite('dal-tadka')).toBe(true);
  });

  it('removes a recipe from favorites when toggled a second time', () => {
    toggleFavorite('dal-tadka');
    const isSaved = toggleFavorite('dal-tadka');
    expect(isSaved).toBe(false);
    expect(getFavorites()).not.toContain('dal-tadka');
    expect(isFavorite('dal-tadka')).toBe(false);
  });

  it('handles corrupted localStorage JSON without crashing', () => {
    mockLocalStorage.setItem('dishroulette_favorites', 'corrupted-invalid-json{{{');
    expect(getFavorites()).toEqual([]);
  });
});

describe('storageService - History', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('starts with empty history', () => {
    expect(getHistory()).toEqual([]);
  });

  it('adds recipe to the front of history', () => {
    addToHistory('recipe-1');
    addToHistory('recipe-2');
    const hist = getHistory();
    expect(hist[0]).toBe('recipe-2');
    expect(hist[1]).toBe('recipe-1');
  });

  it('deduplicates history entries and brings revisited item to front', () => {
    addToHistory('recipe-1');
    addToHistory('recipe-2');
    addToHistory('recipe-1'); // revisit recipe-1

    const hist = getHistory();
    expect(hist[0]).toBe('recipe-1');
    expect(hist).toHaveLength(2);
  });

  it('removes an individual entry from history', () => {
    addToHistory('recipe-1');
    addToHistory('recipe-2');
    removeFromHistory('recipe-1');

    expect(getHistory()).toEqual(['recipe-2']);
  });

  it('clears all history', () => {
    addToHistory('recipe-1');
    addToHistory('recipe-2');
    clearHistory();

    expect(getHistory()).toEqual([]);
  });

  it('handles corrupted history storage gracefully', () => {
    mockLocalStorage.setItem('dishroulette_history', '{{bad-json');
    expect(getHistory()).toEqual([]);
  });
});
