import React from 'react';
import { useFestival, PortalView } from '../context/FestivalContext';
import { AlMamouraLogo } from './AlMamouraLogo';
import { Globe, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    films,
    language, 
    setLanguage 
  } = useFestival();

  const isAr = language === 'ar';

  const navItems: { id: PortalView; label: string; labelAr: string }[] = [
    { id: 'screening', label: 'Screening Room', labelAr: 'قاعة العرض' },
    { id: 'catalog', label: `Films (${films.length})`, labelAr: `الأفلام (${films.length})` },
    { id: 'deliberation', label: 'Jury Standings', labelAr: 'النتائج والمداولات' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Emblem */}
        <div 
          onClick={() => setActiveView('screening')}
          className="cursor-pointer shrink-0 transition-opacity hover:opacity-90"
        >
          <AlMamouraLogo variant="light" size="sm" />
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                  isActive 
                    ? 'text-[#9E7A2A] font-bold' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {isAr ? item.labelAr : item.label}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#9E7A2A] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Jury Identity & Language Switcher (No Connect button) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-white text-xs font-mono text-stone-700 hover:text-stone-900 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#9E7A2A]" />
            <span className="font-semibold">{language === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Clean Official Jury Identity */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-800">
            <div className="w-5 h-5 rounded-full bg-[#9E7A2A]/15 border border-[#9E7A2A]/40 flex items-center justify-center text-[10px] text-[#9E7A2A] font-bold">
              J
            </div>
            <span className="font-medium">
              {isAr ? 'لجنة تحكيم المعمورة' : 'Al Mamoura Jury'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
