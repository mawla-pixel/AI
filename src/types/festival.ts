export type AICategory = 
  | 'narrative'
  | 'scifi'
  | 'animation'
  | 'experimental'
  | 'documentary';

export interface ScoreRubric {
  visualCoherence: number;       // 1 - 10: Character consistency, temporal stability, prompt fidelity
  storytelling: number;          // 1 - 10: Narrative structure, emotional impact, pacing
  directionCinematography: number; // 1 - 10: Framing, virtual camera motion, lighting design, editing
  soundDesign: number;           // 1 - 10: AI voice dubbing, original score, Foley, sound mix
  aiInnovation: number;          // 1 - 10: Novelty of AI pipeline, creative risk, boundary pushing
  recommendation: 'grand_prize' | 'best_visuals' | 'best_story' | 'best_sound' | 'innovation_award' | 'official_selection' | 'unscored';
  writtenCritique: string;
  verdictDate?: string;
  isCompleted: boolean;
}

export interface TimecodedNote {
  id: string;
  filmId: string;
  judgeId: string;
  timecodeSeconds: number;
  timecodeFormatted: string; // e.g. "02:14"
  noteText: string;
  timestamp: string;
  tag?: 'visual_artifact' | 'story_beat' | 'audio_sync' | 'praise' | 'critique';
}

export interface BunnyStreamConfig {
  libraryId: string;        // e.g. "342119"
  videoId: string;          // Bunny Video GUID e.g. "9a8b7c6d-..."
  directIframeUrl?: string; // Optional full iframe URL
  directHlsUrl?: string;    // Optional direct .m3u8 stream URL
  fallbackVideoUrl?: string;// Reliable webm/mp4 sample preview
  cdnHostname?: string;     // e.g. "video.bunnycdn.com" or "vz-xyz.b-cdn.net"
}

export interface FilmSubmission {
  id: string;
  title: string;
  titleAr: string;
  director: string;
  country: string;
  countryCode: string;
  category: AICategory;
  runtimeMinutes: number;
  runtimeFormatted: string; // "08:42"
  aiToolchain: string[];   // e.g. ["Runway Gen-3", "Midjourney v6", "ElevenLabs", "Suno v3"]
  synopsis: string;
  synopsisAr: string;
  directorStatement: string;
  posterBgGradient: string;
  accentColor: string;
  bunnyStream: BunnyStreamConfig;
  aspectRatio: '16:9' | '2.39:1' | '4:3';
  year: number;
  featured?: boolean;
}

export interface JudgeProfile {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  institution: string;
  avatarSeed: string;
  role: 'president' | 'jury_member';
}
