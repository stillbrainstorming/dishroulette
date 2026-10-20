import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, Heart, Clock, UtensilsCrossed, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { favorites, history } = useApp();

  const navLinks = [
    { path: '/', label: 'Discover', icon: Compass },
    { path: '/search', label: 'Search & Pantry', icon: Search },
    { path: '/favorites', label: 'Saved', icon: Heart, count: favorites.length },
    { path: '/history', label: 'History', icon: Clock, count: history.length },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 bg-[#faf7f2]/90 backdrop-blur-md border-b border-[#e8ded2] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-decoration-none group select-none"
            aria-label="Dishroulette home"
          >
            <div className="w-10 h-10 rounded-xl bg-[#234820] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#211f1c] flex items-center gap-1.5">
                Dishroulette
                <span className="text-xs font-sans font-semibold px-1.5 py-0.5 rounded-full bg-[#fcedea] text-[#b8402a] tracking-normal">
                  v1.0
                </span>
              </span>
              <span className="text-[11px] text-[#5e5952] font-medium -mt-1 hidden sm:block">
                What should I cook today?
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#234820] text-white shadow-sm'
                      : 'text-[#5e5952] hover:text-[#211f1c] hover:bg-[#f0e8de]/60'
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#e8ded2] text-[#211f1c]'
                      }`}
                    >
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Surprise Shortcut CTA */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#eaf3ea] text-[#234820] border border-[#234820]/20 hover:bg-[#234820] hover:text-white transition-all shadow-xs"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Spontaneous</span> Roulette
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf7f2]/95 backdrop-blur-lg border-t border-[#e8ded2] px-2 py-1.5 safe-area-bottom">
        <div className="flex items-center justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                  isActive ? 'text-[#234820] font-semibold' : 'text-[#8a8378] font-normal hover:text-[#211f1c]'
                }`}
              >
                <div className="relative">
                  <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                  {link.count !== undefined && link.count > 0 && (
                    <span className="absolute -top-1 -right-2 text-[10px] w-4 h-4 rounded-full bg-[#ce4a32] text-white flex items-center justify-center font-bold">
                      {link.count > 9 ? '9+' : link.count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
