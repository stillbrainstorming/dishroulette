import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Circle, Lightbulb, Play, Pause, Timer, ListChecks } from 'lucide-react';
import type { Recipe } from '../types/recipe';
import { formatQuantity } from '../services/recipeService';

interface CookingModeModalProps {
  recipe: Recipe;
  servings: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  isOpen,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showIngredientsPanel, setShowIngredientsPanel] = useState(false);

  // Simple Kitchen Timer
  const [timerSeconds, setTimerSeconds] = useState(180); // default 3 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStepIndex < recipe.steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex((prev) => prev - 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, recipe.steps.length, onClose]);

  if (!isOpen) return null;

  const currentStep = recipe.steps[currentStepIndex];
  const isCurrentStepDone = completedSteps.includes(currentStep.stepNumber);
  const progressPercent = Math.round(((currentStepIndex + 1) / recipe.steps.length) * 100);

  const toggleStepDone = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#faf7f2] flex flex-col overflow-hidden animate-in fade-in duration-200" role="dialog" aria-modal="true">
      {/* Top Bar */}
      <div className="h-16 px-4 sm:px-8 border-b border-[#e8ded2] bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">👨‍🍳</span>
          <div>
            <h2 className="font-serif font-bold text-[#211f1c] text-sm sm:text-base line-clamp-1">
              Cooking Mode: {recipe.name}
            </h2>
            <p className="text-xs text-[#5e5952]">
              Step {currentStepIndex + 1} of {recipe.steps.length} ({progressPercent}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Kitchen Timer */}
          <button
            type="button"
            onClick={() => setShowTimer(!showTimer)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showTimer
                ? 'bg-[#234820] text-white border-[#234820]'
                : 'bg-white text-[#5e5952] border-[#e8ded2] hover:bg-[#f0e8de]'
            }`}
          >
            <Timer size={15} />
            <span className="hidden sm:inline">Timer</span>
          </button>

          {/* Toggle Ingredients Quick Drawer */}
          <button
            type="button"
            onClick={() => setShowIngredientsPanel(!showIngredientsPanel)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showIngredientsPanel
                ? 'bg-[#586638] text-white border-[#586638]'
                : 'bg-white text-[#5e5952] border-[#e8ded2] hover:bg-[#f0e8de]'
            }`}
          >
            <ListChecks size={15} />
            <span className="hidden sm:inline">Ingredients</span>
          </button>

          {/* Exit Cooking Mode */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#f0e8de] text-[#211f1c] hover:bg-[#e8ded2] flex items-center justify-center transition-colors"
            aria-label="Exit cooking mode"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#e8ded2]">
        <div
          className="h-full bg-[#234820] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Step Instruction Card (Center) */}
        <div className="flex-1 p-6 sm:p-12 overflow-y-auto flex flex-col justify-between max-w-4xl mx-auto w-full">
          {/* Step Pill */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eaf3ea] text-[#234820] text-xs font-bold tracking-wide uppercase">
                Step {currentStep.stepNumber} of {recipe.steps.length}
              </span>

              {/* Mark step as completed checkbox */}
              <button
                type="button"
                onClick={() => toggleStepDone(currentStep.stepNumber)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrentStepDone
                    ? 'bg-[#eaf3ea] text-[#234820] border border-[#234820]/30'
                    : 'bg-white text-[#5e5952] border border-[#e8ded2] hover:border-[#234820]'
                }`}
              >
                {isCurrentStepDone ? (
                  <>
                    <CheckCircle2 size={16} className="text-[#234820]" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle size={16} />
                    <span>Mark as done</span>
                  </>
                )}
              </button>
            </div>

            {/* Step Text - Large Kitchen Readability Typography */}
            <p className="font-serif text-2xl sm:text-4xl text-[#211f1c] font-normal leading-relaxed pt-2">
              {currentStep.instruction}
            </p>

            {/* Chef's Tip Box if step contains one */}
            {currentStep.tip && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fef3c7] border border-[#d97706]/30 flex items-start gap-3 text-sm text-[#92400e] animate-in fade-in duration-200">
                <Lightbulb size={20} className="shrink-0 text-[#d97706] mt-0.5" />
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider mb-0.5">Chef's Tip</p>
                  <p className="leading-relaxed">{currentStep.tip}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Controls */}
          <div className="pt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="px-5 py-3 rounded-2xl border border-[#e8ded2] bg-white text-sm font-bold text-[#211f1c] hover:bg-[#f0e8de] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 shadow-xs"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            {/* Quick Step Indicators */}
            <div className="hidden sm:flex items-center gap-1.5">
              {recipe.steps.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    idx === currentStepIndex
                      ? 'bg-[#234820] text-white scale-110 shadow-xs'
                      : completedSteps.includes(s.stepNumber)
                      ? 'bg-[#eaf3ea] text-[#234820] border border-[#234820]/30'
                      : 'bg-white text-[#8a8378] border border-[#e8ded2] hover:border-[#234820]'
                  }`}
                  aria-label={`Jump to step ${s.stepNumber}`}
                >
                  {s.stepNumber}
                </button>
              ))}
            </div>

            {currentStepIndex < recipe.steps.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  toggleStepDone(currentStep.stepNumber);
                  setCurrentStepIndex((prev) => prev + 1);
                }}
                className="px-6 py-3 rounded-2xl bg-[#234820] text-white text-sm font-bold hover:bg-[#1a3818] shadow-sm active:scale-98 transition-all flex items-center gap-2"
              >
                <span>Next Step</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toggleStepDone(currentStep.stepNumber);
                  onClose();
                }}
                className="px-6 py-3 rounded-2xl bg-[#b8402a] text-white text-sm font-bold hover:bg-[#943220] shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>Finish Cooking!</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Ingredients Drawer / Sidebar */}
        {showIngredientsPanel && (
          <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#e8ded2] bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-base text-[#211f1c]">
                Ingredients ({recipe.servings} Servings)
              </h3>
              <button
                type="button"
                onClick={() => setShowIngredientsPanel(false)}
                className="text-[#8a8378] hover:text-[#211f1c]"
                aria-label="Close ingredients sidebar"
              >
                <X size={16} />
              </button>
            </div>
            <ul className="space-y-2 text-xs">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="p-2 rounded-xl bg-[#faf7f2] border border-[#f0e8de] flex items-baseline justify-between gap-2"
                >
                  <span className="font-medium text-[#211f1c]">{ing.name}</span>
                  <span className="font-bold text-[#234820] shrink-0">
                    {ing.quantity !== null ? formatQuantity(ing.quantity) : ''} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Kitchen Timer Floating Widget */}
        {showTimer && (
          <div className="fixed bottom-6 right-6 z-50 bg-white border border-[#e8ded2] shadow-2xl rounded-2xl p-4 w-64 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#211f1c] flex items-center gap-1.5">
                <Timer size={14} className="text-[#234820]" />
                Kitchen Timer
              </span>
              <button
                type="button"
                onClick={() => setShowTimer(false)}
                className="text-[#8a8378] hover:text-[#211f1c]"
                aria-label="Close timer widget"
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-3xl font-mono font-bold text-center py-2 text-[#211f1c]">
              {formatTimer(timerSeconds)}
            </div>

            {/* Timer quick adjustment buttons */}
            <div className="flex justify-center gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => setTimerSeconds((prev) => prev + 60)}
                className="px-2 py-0.5 rounded-md bg-[#f0e8de] text-[11px] font-semibold text-[#5e5952] hover:bg-[#e8ded2]"
              >
                +1 min
              </button>
              <button
                type="button"
                onClick={() => setTimerSeconds((prev) => prev + 300)}
                className="px-2 py-0.5 rounded-md bg-[#f0e8de] text-[11px] font-semibold text-[#5e5952] hover:bg-[#e8ded2]"
              >
                +5 min
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(180);
                }}
                className="px-2 py-0.5 rounded-md bg-[#f0e8de] text-[11px] font-semibold text-[#5e5952] hover:bg-[#e8ded2]"
              >
                Reset
              </button>
            </div>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`w-full py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                isTimerRunning ? 'bg-[#b8402a] hover:bg-[#943220]' : 'bg-[#234820] hover:bg-[#1a3818]'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause size={14} /> Pause
                </>
              ) : (
                <>
                  <Play size={14} /> Start Timer
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
