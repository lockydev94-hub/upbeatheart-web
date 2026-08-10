'use client'

/**
 * PulsingHeart — the living centrepiece the slider animates around.
 *
 * Layers, back to front:
 *   1. Accent halo      — soft radial glow, tinted by the active slide
 *   2. Beat rings       — two rings pushed outward on every "lub"
 *   3. Scan rings       — counter-rotating dashed circles (imaging feel)
 *   4. Heart SVG        — brand-gradient silhouette with chamber detail
 *   5. Flow particles   — dots travelling the circulation paths (SMIL)
 *   6. Defect → repair  — core-focus slide only: a septal defect is spotted,
 *                         then patched, on a loop
 *
 * `scale` steps up across the age slides so the heart visibly grows from
 * newborn to adult as the viewer advances through the slider.
 *
 * Everything here is decorative, so the SVG is aria-hidden and the particles
 * are dropped entirely when the visitor prefers reduced motion.
 */

interface PulsingHeartProps {
  /** Hex colour of the active slide — tints halo, rings and scan ring */
  accent: string
  /** rgba version of `accent` for the soft glow */
  glow: string
  /** Relative size, 0.76 (newborn) → 1.04 (adult) */
  scale: number
  /** Run the defect-and-repair loop (core-focus slide only) */
  showRepair?: boolean
  /** Skip the SMIL particles when the OS asks for reduced motion */
  reduced: boolean
}

/* Circulation paths the particles travel along (invisible, motion only) */
const FLOW_IN_LEFT  = 'M62 46 C 50 82 62 118 96 148'
const FLOW_IN_RIGHT = 'M138 46 C 150 82 138 118 104 148'
const FLOW_OUT      = 'M100 152 C 100 116 100 82 100 48'

const HEART_OUTLINE =
  'M100 176 C 42 132 14 103 14 71 C 14 41 38 21 64 21 C 82 21 95 31 100 43 C 105 31 118 21 136 21 C 162 21 186 41 186 71 C 186 103 158 132 100 176 Z'

export default function PulsingHeart({ accent, glow, scale, showRepair, reduced }: PulsingHeartProps) {
  return (
    <div
      className="relative w-[190px] h-[190px] sm:w-[215px] sm:h-[215px] transition-transform duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ transform: `scale(${scale})` }}
      aria-hidden
    >
      {/* ── 1. Accent halo — wider and softer on the dark field ── */}
      <div
        className="absolute inset-[-22%] rounded-full blur-[52px] transition-[background] duration-[900ms] ease-out"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 68%)` }}
      />

      {/* ── 2. Beat rings — fire on the lub and again on the dub ── */}
      <span
        className="hero-beat-ring absolute inset-[8%] rounded-full border transition-colors duration-700"
        style={{ borderColor: accent, animationDelay: '0s' }}
      />
      <span
        className="hero-beat-ring absolute inset-[8%] rounded-full border transition-colors duration-700"
        style={{ borderColor: accent, animationDelay: '0.62s' }}
      />

      {/* ── 3. Scan rings ── */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" fill="none">
        <circle
          cx="100" cy="100" r="94"
          stroke={accent} strokeOpacity="0.45" strokeWidth="1"
          strokeDasharray="3 9" strokeLinecap="round"
          className="hero-spin-cw"
          style={{ transition: 'stroke 700ms ease' }}
        />
        <circle
          cx="100" cy="100" r="82"
          stroke={accent} strokeOpacity="0.25" strokeWidth="1"
          strokeDasharray="22 14" strokeLinecap="round"
          className="hero-spin-ccw"
          style={{ transition: 'stroke 700ms ease' }}
        />
      </svg>

      {/* ── 4–6. Heart, circulation and repair story ── */}
      <svg
        className="absolute inset-0 w-full h-full hero-beat"
        style={{ filter: `drop-shadow(0 10px 32px ${glow}) drop-shadow(0 0 18px ${glow})` }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <defs>
          {/* Brand gradient — mirrors --gradient-primary */}
          <linearGradient id="heroHeartFill" x1="10" y1="15" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#1565D8" />
            <stop offset="48%"  stopColor="#18B8E6" />
            <stop offset="100%" stopColor="#18B55A" />
          </linearGradient>

          {/* Inner shading so the silhouette reads as a volume, not a flat sticker */}
          <radialGradient id="heroHeartShade" cx="38%" cy="30%" r="78%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.34" />
            <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0B2A5B" stopOpacity="0.22" />
          </radialGradient>

          <clipPath id="heroHeartClip">
            <path d={HEART_OUTLINE} />
          </clipPath>
        </defs>

        <path d={HEART_OUTLINE} fill="url(#heroHeartFill)" />

        <g clipPath="url(#heroHeartClip)">
          <rect x="0" y="0" width="200" height="200" fill="url(#heroHeartShade)" />

          {/* Chamber detail — septum down the middle, atria divided off above */}
          <path d="M100 43 C 97 84 103 126 100 176" stroke="#FFFFFF" strokeOpacity="0.30" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M30 80 C 56 96 82 90 98 76"      stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M170 80 C 144 96 118 90 102 76"  stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />

          {/* Specular highlight on the upper-left lobe */}
          <ellipse cx="56" cy="52" rx="20" ry="13" fill="#FFFFFF" opacity="0.16" transform="rotate(-28 56 52)" />

          {/* ── 5. Flow particles — two streams in, one out ── */}
          {!reduced && (
            <g>
              {[
                { path: FLOW_IN_LEFT,  dur: '2.6s', begin: '0s',   r: 3,   fill: '#FFFFFF', o: 0.9  },
                { path: FLOW_IN_LEFT,  dur: '2.6s', begin: '1.3s', r: 2.2, fill: '#FFFFFF', o: 0.55 },
                { path: FLOW_IN_RIGHT, dur: '2.6s', begin: '0.6s', r: 3,   fill: '#FFFFFF', o: 0.9  },
                { path: FLOW_IN_RIGHT, dur: '2.6s', begin: '1.9s', r: 2.2, fill: '#FFFFFF', o: 0.55 },
                { path: FLOW_OUT,      dur: '2.2s', begin: '0.3s', r: 3.4, fill: '#EAFBFF', o: 1    },
                { path: FLOW_OUT,      dur: '2.2s', begin: '1.4s', r: 2.4, fill: '#EAFBFF', o: 0.6  },
              ].map((p, i) => (
                <circle key={i} r={p.r} fill={p.fill} opacity={p.o}>
                  <animateMotion dur={p.dur} begin={p.begin} repeatCount="indefinite" path={p.path} />
                  <animate
                    attributeName="opacity"
                    values={`0;${p.o};${p.o};0`}
                    keyTimes="0;0.15;0.8;1"
                    dur={p.dur}
                    begin={p.begin}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>
          )}

          {/* ── 6. Defect spotted, then patched — core-focus slide only ── */}
          {showRepair && !reduced && (
            <g>
              {/* The hole in the septum */}
              <ellipse cx="100" cy="97" rx="9" ry="12" fill="#0B2A5B" opacity="0.55" className="hero-defect" />
              <ellipse
                cx="100" cy="97" rx="9" ry="12"
                fill="none" stroke="#FFFFFF" strokeWidth="1.6"
                className="hero-defect"
              />
              {/* The patch drawn over it */}
              <ellipse
                cx="100" cy="97" rx="11" ry="14"
                fill="none" stroke="#57D66E" strokeWidth="2.6" strokeLinecap="round"
                pathLength={100} className="hero-patch"
              />
            </g>
          )}
        </g>

        {/* Crisp outline on top of everything */}
        <path d={HEART_OUTLINE} stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
