import React from 'react';

interface AlMamouraLogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AlMamouraLogo: React.FC<AlMamouraLogoProps> = ({
  variant = 'light',
  className = '',
  showText = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { height: 38, width: 95 },
    md: { height: 46, width: 115 },
    lg: { height: 68, width: 170 },
    xl: { height: 96, width: 240 },
  };

  const { height } = sizeMap[size];

  // Signature antique bronze gold from the official Al Mamoura emblem
  const goldColor = '#9E7A2A'; 
  const isDark = variant === 'dark';
  const textColor = isDark ? '#FAF7F2' : '#18181B';
  const cutoutFill = isDark ? '#090A0D' : '#FFFFFF';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 240 220"
        height={height}
        className="w-auto shrink-0 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Al Mamoura Film Festival Logo"
      >
        <g id="al-mamoura-emblem">
          {/* Film Strip Fronds (emerging dynamically from top-left) */}
          <g id="film-strip-fronds" stroke={textColor} strokeWidth="1.8" fill="none">
            {/* Top frond strip */}
            <path
              d="M 68 102 C 64 80, 72 62, 70 48 C 76 60, 88 80, 92 102"
              fill={textColor}
              fillOpacity="0.1"
            />
            <path d="M 69 52 L 73 54 M 68 64 L 74 66 M 68 76 L 76 78 M 70 88 L 80 90 M 74 98 L 86 100" strokeWidth="1.2" />

            {/* Middle arching frond strip */}
            <path
              d="M 68 102 C 55 90, 44 78, 38 72 C 48 76, 60 88, 68 102"
              fill={textColor}
              fillOpacity="0.1"
            />
            <path d="M 40 73 L 44 77 M 46 78 L 51 83 M 53 84 L 59 90 M 60 92 L 66 97" strokeWidth="1.2" />

            {/* Lower arching frond strip */}
            <path
              d="M 68 102 C 50 98, 36 94, 28 92 C 40 100, 56 102, 68 102"
              fill={textColor}
              fillOpacity="0.1"
            />
            <path d="M 30 93 L 32 98 M 40 95 L 42 100 M 50 97 L 53 102 M 60 99 L 63 103" strokeWidth="1.2" />
          </g>

          {/* Central Calligraphic Architecture "المعمورة" */}
          {/* Left Block ('ة') */}
          <rect x="15" y="106" width="36" height="66" rx="2" fill={textColor} />
          <rect x="23" y="118" width="20" height="42" rx="1" fill={cutoutFill} />
          {/* Top rectangular accent dot on 'ة' */}
          <rect x="19" y="99" width="16" height="5" rx="0.5" fill={textColor} />

          {/* 'و' & 'ر' descending loops */}
          <path
            d="M 53 106 H 88 V 172 H 72 V 158 H 53 V 106 Z"
            fill={textColor}
          />
          <rect x="65" y="118" width="11" height="40" rx="1" fill={cutoutFill} />
          <path
            d="M 88 106 H 108 V 178 C 108 184, 102 188, 92 188 H 88 V 174 H 92 C 95 174, 96 172, 96 168 V 106 Z"
            fill={textColor}
          />

          {/* Golden Center Column: The iconic Antique Bronze Gold Block 'م' */}
          <g id="golden-center-core">
            <rect x="114" y="52" width="28" height="64" rx="1" fill={goldColor} />
            {/* Center aperture slit */}
            <rect x="126" y="62" width="4" height="44" rx="1" fill={cutoutFill} />
          </g>

          {/* Arabic First Section "المع" */}
          <path
            d="M 88 52 H 114 V 116 H 100 V 66 H 88 V 52 Z"
            fill={textColor}
          />
          <path
            d="M 100 66 H 114 V 116 H 100 Z"
            fill={textColor}
          />

          {/* Right Pillars "ال" */}
          <rect x="142" y="52" width="20" height="64" rx="1" fill={textColor} />
          <rect x="164" y="46" width="18" height="70" rx="1" fill={textColor} />
          <rect x="184" y="46" width="18" height="70" rx="1" fill={textColor} />
          <path
            d="M 148 64 H 156 V 110 H 148 Z"
            fill={cutoutFill}
          />
        </g>

        {/* English Festival Typography */}
        {showText && (
          <g id="festival-english-title" fill={textColor} textAnchor="start">
            <text
              x="88"
              y="136"
              fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif"
              fontSize="16"
              fontWeight="800"
              letterSpacing="2.5"
            >
              AL MAMOURA
            </text>
            <text
              x="88"
              y="155"
              fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif"
              fontSize="14"
              fontWeight="600"
              letterSpacing="9"
            >
              FILM
            </text>
            <text
              x="88"
              y="174"
              fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif"
              fontSize="13"
              fontWeight="600"
              letterSpacing="4"
            >
              FESTIVAL
            </text>
          </g>
        )}
      </svg>

      {/* Typography Wordmark for Header */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-['Cinzel'] tracking-wider text-base md:text-lg font-bold text-stone-900 uppercase">
            Al Mamoura
          </span>
          <span className="text-[10px] tracking-widest text-[#9E7A2A] font-semibold border border-[#9E7A2A]/40 px-1.5 py-0.2 rounded font-mono bg-[#9E7A2A]/5">
            AI JURY
          </span>
        </div>
        <span className="text-[11px] tracking-widest text-stone-500 font-['Outfit'] uppercase">
          International Film Festival
        </span>
      </div>
    </div>
  );
};
