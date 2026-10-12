import { FilmSubmission, AICategory } from '../types/festival';

export interface BunnyVideoItem {
  guid: string;
  videoLibraryId: number;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number; // in seconds
  status: number; // 0=Queued, 1=Processing, 2=Encoding, 3=Finished, 4=ResolutionFinished, 5=Failed
  framerate?: number;
  rotation?: number;
  width?: number;
  height?: number;
  availableResolutions?: string;
  thumbnailCount?: number;
  encodeProgress?: number;
  storageSize?: number;
  hasMP4Fallback?: boolean;
  collectionId?: string;
  thumbnailFileName?: string;
}

export interface BunnyLibraryResponse {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  items: BunnyVideoItem[];
}

export const cleanFilmTitle = (rawTitle: string): { title: string; director: string } => {
  // Frequently festival videos in Bunny Stream are named like:
  // "The Dunes of Mirage - Zaid Al Mansoori.mp4" or "01_Echoes_of_the_Falcon" or "Title by Director"
  let clean = rawTitle.replace(/\.(mp4|mov|mkv|webm|avi|m4v)$/i, '').trim();
  clean = clean.replace(/^[0-9]+[_\s.-]+/, ''); // remove leading numbering if present

  if (clean.includes(' - ')) {
    const [t, d] = clean.split(' - ');
    return { title: t.trim(), director: d.trim() };
  }
  if (clean.includes(' by ')) {
    const [t, d] = clean.split(' by ');
    return { title: t.trim(), director: d.trim() };
  }
  if (clean.includes(' _ ')) {
    const [t, d] = clean.split(' _ ');
    return { title: t.trim(), director: d.trim() };
  }

  return { title: clean, director: 'Festival Contestant' };
};

const inferCategoryFromTitle = (title: string): AICategory => {
  const lower = title.toLowerCase();
  if (lower.includes('scifi') || lower.includes('space') || lower.includes('cyber') || lower.includes('dune') || lower.includes('future') || lower.includes('oracle')) {
    return 'scifi';
  }
  if (lower.includes('anim') || lower.includes('constellation') || lower.includes('weaver') || lower.includes('dream') || lower.includes('silk') || lower.includes('geometric')) {
    return 'animation';
  }
  if (lower.includes('doc') || lower.includes('scribe') || lower.includes('memory') || lower.includes('heritage') || lower.includes('archive') || lower.includes('real')) {
    return 'documentary';
  }
  if (lower.includes('exper') || lower.includes('sound') || lower.includes('synesthesia') || lower.includes('glass') || lower.includes('noise') || lower.includes('glitch')) {
    return 'experimental';
  }
  return 'narrative';
};

const formatSecondsToMinutes = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '06:30';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const discoverVideoLibraries = async (apiKey: string): Promise<{ id: number; name: string }[]> => {
  try {
    const res = await fetch('/bunny-mgmt-api/videolibrary', {
      headers: { AccessKey: apiKey.trim(), Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((lib: any) => ({ id: lib.Id, name: lib.Name }));
      }
    }
  } catch (err) {
    console.warn('Auto-discovery error:', err);
  }
  return [];
};

export const fetchBunnyLibraryVideos = async (
  libraryId: string,
  apiKey: string,
  page: number = 1,
  itemsPerPage: number = 100,
  pullZoneHost?: string,
  collectionId?: string
): Promise<{ total: number; films: FilmSubmission[] }> => {
  // Use Vite proxy endpoint
  let url = `/bunny-api/library/${libraryId.trim()}/videos?page=${page}&itemsPerPage=${itemsPerPage}&orderBy=date`;
  if (collectionId && collectionId.trim()) {
    url += `&collection=${encodeURIComponent(collectionId.trim())}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AccessKey: apiKey.trim(),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Bunny Stream API returned error ${response.status}: ${response.statusText}`);
  }

  const data: BunnyLibraryResponse = await response.json();
  const cdnHost = pullZoneHost?.trim() || `vz-${libraryId.trim()}.b-cdn.net`;

  const films: FilmSubmission[] = (data.items || []).map((item, idx) => {
    const { title, director } = cleanFilmTitle(item.title);
    const category = inferCategoryFromTitle(item.title);
    const runtimeFormatted = formatSecondsToMinutes(item.length);
    const runtimeMinutes = Number((item.length / 60).toFixed(1));

    // Determine aspect ratio from width/height if available
    let aspectRatio: '16:9' | '2.39:1' | '4:3' = '16:9';
    if (item.width && item.height) {
      const ratio = item.width / item.height;
      if (ratio > 2.2) aspectRatio = '2.39:1';
      else if (ratio < 1.5) aspectRatio = '4:3';
    }

    const gradients = [
      'from-amber-950/80 via-stone-900 to-black',
      'from-indigo-950/80 via-slate-900 to-black',
      'from-emerald-950/80 via-stone-900 to-black',
      'from-cyan-950/80 via-stone-900 to-black',
      'from-purple-950/80 via-stone-900 to-black',
      'from-stone-900 via-stone-950 to-black',
    ];

    return {
      id: `bunny-${item.guid}`,
      title: title || `AI Film #${page * 100 + idx + 1}`,
      titleAr: title || `فيلم الذكاء الاصطناعي #${page * 100 + idx + 1}`,
      director: director || 'Al Mamoura Filmmaker',
      country: idx % 3 === 0 ? 'United Arab Emirates' : idx % 3 === 1 ? 'Saudi Arabia' : 'International',
      countryCode: 'AE',
      category,
      runtimeMinutes: runtimeMinutes > 0 ? runtimeMinutes : 7.5,
      runtimeFormatted,
      year: 2026,
      aspectRatio,
      aiToolchain: ['Runway Gen-3', 'Midjourney v6.1', 'ElevenLabs', 'ComfyUI'],
      synopsis: `Official AI competition entry streamed via Bunny Stream library ${libraryId}.`,
      synopsisAr: `مشاركة رسمية ضمن مسابقة سينما الذكاء الاصطناعي بمهرجان المعمورة الدولي، مستضافة عبر شبكة Bunny Stream.`,
      directorStatement: 'Exploration of human emotion, Arab narrative heritage, and latent space diffusion aesthetics.',
      posterBgGradient: gradients[idx % gradients.length],
      accentColor: '#C9A84C',
      bunnyStream: {
        libraryId: String(libraryId).trim(),
        videoId: item.guid,
        directIframeUrl: `https://iframe.mediadelivery.net/embed/${libraryId.trim()}/${item.guid}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`,
        directHlsUrl: `https://${cdnHost}/${item.guid}/playlist.m3u8`,
        fallbackVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        cdnHostname: cdnHost,
      },
    };
  });

  return {
    total: data.totalItems || films.length,
    films,
  };
};

// Generates the comprehensive 96-film official Al Mamoura AI Contest lineup
export const generateOfficial96FilmsLineup = (libraryId = '312840', pullZone = 'vz-312840.b-cdn.net'): FilmSubmission[] => {
  const titles = [
    { en: 'The Dunes of Mirage', ar: 'كثبان السراب', dir: 'Zaid Al Mansoori', c: 'United Arab Emirates', cat: 'scifi' as AICategory, tools: ['Runway Gen-3', 'Midjourney v6.1', 'ElevenLabs'] },
    { en: 'The Weaver of Constellations', ar: 'ناسج الأبراج السماوية', dir: 'Amina Nour & Kenzo Tanaka', c: 'Egypt / Japan', cat: 'animation' as AICategory, tools: ['Kling AI 1.5', 'Sora Preview', 'Suno v3.5'] },
    { en: 'Echoes of the Falcon', ar: 'صدى الصقر الأبدي', dir: 'Sultan Al Qassimi', c: 'United Arab Emirates', cat: 'narrative' as AICategory, tools: ['Luma Dream Machine', 'Runway Gen-3', 'PlayHT'] },
    { en: 'The Neural Scribe', ar: 'الناسخ العصبي', dir: 'Nadia Benali', c: 'Morocco / France', cat: 'documentary' as AICategory, tools: ['Whisper AI', 'Pika 2.0', 'SDXL Arabic Script'] },
    { en: 'Synesthesia: City of Glass', ar: 'التوافق الحسي: مدينة الزجاج', dir: 'Marcus Sterling', c: 'United Kingdom', cat: 'experimental' as AICategory, tools: ['Deforum Diffusion', 'AnimateDiff', 'TouchDesigner'] },
    { en: 'The Cartographer\'s Dream', ar: 'حلم رسام الخرائط', dir: 'Layla Al Hashemi & Leo Vance', c: 'Saudi Arabia / USA', cat: 'narrative' as AICategory, tools: ['Runway Gen-3', 'Midjourney v6', 'Custom LoRA'] },
    { en: 'Shadows of Liwa', ar: 'ظلال ليوا', dir: 'Hamad Al Dhaheri', c: 'United Arab Emirates', cat: 'scifi' as AICategory, tools: ['Kling AI', 'ElevenLabs', 'ComfyUI'] },
    { en: 'Submerged Melodies', ar: 'ألحان مغمورة في الخليج', dir: 'Maryam Fikri', c: 'United Arab Emirates', cat: 'animation' as AICategory, tools: ['Stable Diffusion 3', 'Runway', 'Suno AI'] },
    { en: 'Oasis Algorithm', ar: 'خوارزمية الواحة', dir: 'Tariq Belkacem', c: 'Algeria', cat: 'documentary' as AICategory, tools: ['Midjourney', 'ElevenLabs', 'Pika'] },
    { en: 'The Silicon Astrolabe', ar: 'إسطرلاب السيليكون', dir: 'Dr. Faris Al Rawi', c: 'Iraq / UK', cat: 'scifi' as AICategory, tools: ['Sora', 'Runway Gen-3', 'Udio'] },
    { en: 'Chronicles of the Date Palm', ar: 'سجلات النخلة العتيقة', dir: 'Fatima Al Suwaidi', c: 'United Arab Emirates', cat: 'documentary' as AICategory, tools: ['Kling 1.5', 'SDXL', 'ElevenLabs'] },
    { en: 'Resonance of the Dhow', ar: 'صدى المحمل الخشبي', dir: 'Ibrahim Al Marzouqi', c: 'Kuwait', cat: 'narrative' as AICategory, tools: ['Runway Gen-3', 'Midjourney', 'AudioLDM'] },
    { en: 'Luminescence: Abu Dhabi 2099', ar: 'توهج: أبوظبي 2099', dir: 'Soraya Vance', c: 'UAE / Canada', cat: 'scifi' as AICategory, tools: ['Luma Dream Machine', 'Runway Gen-3', 'Flux'] },
    { en: 'The Glass Nomad', ar: 'البدوي الزجاجي', dir: 'Kareem Jamil', c: 'Jordan', cat: 'experimental' as AICategory, tools: ['AnimateDiff', 'ComfyUI', 'Max/MSP'] },
    { en: 'Echoes in the Majlis', ar: 'أصداء في المجلس', dir: 'Rashid Al Nuaimi', c: 'United Arab Emirates', cat: 'narrative' as AICategory, tools: ['Runway Gen-3', 'ElevenLabs Pro'] },
    { en: 'The Algorithm of Frankincense', ar: 'خوارزمية اللبان', dir: 'Salim Al Balushi', c: 'Oman', cat: 'documentary' as AICategory, tools: ['Whisper', 'Midjourney v6', 'Pika'] },
    { en: 'Celestial Arabesque', ar: 'الزخرفة السماوية', dir: 'Yuki Takahashi & Farah Zein', c: 'Japan / Lebanon', cat: 'animation' as AICategory, tools: ['Kling AI', 'ComfyUI ControlNet', 'Suno'] },
    { en: 'The Last Pearl Diver\'s Code', ar: 'شفرة غواص اللؤلؤ الأخير', dir: 'Khalid Al Muhairi', c: 'United Arab Emirates', cat: 'narrative' as AICategory, tools: ['Runway Gen-3', 'ElevenLabs', 'Topaz AI'] },
    { en: 'Synthetic Monsoon', ar: 'رياح موسمية مصطنعة', dir: 'Ananya Sharma', c: 'India / UAE', cat: 'experimental' as AICategory, tools: ['Deforum', 'Stable Audio', 'TouchDesigner'] },
    { en: 'Guardians of the Red Dunes', ar: 'حراس الكثبان الحمراء', dir: 'Nasser Al Kaabi', c: 'United Arab Emirates', cat: 'scifi' as AICategory, tools: ['Runway Gen-3', 'Midjourney', 'ElevenLabs'] },
    { en: 'The Infinite Carpet', ar: 'السجادة اللانهائية', dir: 'Parisa Ghasemi', c: 'Iran / France', cat: 'animation' as AICategory, tools: ['Flux.1', 'Kling AI', 'Suno'] },
    { en: 'Whispers from Qasr Al Hosn', ar: 'همسات من قصر الحصن', dir: 'Moza Al Remeithi', c: 'United Arab Emirates', cat: 'documentary' as AICategory, tools: ['SDXL Historical LoRA', 'Runway Gen-3'] },
    { en: 'Bioluminescent Mangroves', ar: 'أشجار القرم المضيئة حيوياً', dir: 'Dr. Liam Thorne', c: 'Australia / UAE', cat: 'scifi' as AICategory, tools: ['Luma Dream Machine', 'Midjourney v6.1'] },
    { en: 'The Calligraphy of Wind', ar: 'خطاطة الرياح', dir: 'Adel Mansour', c: 'Tunisia', cat: 'experimental' as AICategory, tools: ['ComfyUI', 'AnimateDiff', 'Stable Audio'] },
  ];

  const fullLineup: FilmSubmission[] = [];
  const gradients = [
    'from-amber-950/80 via-stone-900 to-black',
    'from-indigo-950/80 via-slate-900 to-black',
    'from-emerald-950/80 via-stone-900 to-black',
    'from-cyan-950/80 via-slate-900 to-black',
    'from-purple-950/80 via-stone-900 to-black',
    'from-rose-950/80 via-stone-900 to-black',
    'from-amber-900/80 via-stone-950 to-black',
    'from-blue-950/80 via-stone-900 to-black',
  ];

  const fallbackVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  ];

  // Generate exactly 96 films
  for (let i = 0; i < 96; i++) {
    const template = titles[i % titles.length];
    const cycle = Math.floor(i / titles.length) + 1;
    const filmIndex = i + 1;
    const paddedIndex = String(filmIndex).padStart(2, '0');

    const filmTitle = cycle > 1 ? `${template.en} (Part ${cycle})` : template.en;
    const filmTitleAr = cycle > 1 ? `${template.ar} (الجزء ${cycle})` : template.ar;
    
    // Realistic pseudo-random runtime between 4:30 and 14:45
    const totalSecs = 270 + ((i * 37) % 600);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const runtimeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const runtimeMinutes = Number((totalSecs / 60).toFixed(1));

    // Realistic Bunny GUID
    const hexHash = `${filmIndex.toString(16).padStart(4, '0')}4fa1-8290-482a-9e8c-${(100000000000 + i).toString(16)}`;

    fullLineup.push({
      id: `film-${filmIndex}`,
      title: filmTitle,
      titleAr: filmTitleAr,
      director: template.dir,
      country: template.c,
      countryCode: template.c.includes('UAE') ? 'AE' : 'INTL',
      category: template.cat,
      runtimeMinutes,
      runtimeFormatted,
      year: 2026,
      aspectRatio: i % 3 === 0 ? '2.39:1' : i % 3 === 1 ? '16:9' : '4:3',
      featured: i < 6,
      aiToolchain: template.tools,
      synopsis: `Official Entry #${paddedIndex} in the Al Mamoura International Film Festival AI Competition. Hosted on Bunny Stream.`,
      synopsisAr: `الفيلم الرسمي رقم #${paddedIndex} ضمن المسابقة الدولية لأفلام وسينما الذكاء الاصطناعي بمهرجان المعمورة. مستضاف عبر Bunny Stream.`,
      directorStatement: `Statement for film #${paddedIndex}: Investigating machine intelligence and visual poetics for the Al Mamoura Jury.`,
      posterBgGradient: gradients[i % gradients.length],
      accentColor: '#C9A84C',
      bunnyStream: {
        libraryId,
        videoId: hexHash,
        directIframeUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${hexHash}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`,
        directHlsUrl: `https://${pullZone}/${hexHash}/playlist.m3u8`,
        fallbackVideoUrl: fallbackVideos[i % fallbackVideos.length],
        cdnHostname: pullZone,
      },
    });
  }

  return fullLineup;
};
