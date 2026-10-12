import { FilmSubmission, JudgeProfile } from '../types/festival';

export const INITIAL_JUDGES: JudgeProfile[] = [
  {
    id: 'jury-official',
    name: 'Festival Jury',
    nameAr: 'لجنة التحكيم الرسمية',
    title: 'Official Film Adjudicator',
    titleAr: 'محكم المسابقة الرسمية',
    institution: 'Al Mamoura Film Festival',
    avatarSeed: 'Jury',
    role: 'jury_member',
  },
];

// No demo data — films are fetched live from Bunny Stream via environment variables / configuration
export const INITIAL_FILMS: FilmSubmission[] = [];

export const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  all: { en: 'All Submissions', ar: 'جميع الأفلام' },
  narrative: { en: 'Narrative Short', ar: 'الروائي القصير' },
  scifi: { en: 'Sci-Fi & Speculative', ar: 'الخيال العلمي' },
  animation: { en: 'Animation', ar: 'التحريك' },
  experimental: { en: 'Experimental', ar: 'التجريبي' },
  documentary: { en: 'Documentary', ar: 'الوثائقي' },
};
