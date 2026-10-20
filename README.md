# Dishroulette 🍲🎲

> **"What should I cook today?"** — Spontaneous, delightful recipe discovery for everyday home cooks.

Dishroulette is a complete, production-ready recipe discovery web application built from the ground up with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Vitest**.

---

## 🌟 Product Highlights

- 🎲 **Prominent "Surprise Me" Roulette** — Non-deterministic random discovery respecting active dietary constraints with smart repeat avoidance.
- 🌿 **Wild Surprise Mode** — Relaxes non-essential preferences (time, meal category) while strictly preserving hard dietary constraints.
- ⚡ **Quick Discovery Modes** — 1-tap presets for `≤ 30 Min Quick Meals`, `Breakfast Inspiration`, `Dinner Comfort`, `Sweet Treats`, and `Indian Regional Classics`.
- 🧺 **"Use What I Have" Pantry Matcher** — Interactive ingredient selector with one-tap staples (tomatoes, eggs, paneer, chickpeas, rice, pasta) plus custom inputs, showing clear explanations like *"Uses 4 of your 5 ingredients (need cumin and garlic)"*.
- 👨‍🍳 **Distraction-Free Kitchen Cooking Mode** — Large high-contrast typography, interactive step checkboxes, collapsible ingredients sheet, and a built-in kitchen timer.
- 👥 **Dynamic Serving Adjuster** — Scales ingredient measurements with clean culinary fraction formatting (`½`, `¼`, `¾`, `1 ½`) while preserving original ratios.
- 💾 **Local Offline Persistence** — Save favorites and review discovery history with zero mandatory sign-up, with robust error handling for private browsing / corrupted storage.
- 🎨 **Warm Editorial Culinary Aesthetic** — Warm cream backgrounds (`#faf7f2`), deep forest green (`#234820`), muted olive (`#586638`), and warm terracotta accents with accessible contrast and reduced-motion support.

---

## 🥗 Curated Recipe Catalogue

Dishroulette ships with a rich, curated dataset of diverse recipes featuring:
- **Indian Home Cooking**: *Dal Tadka, Palak Paneer, Aloo Gobi Matar, Punjabi Rajma Masala, Amritsari Chole, Vegetable Dum Biryani, Kanda Batata Poha, South Indian Rava Upma, Crispy Masala Dosa, Moong Dal Khichdi, Dhaba-Style Baingan Bharta, Mumbai Pav Bhaji, Paneer Butter Masala, Murgh Makhani (Butter Chicken), Kadak Masala Chai, Crispy Punjabi Samosas, Homestyle Chana Masala, Moong Dal Cheela, Spiced Saag Aloo, Chicken Tikka Masala.*
- **International Flavors**: *Authentic Pasta Carbonara, Penne all'Arrabbiata, Neapolitan Pizza Margherita, Creamy Mushroom Risotto, Greek Horiatiki Salad, Classic Shakshuka, Silky Velvet Hummus, French Onion Soup Gratinée, French Butter Omelette, Street-Style Pad Thai, Wok-Tossed Egg Fried Rice, Traditional Japanese Miso Soup, Rich Chashu Ramen, Tacos al Pastor, Fresh Molcajete Guacamole, Artisan Avocado Toast, Classic Caesar Salad, Fudgy Cocoa Brownies, Fluffy Banana Pancakes, Classic French Lemon Tart, Roasted Tomato & Basil Soup, Crème Caramel.*

Every recipe includes:
- Clear prep and cook times shown separately and totaled
- Difficulty ratings (Easy, Medium, Advanced)
- Dietary tags (Vegetarian, Vegan, Egg-Free, Gluten-Free, Dairy-Free, Non-Vegetarian)
- Scalable ingredient quantities with standard culinary units
- Step-by-step numbered preparation instructions with chef's tips
- Food photography from Unsplash with automatic emoji fallbacks

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev) with [TypeScript](https://www.typescriptlang.org)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- **Routing**: [React Router v7 / v6](https://reactrouter.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Testing**: [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
- **Animation & Effects**: [canvas-confetti](https://github.com/catdad/canvas-confetti)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+ (tested on v24.14.1)
- npm v9+ (tested on v11.11.0)

### Installation

```bash
# Clone or navigate to the repository
cd dishroulette

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification

Run the full automated unit test suite with Vitest:

```bash
# Run all tests once
npm test
# or
npx vitest run

# Run tests in interactive watch mode
npm run test:watch
```

### Test Coverage Highlights:
- **`recipeService.test.ts`**: Verifies strict dietary filtering as hard constraints, cuisine/meal-type/time/difficulty/search matching, non-deterministic random selection, repeat avoidance, serving size scaling, fraction formatting, and ingredient matching algorithms.
- **`storageService.test.ts`**: Verifies favorites toggle/retrieval, history queue deduplication and max limit cap, individual removal, clearing, and graceful handling of corrupted or unavailable `localStorage`.

---

## 📦 Production Build

```bash
# Type check and build production bundle
npm run build

# Preview the production build locally
npm run preview
```

---

## 📁 Architecture & File Layout

```
dishroulette/
├── index.html                   # HTML entry point with fonts & meta tags
├── vite.config.ts               # Vite configuration with Tailwind and Vitest
├── package.json                 # Dependencies and npm scripts
├── .env.example                 # Environment variables template
└── src/
    ├── main.tsx                 # App bootstrap with BrowserRouter & AppProvider
    ├── App.tsx                  # Main router definitions
    ├── index.css                # Tailwind CSS layers, tokens, scrollbars, accessibility
    ├── types/
    │   └── recipe.ts            # TypeScript domain types (Recipe, FilterState, etc.)
    ├── data/
    │   └── recipes.ts           # Curated recipe catalogue & metadata utilities
    ├── services/
    │   ├── recipeService.ts     # Filtering, random selection, ingredient matching, scaling
    │   ├── storageService.ts    # Safe localStorage persistence for favorites & history
    │   └── __tests__/           # Vitest unit test suites
    ├── context/
    │   └── AppContext.tsx       # React Context for global state & storage synchronization
    ├── components/
    │   ├── Layout.tsx           # Global responsive shell, headers, and footer
    │   ├── Navbar.tsx           # Desktop top bar & mobile fixed bottom nav
    │   ├── SurpriseMachine.tsx  # Central random discovery engine & quick roll presets
    │   ├── RecipeCard.tsx       # Recipe card with fallback image, tags, & match info
    │   ├── FilterDrawer.tsx     # Slide-over multi-criteria filtering drawer
    │   ├── IngredientPantryModal.tsx # "Use What I Have" ingredient matcher
    │   ├── CookingModeModal.tsx # Fullscreen kitchen cooking mode with timer
    │   └── ShareModal.tsx       # Web Share API & clipboard copy modal
    └── pages/
        ├── DiscoverPage.tsx     # Central discovery hub & spotlight showcase
        ├── RecipePage.tsx       # Comprehensive recipe detail & instructions view
        ├── SearchPage.tsx       # Keyword search & live pantry ingredient matching
        ├── FavoritesPage.tsx    # Saved recipes library
        └── HistoryPage.tsx      # Recently discovered & viewed timeline
```

---

## 🔌 Extending With an External Recipe API

Dishroulette's data layer is deliberately decoupled from UI components. To add an external API (such as Spoonacular, TheMealDB, or Edamam):

1. Copy `.env.example` to `.env.local` and add your API credentials:
   ```bash
   VITE_RECIPE_API_KEY=your_key_here
   ```
2. Create an API provider in `src/services/apiRecipeService.ts`.
3. Normalize the external API response into Dishroulette's internal `Recipe` interface (defined in `src/types/recipe.ts`).
4. Fall back to `recipes` from `src/data/recipes.ts` whenever network errors or rate limits occur.

---

## ♿ Accessibility & Edge Case Handling

- **Keyboard Navigation**: Full tab ordering, visible focus outlines (`--forest-700`), and keyboard arrow controls in Cooking Mode.
- **Color Independence**: Dietary tags use distinct labels, icons, and borders—never color alone.
- **Storage Resilience**: Corrupted or blocked browser storage falls back silently to memory storage without crashing.
- **Image Resilience**: Any failing image URL automatically falls back to culinary emoji badges.
- **Reduced Motion**: Respects `prefers-reduced-motion` by disabling transitions and particle effects.

---

## 📄 License & Attribution

- Recipe content is adapted from established traditional culinary recipes for educational and home cooking purposes.
- Photography courtesy of [Unsplash](https://unsplash.com) under the Unsplash License.
