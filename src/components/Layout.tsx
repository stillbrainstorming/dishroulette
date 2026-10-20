import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { FilterDrawer } from './FilterDrawer';
import { IngredientPantryModal } from './IngredientPantryModal';
import { CookingModeModal } from './CookingModeModal';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const { activeCookingRecipe, setActiveCookingRecipe } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#211f1c] selection:bg-[#234820]/15 selection:text-[#1a3818]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12">
        {children}
      </main>

      {/* Global Filter Drawer Modal */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onOpenPantry={() => setIsPantryOpen(true)}
      />

      {/* Global Pantry Modal */}
      <IngredientPantryModal
        isOpen={isPantryOpen}
        onClose={() => setIsPantryOpen(false)}
      />

      {/* Full-Screen Step-by-Step Cooking Mode Modal */}
      {activeCookingRecipe && (
        <CookingModeModal
          recipe={activeCookingRecipe}
          servings={activeCookingRecipe.servings}
          isOpen={!!activeCookingRecipe}
          onClose={() => setActiveCookingRecipe(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#e8ded2] bg-[#ffffff] py-8 text-xs text-[#5e5952] hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#234820] text-white flex items-center justify-center">
              <UtensilsCrossed size={12} />
            </div>
            <span className="font-serif font-bold text-[#211f1c]">Dishroulette</span>
            <span>— Spontaneous, delightful cooking discovery.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="hover:text-[#234820] transition-colors">
              Discover
            </Link>
            <Link to="/search" className="hover:text-[#234820] transition-colors">
              Pantry & Search
            </Link>
            <Link to="/favorites" className="hover:text-[#234820] transition-colors">
              Saved Recipes
            </Link>
            <Link to="/history" className="hover:text-[#234820] transition-colors">
              History
            </Link>
          </div>

          <div className="text-[11px] text-[#8a8378]">
            Curated recipe dataset · No sign-up required
          </div>
        </div>
      </footer>
    </div>
  );
};
