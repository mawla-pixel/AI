import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FilmSubmission, JudgeProfile, ScoreRubric, TimecodedNote } from '../types/festival';
import { INITIAL_JUDGES } from '../data/mockFilms';
import { fetchBunnyLibraryVideos, discoverVideoLibraries } from '../services/bunnyApi';

export type PortalView = 'screening' | 'catalog' | 'deliberation';

export interface BunnySettings {
  libraryId: string;
  collectionId?: string;
  apiKey: string;
  pullZoneHost: string;
}

interface FestivalContextType {
  films: FilmSubmission[];
  isLoadingBunny: boolean;
  bunnyError: string | null;
  refetchBunnyFilms: () => Promise<void>;
  judges: JudgeProfile[];
  currentJudge: JudgeProfile;
  setCurrentJudge: (judge: JudgeProfile) => void;
  activeFilm: FilmSubmission | null;
  setActiveFilmId: (id: string | null) => void;
  activeView: PortalView;
  setActiveView: (view: PortalView) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  scores: Record<string, Record<string, ScoreRubric>>; // [judgeId][filmId]
  saveScore: (filmId: string, score: Partial<ScoreRubric>) => void;
  getJudgeScore: (judgeId: string, filmId: string) => ScoreRubric | undefined;
  getAverageScore: (filmId: string) => { average: number; count: number; outOf50: number };
  bunnySettings: BunnySettings;
  resetAllData: () => void;
}

const DEFAULT_RUBRIC: ScoreRubric = {
  visualCoherence: 8,
  storytelling: 8,
  directionCinematography: 8,
  soundDesign: 7,
  aiInnovation: 8,
  recommendation: 'official_selection',
  writtenCritique: '',
  isCompleted: false,
};

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read Bunny Stream credentials directly from Environment Variables (or fallback to stored config)
  const envApiKey = (import.meta.env.VITE_BUNNY_API_KEY as string) || '';
  const envCollectionId = (import.meta.env.VITE_BUNNY_COLLECTION_ID as string) || '';
  const envLibraryId = (import.meta.env.VITE_BUNNY_LIBRARY_ID as string) || '';
  const envPullZone = (import.meta.env.VITE_BUNNY_PULL_ZONE as string) || '';

  const [bunnySettings, setBunnySettings] = useState<BunnySettings>(() => {
    try {
      const saved = localStorage.getItem('almamoura_bunny_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          libraryId: envLibraryId || parsed.libraryId || '312840',
          collectionId: envCollectionId || parsed.collectionId || '',
          apiKey: envApiKey || parsed.apiKey || '',
          pullZoneHost: envPullZone || parsed.pullZoneHost || 'vz-312840.b-cdn.net',
        };
      }
    } catch {}

    return {
      libraryId: envLibraryId || '312840',
      collectionId: envCollectionId || '',
      apiKey: envApiKey || '',
      pullZoneHost: envPullZone || 'vz-312840.b-cdn.net',
    };
  });

  // Films state (strictly sourced from Bunny Stream)
  const [films, setFilms] = useState<FilmSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('almamoura_films');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [isLoadingBunny, setIsLoadingBunny] = useState<boolean>(false);
  const [bunnyError, setBunnyError] = useState<string | null>(null);

  // Single official judge
  const [judges] = useState<JudgeProfile[]>(INITIAL_JUDGES);
  const [currentJudge, setCurrentJudge] = useState<JudgeProfile>(INITIAL_JUDGES[0]);

  const [activeFilmId, setActiveFilmId] = useState<string | null>(films[0]?.id || null);
  const [activeView, setActiveView] = useState<PortalView>('screening');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Scores state: judgeId -> filmId -> rubric
  const [scores, setScores] = useState<Record<string, Record<string, ScoreRubric>>>(() => {
    try {
      const saved = localStorage.getItem('almamoura_scores');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Save state to localStorage
  useEffect(() => {
    if (films.length > 0) {
      localStorage.setItem('almamoura_films', JSON.stringify(films));
    }
  }, [films]);

  useEffect(() => {
    localStorage.setItem('almamoura_scores', JSON.stringify(scores));
  }, [scores]);

  // Function to load live films from Bunny Stream
  const refetchBunnyFilms = useCallback(async () => {
    const key = bunnySettings.apiKey.trim() || envApiKey.trim();
    let libId = bunnySettings.libraryId.trim() || envLibraryId.trim();
    const colId = bunnySettings.collectionId?.trim() || envCollectionId.trim();
    const pullZone = bunnySettings.pullZoneHost.trim() || envPullZone.trim() || `vz-${libId}.b-cdn.net`;

    if (!key) {
      // No API key configured yet
      return;
    }

    setIsLoadingBunny(true);
    setBunnyError(null);

    try {
      // Auto-detect library ID if not specified
      if (!libId) {
        const libs = await discoverVideoLibraries(key);
        if (libs.length > 0) {
          libId = String(libs[0].id);
          setBunnySettings((prev) => ({ ...prev, libraryId: libId }));
        }
      }

      if (!libId) {
        throw new Error('Please configure VITE_BUNNY_LIBRARY_ID in your environment variables.');
      }

      const result = await fetchBunnyLibraryVideos(libId, key, 1, 100, pullZone, colId || undefined);

      if (result.films.length > 0) {
        setFilms(result.films);
        setActiveFilmId((prev) => {
          if (prev && result.films.some((f) => f.id === prev)) return prev;
          return result.films[0].id;
        });
      } else {
        setBunnyError(colId ? `No videos found in collection ${colId}.` : 'No videos found in Bunny Stream library.');
      }
    } catch (err: any) {
      console.error('Error fetching from Bunny Stream:', err);
      setBunnyError(err.message || 'Failed to connect to Bunny Stream.');
    } finally {
      setIsLoadingBunny(false);
    }
  }, [bunnySettings, envApiKey, envLibraryId, envCollectionId, envPullZone]);

  // Auto-fetch on mount if API key is present
  useEffect(() => {
    const key = bunnySettings.apiKey.trim() || envApiKey.trim();
    if (key && films.length === 0) {
      refetchBunnyFilms();
    }
  }, [bunnySettings.apiKey, envApiKey, films.length, refetchBunnyFilms]);

  // Synchronize active film
  const activeFilm = films.find((f) => f.id === activeFilmId) || films[0] || null;

  const saveScore = (filmId: string, partial: Partial<ScoreRubric>) => {
    setScores((prev) => {
      const judgeScores = prev[currentJudge.id] || {};
      const existing = judgeScores[filmId] || { ...DEFAULT_RUBRIC };
      const updated = {
        ...existing,
        ...partial,
        verdictDate: new Date().toISOString().split('T')[0],
      };
      return {
        ...prev,
        [currentJudge.id]: {
          ...judgeScores,
          [filmId]: updated,
        },
      };
    });
  };

  const getJudgeScore = (judgeId: string, filmId: string): ScoreRubric | undefined => {
    return scores[judgeId]?.[filmId];
  };

  const getAverageScore = (filmId: string) => {
    let total = 0;
    let count = 0;
    Object.values(scores).forEach((judgeDict) => {
      const s = judgeDict[filmId];
      if (s && s.isCompleted) {
        const sum = s.visualCoherence + s.storytelling + s.directionCinematography + s.soundDesign + s.aiInnovation;
        total += sum;
        count += 1;
      }
    });

    if (count === 0) return { average: 0, count: 0, outOf50: 0 };
    const outOf50 = Number((total / count).toFixed(1));
    const average = Number(((outOf50 / 50) * 100).toFixed(1));
    return { average, count, outOf50 };
  };

  const resetAllData = () => {
    localStorage.removeItem('almamoura_films');
    localStorage.removeItem('almamoura_scores');
    localStorage.removeItem('almamoura_notes');
    setFilms([]);
    setScores({});
    refetchBunnyFilms();
  };

  return (
    <FestivalContext.Provider
      value={{
        films,
        isLoadingBunny,
        bunnyError,
        refetchBunnyFilms,
        judges,
        currentJudge,
        setCurrentJudge,
        activeFilm,
        setActiveFilmId,
        activeView,
        setActiveView,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        language,
        setLanguage,
        scores,
        saveScore,
        getJudgeScore,
        getAverageScore,
        bunnySettings,
        resetAllData,
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = () => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
};
