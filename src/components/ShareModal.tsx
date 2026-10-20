import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import type { Recipe } from '../types/recipe';

interface ShareModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ recipe, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${recipe.name} — Dishroulette`,
          text: `Check out this recipe for ${recipe.name} on Dishroulette!`,
          url: shareUrl,
        });
        onClose();
      } catch {
        // User cancelled share
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl border border-[#e8ded2] p-5 z-10 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#eaf3ea] text-[#234820] flex items-center justify-center">
              <Share2 size={16} />
            </div>
            <h3 className="font-serif font-bold text-base text-[#211f1c]">Share Recipe</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#8a8378] hover:text-[#211f1c] hover:bg-[#f0e8de] flex items-center justify-center"
            aria-label="Close share dialog"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-[#5e5952]">
          Share <span className="font-bold text-[#211f1c]">{recipe.name}</span> with friends or save it to your bookmarks:
        </p>

        {/* Link input with copy button */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[#e8ded2] bg-[#faf7f2]">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-2 text-xs text-[#5e5952] outline-hidden truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              copied
                ? 'bg-[#234820] text-white'
                : 'bg-white border border-[#e8ded2] text-[#211f1c] hover:border-[#234820]'
            }`}
          >
            {copied ? (
              <>
                <Check size={13} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Native mobile share if supported */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-[#234820] text-white text-xs font-bold hover:bg-[#1a3818] shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 size={14} />
            <span>Open System Share Menu</span>
          </button>
        )}
      </div>
    </div>
  );
};
