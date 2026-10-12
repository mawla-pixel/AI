import React from 'react';
import { FestivalProvider, useFestival } from './context/FestivalContext';
import { Header } from './components/Header';
import { ScreeningView } from './components/ScreeningView';
import { CatalogView } from './components/CatalogView';
import { DeliberationView } from './components/DeliberationView';
import { Footer } from './components/Footer';

function MainApp() {
  const { activeView, language } = useFestival();
  const isAr = language === 'ar';

  return (
    <div 
      className="min-h-screen bg-[#FAFAFA] text-stone-900 flex flex-col font-['Plus_Jakarta_Sans']"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Bar Navigation */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeView === 'screening' && <ScreeningView />}
        {activeView === 'catalog' && <CatalogView />}
        {activeView === 'deliberation' && <DeliberationView />}
      </main>

      {/* Quiet Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <FestivalProvider>
      <MainApp />
    </FestivalProvider>
  );
}
