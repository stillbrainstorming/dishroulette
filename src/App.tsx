import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DiscoverPage } from './pages/DiscoverPage';
import { RecipePage } from './pages/RecipePage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HistoryPage } from './pages/HistoryPage';

export const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
