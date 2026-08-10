'use client'

import type { SiteSettings } from '@/types/firestore'

import DoctorPanel from './hero/DoctorPanel'
import FocusSlider from './hero/FocusSlider'

interface HeroSectionProps {
  settings: SiteSettings
}

/**
 * HeroSection — deep-navy cinematic redesign.
 *
 * The hero answers, in one glance and one loop of animation:
 *   left  · WHO  — the doctor: portrait, credentials, proof, how to book
 *   right · WHAT — the five focus areas the doctor treats, told as one
 *           continuous journey around a living heart:
 *           Congenital & Structural → Babies → Children → Adolescents →
 *           Adults with congenital heart disease.
 *
 * Atmosphere: aurora light-fields drifting over a starfield, a slow-panning
 * blueprint grid, and rising ember particles — all pure CSS, all removed
 * under `prefers-reduced-motion`.
 *
 * Every hero-specific keyframe lives in the single global style block at the
 * bottom of this file; child components only reference class names. Shared
 * entrance utilities (`.anim-*`, `.delay-*`) come from globals.css.
 */
export default function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="hero-shell relative overflow-hidden bg-[#050D22] text-white">

      {/* ══ Ambient background ══ */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Base vertical wash so the navy never reads flat */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#050D22_0%,#081735_48%,#0B2049_100%)]" />

        {/* Aurora light-fields */}
        <div className="hero-aurora-a absolute -left-40 -top-44 w-[640px] h-[640px] rounded-full opacity-60"
             style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.34) 0%, transparent 62%)', filter: 'blur(70px)' }} />
        <div className="hero-aurora-b absolute -right-32 -top-20 w-[560px] h-[560px] rounded-full opacity-50"
             style={{ background: 'radial-gradient(circle, rgba(24,184,230,0.26) 0%, transparent 62%)', filter: 'blur(80px)' }} />
        <div className="hero-aurora-c absolute left-1/2 bottom-[-180px] -translate-x-1/2 w-[760px] h-[420px] rounded-full opacity-45"
             style={{ background: 'radial-gradient(circle, rgba(24,181,90,0.22) 0%, transparent 66%)', filter: 'blur(90px)' }} />

        {/* Slow-panning blueprint grid */}
        <div className="hero-grid-pan absolute inset-[-60px] opacity-[0.05]"
             style={{
               backgroundImage:
                 'linear-gradient(rgba(120,170,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(120,170,255,0.9) 1px, transparent 1px)',
               backgroundSize: '52px 52px',
             }} />

        {/* ── Floating medical instrument SVGs ── */}
        {MEDICAL_INSTRUMENTS.map((m, i) => (
          <span
            key={`mi${i}`}
            className={`hero-med-float absolute pointer-events-none select-none`}
            style={{
              left: m.x, top: m.y,
              width: m.size, height: m.size,
              opacity: m.opacity,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.dur}s`,
              color: m.color,
            }}
            aria-hidden
          >
            {m.svg}
          </span>
        ))}

        {/* Starfield — twinkling pinpoints */}
        {STARS.map((s, i) => (
          <span
            key={i}
            className="hero-star absolute rounded-full bg-white"
            style={{
              left: s.x, top: s.y, width: s.size, height: s.size,
              animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
            }}
          />
        ))}

        {/* Rising ember particles */}
        {EMBERS.map((p, i) => (
          <span
            key={`e${i}`}
            className="hero-ember absolute bottom-[-8px] rounded-full"
            style={{
              left: p.x, width: p.size, height: p.size, background: p.color,
              animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
            }}
          />
        ))}

        {/* One shooting star, occasionally */}
        <span className="hero-shooting absolute top-[14%] left-[-10%] h-px w-36 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85))' }} />

        {/* Vignette to keep focus centred */}
        <div className="absolute inset-0"
             style={{ background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(3,8,20,0.55) 100%)' }} />
      </div>

      {/* ══ Content ══ */}
      <div className="container-max px-4 md:px-8 relative z-10">
        <div className="hero-grid grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-14 items-center pt-10 pb-16 lg:pt-12 lg:pb-20">

          <DoctorPanel settings={settings} />

          <div className="w-full max-w-[560px] mx-auto lg:mx-0 lg:ml-auto">
            <FocusSlider />
          </div>
        </div>
      </div>

      {/* ══ Wave divider into the light page below ══ */}
      <div className="absolute bottom-[-1px] left-0 right-0 z-10 pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-[42px] lg:h-[64px] block">
          <path d="M0 70 L0 44 C 240 6 480 6 720 30 C 960 54 1200 54 1440 24 L1440 70 Z" fill="#F8FAFC" />
        </svg>
      </div>

      {/* ══ Hero-only keyframes and classes ══ */}
      <style jsx global>{`
        /* Header + hero fills exactly 100vh.
           Mobile:  header ≈ 120px (main bar 76px + ECG strip 44px)
           Desktop: header ≈ 152px (+ top bar 32px on md+)            */
        .hero-shell { min-height: calc(100dvh - 120px); }
        .hero-grid  { min-height: calc(100dvh - 120px); }
        @media (min-width: 768px) {
          .hero-shell,
          .hero-grid { min-height: calc(100dvh - 152px); }
        }

        /* Angle used by the spinning conic gradients. */
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes heroAngleSpin { to { --angle: 360deg; } }

        /* ── Card border ring ─────────────────────────────────────────── */
        .hero-ring {
          background: conic-gradient(from var(--angle),
            rgba(91,155,255,0.9), rgba(65,214,255,0.9),
            rgba(62,230,143,0.9), rgba(91,155,255,0.15), rgba(91,155,255,0.9));
          opacity: 0.5;
          animation: heroAngleSpin 5s linear infinite;
        }

        /* ── Portrait halo ────────────────────────────────────────────── */
        .hero-portrait-halo {
          background: conic-gradient(from var(--angle),
            #5B9BFF, #41D6FF, #3EE68F, #F97BB9, #5B9BFF);
          animation: heroAngleSpin 6s linear infinite;
        }

        /* ── Light sweep across the portrait ──────────────────────────── */
        .hero-portrait-sheen {
          background: linear-gradient(105deg, transparent 32%, rgba(255,255,255,0.4) 48%, transparent 64%);
          background-size: 260% 100%;
          background-repeat: no-repeat;
          animation: heroSheen 6s ease-in-out infinite;
        }
        @keyframes heroSheen {
          0%        { background-position: 190% 0; }
          40%, 100% { background-position: -90% 0; }
        }

        /* ── CTA shimmer on hover ─────────────────────────────────────── */
        .hero-cta::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 36%, rgba(255,255,255,0.38) 50%, transparent 64%);
          background-size: 260% 100%;
          background-repeat: no-repeat;
          background-position: 190% 0;
          transition: background-position 0.85s ease;
          pointer-events: none;
        }
        .hero-cta:hover::after { background-position: -90% 0; }

        /* ── Animated gradient headline ───────────────────────────────── */
        .hero-title-grad {
          background: linear-gradient(90deg, #FFFFFF 0%, #9CC4FF 30%, #6FE3FF 55%, #FFFFFF 80%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: heroTitleGrad 5.5s ease-in-out infinite;
        }
        @keyframes heroTitleGrad {
          0%, 100% { background-position: 0% 0; }
          50%      { background-position: 100% 0; }
        }

        /* ── The heartbeat: a lub-dub, not a metronome ────────────────── */
        .hero-beat {
          transform-origin: center;
          animation: heroBeat 2.2s ease-in-out infinite;
        }
        @keyframes heroBeat {
          0%, 100% { transform: scale(1);     }
          12%      { transform: scale(1.055); }
          24%      { transform: scale(1.005); }
          36%      { transform: scale(1.032); }
          50%      { transform: scale(1);     }
        }

        /* Rings pushed out on each beat — second one delayed to the "dub". */
        .hero-beat-ring {
          opacity: 0;
          animation: heroBeatRing 2.2s ease-out infinite;
        }
        @keyframes heroBeatRing {
          0%   { transform: scale(0.88); opacity: 0.55; }
          70%  { opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* ── Counter-rotating scan rings around the heart ─────────────── */
        .hero-spin-cw,
        .hero-spin-ccw {
          transform-box: fill-box;
          transform-origin: center;
        }
        .hero-spin-cw  { animation: heroSpinCW  26s linear infinite; }
        .hero-spin-ccw { animation: heroSpinCCW 34s linear infinite; }
        @keyframes heroSpinCW  { to { transform: rotate(360deg);  } }
        @keyframes heroSpinCCW { to { transform: rotate(-360deg); } }

        /* ── ECG: one bright pulse travelling the resting trace ───────── */
        .hero-ecg-sweep {
          stroke-dasharray: 90 910;
          animation: heroEcgSweep 3.4s linear infinite;
        }
        @keyframes heroEcgSweep {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0; }
        }

        /* ── Defect spotted, then patched (core-focus stage) ──────────── */
        .hero-defect { animation: heroDefect 5s ease-in-out infinite; }
        @keyframes heroDefect {
          0%, 6%    { opacity: 0; }
          14%, 46%  { opacity: 1; }
          62%, 100% { opacity: 0; }
        }
        .hero-patch {
          stroke-dasharray: 100;
          animation: heroPatch 5s ease-in-out infinite;
        }
        @keyframes heroPatch {
          0%, 44%   { stroke-dashoffset: 100; opacity: 0; }
          48%       { opacity: 1; }
          70%, 88%  { stroke-dashoffset: 0; opacity: 1; }
          100%      { stroke-dashoffset: 0; opacity: 0; }
        }

        /* ── Live availability dot ────────────────────────────────────── */
        .hero-live-ping { animation: heroPing 1.9s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @keyframes heroPing {
          0%   { transform: scale(1);   opacity: 0.65; }
          80%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }

        /* ── Stage chip / age badge popping in ────────────────────────── */
        .hero-chip-in { animation: heroChipIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes heroChipIn {
          0%   { opacity: 0; transform: scale(0.8); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* ── Orbit node glow when its stage is active ─────────────────── */
        .hero-node-active { animation: heroNodePulse 2.2s ease-in-out infinite; }
        @keyframes heroNodePulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--node-glow, rgba(91,155,255,0.45)); }
          50%      { box-shadow: 0 0 0 9px transparent; }
        }

        /* ── Autoplay progress under the journey ──────────────────────── */
        @keyframes heroStageProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ── Aurora drift ─────────────────────────────────────────────── */
        .hero-aurora-a { animation: heroAuroraA 21s ease-in-out infinite; }
        .hero-aurora-b { animation: heroAuroraB 26s ease-in-out infinite; }
        .hero-aurora-c { animation: heroAuroraC 31s ease-in-out infinite; }
        @keyframes heroAuroraA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(52px, 34px) scale(1.12); }
        }
        @keyframes heroAuroraB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-44px, 40px) scale(1.08); }
        }
        @keyframes heroAuroraC {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50%      { transform: translate(-50%, -30px) scale(1.15); }
        }

        /* ── Grid pan ─────────────────────────────────────────────────── */
        .hero-grid-pan { animation: heroGridPan 38s linear infinite; }
        @keyframes heroGridPan {
          from { transform: translate(0, 0); }
          to   { transform: translate(52px, 52px); }
        }

        /* ── Starfield twinkle ────────────────────────────────────────── */
        .hero-star { opacity: 0.25; animation: heroTwinkle 4s ease-in-out infinite; }
        @keyframes heroTwinkle {
          0%, 100% { opacity: 0.12; transform: scale(0.9); }
          50%      { opacity: 0.85; transform: scale(1.25); }
        }

        /* ── Rising embers ────────────────────────────────────────────── */
        .hero-ember { opacity: 0; animation: heroEmberRise 12s linear infinite; }
        @keyframes heroEmberRise {
          0%   { transform: translateY(0)      translateX(0);    opacity: 0; }
          8%   { opacity: 0.55; }
          85%  { opacity: 0.25; }
          100% { transform: translateY(-105vh) translateX(28px); opacity: 0; }
        }

        /* ── Shooting star ────────────────────────────────────────────── */
        .hero-shooting { opacity: 0; animation: heroShoot 9s ease-in 3s infinite; }
        @keyframes heroShoot {
          0%      { transform: translate(0, 0)          rotate(8deg); opacity: 0; }
          3%      { opacity: 0.9; }
          9%      { transform: translate(60vw, 9vw)     rotate(8deg); opacity: 0; }
          100%    { transform: translate(60vw, 9vw)     rotate(8deg); opacity: 0; }
        }

        /* ── Floating medical instrument outlines ─────────────────────── */
        .hero-med-float { animation: heroMedFloat 14s ease-in-out infinite; }
        @keyframes heroMedFloat {
          0%, 100% { transform: translateY(0)    rotate(0deg)   scale(1);    }
          25%      { transform: translateY(-18px) rotate(5deg)  scale(1.04); }
          50%      { transform: translateY(-8px)  rotate(-3deg) scale(0.97); }
          75%      { transform: translateY(-22px) rotate(-6deg) scale(1.02); }
        }

        /* ── Respect the visitor's motion preference ──────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .hero-ring,
          .hero-portrait-halo,
          .hero-portrait-sheen,
          .hero-title-grad,
          .hero-beat,
          .hero-beat-ring,
          .hero-spin-cw,
          .hero-spin-ccw,
          .hero-ecg-sweep,
          .hero-defect,
          .hero-patch,
          .hero-live-ping,
          .hero-chip-in,
          .hero-node-active,
          .hero-aurora-a,
          .hero-aurora-b,
          .hero-aurora-c,
          .hero-grid-pan,
          .hero-star,
          .hero-ember,
          .hero-shooting,
          .hero-med-float {
            animation: none !important;
          }
          .hero-chip-in { opacity: 1 !important; transform: none !important; }
          .hero-beat-ring,
          .hero-portrait-sheen,
          .hero-ember,
          .hero-shooting { display: none; }
          .hero-star { opacity: 0.3; }
          .hero-title-grad {
            background: none;
            -webkit-text-fill-color: currentColor;
            color: #FFFFFF;
          }
          .hero-cta::after { transition: none; }
        }
      `}</style>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Deterministic decorative positions — fixed values (not Math.random) so the
   server render and client hydration always agree.
───────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────────
   Floating medical instrument SVGs — transparent decorative layer.
   Each entry is rendered as an absolutely-positioned, slowly-floating
   stroke-only SVG icon. Opacity keeps them barely perceptible (~0.05) so they
   add depth without competing with the content.
───────────────────────────────────────────────────────────────────────────── */
const MEDICAL_INSTRUMENTS = [
  /* stethoscope — top-left */
  { x: '2%',  y: '8%',  size: 88,  opacity: 0.055, color: '#5B9BFF', delay: 0,  dur: 16,
    svg: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
        <path d="M35 20 C20 20 15 32 15 44 C15 58 27 68 42 68 C57 68 70 58 70 44 L70 38" />
        <line x1="35" y1="20" x2="35" y2="58" />
        <path d="M70 38 C70 26 78 18 88 18" />
        <circle cx="88" cy="13" r="6" fill="currentColor" fillOpacity="0.6" />
      </svg>
    ),
  },
  /* ECG / heartbeat line — top-right */
  { x: '76%', y: '5%',  size: 120, opacity: 0.05,  color: '#41D6FF', delay: 2.5, dur: 20,
    svg: (
      <svg viewBox="0 0 120 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
        <polyline points="0,24 20,24 29,7 37,41 45,17 52,24 72,24 81,7 89,41 97,17 104,24 120,24" />
      </svg>
    ),
  },
  /* pill / capsule — right-side */
  { x: '87%', y: '58%', size: 70,  opacity: 0.05,  color: '#3EE68F', delay: 4,  dur: 17,
    svg: (
      <svg viewBox="0 0 100 42" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" width="100%" height="100%">
        <rect x="4" y="4" width="92" height="34" rx="17" />
        <line x1="50" y1="4" x2="50" y2="38" />
      </svg>
    ),
  },
  /* syringe — left-side lower */
  { x: '2%',  y: '66%', size: 92,  opacity: 0.05,  color: '#F97BB9', delay: 6,  dur: 22,
    svg: (
      <svg viewBox="0 0 100 36" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
        <line x1="2"  y1="18" x2="22" y2="18" />
        <rect x="22" y="8" width="52" height="20" rx="3" />
        <line x1="74" y1="18" x2="98" y2="18" />
        <line x1="36" y1="8" x2="36" y2="28" />
        <line x1="50" y1="8" x2="50" y2="28" />
        <line x1="64" y1="8" x2="64" y2="28" />
      </svg>
    ),
  },
  /* medical cross — top-centre */
  { x: '45%', y: '1%',  size: 64,  opacity: 0.045, color: '#B195FF', delay: 1,  dur: 25,
    svg: (
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
        <rect x="35" y="8"  width="30" height="84" rx="6" />
        <rect x="8"  y="35" width="84" height="30" rx="6" />
      </svg>
    ),
  },
  /* DNA double helix — right edge */
  { x: '91%', y: '28%', size: 68,  opacity: 0.045, color: '#5B9BFF', delay: 8,  dur: 19,
    svg: (
      <svg viewBox="0 0 60 120" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" width="100%" height="100%">
        <path d="M30 5 C55 25 55 45 30 65 C5 85 5 105 30 120" />
        <path d="M30 5 C5 25 5 45 30 65 C55 85 55 105 30 120" />
        <line x1="12" y1="32" x2="48" y2="32" />
        <line x1="8"  y1="57" x2="52" y2="57" />
        <line x1="12" y1="82" x2="48" y2="82" />
        <line x1="8"  y1="107" x2="52" y2="107" />
      </svg>
    ),
  },
  /* microscope — bottom-left */
  { x: '14%', y: '76%', size: 76,  opacity: 0.045, color: '#41D6FF', delay: 10, dur: 21,
    svg: (
      <svg viewBox="0 0 80 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
        <rect x="28" y="8" width="24" height="18" rx="4" />
        <line x1="40" y1="26" x2="40" y2="56" />
        <line x1="28" y1="38" x2="52" y2="38" />
        <ellipse cx="40" cy="63" rx="20" ry="11" />
        <line x1="22" y1="80" x2="58" y2="80" />
        <line x1="12" y1="94" x2="68" y2="94" />
        <line x1="22" y1="80" x2="12" y2="94" />
        <line x1="58" y1="80" x2="68" y2="94" />
      </svg>
    ),
  },
]

const STARS = [
  { x: '6%',  y: '18%', size: 2,   delay: 0.0, dur: 4.2 },
  { x: '14%', y: '64%', size: 1.5, delay: 1.1, dur: 5.1 },
  { x: '22%', y: '32%', size: 2,   delay: 2.3, dur: 4.6 },
  { x: '31%', y: '80%', size: 1.5, delay: 0.7, dur: 5.6 },
  { x: '38%', y: '12%', size: 2.5, delay: 1.8, dur: 4.0 },
  { x: '47%', y: '46%', size: 1.5, delay: 3.0, dur: 5.3 },
  { x: '55%', y: '22%', size: 2,   delay: 0.4, dur: 4.8 },
  { x: '63%', y: '70%', size: 1.5, delay: 2.6, dur: 4.3 },
  { x: '71%', y: '38%', size: 2,   delay: 1.4, dur: 5.0 },
  { x: '79%', y: '14%', size: 2.5, delay: 3.4, dur: 4.5 },
  { x: '86%', y: '58%', size: 1.5, delay: 0.9, dur: 5.4 },
  { x: '93%', y: '30%', size: 2,   delay: 2.0, dur: 4.1 },
]

const EMBERS = [
  { x: '10%', size: 3,   color: 'rgba(91,155,255,0.5)',  delay: 0,   dur: 13 },
  { x: '26%', size: 2.5, color: 'rgba(65,214,255,0.45)', delay: 3.5, dur: 15 },
  { x: '44%', size: 3,   color: 'rgba(62,230,143,0.4)',  delay: 7,   dur: 12 },
  { x: '62%', size: 2.5, color: 'rgba(91,155,255,0.45)', delay: 1.5, dur: 16 },
  { x: '78%', size: 3,   color: 'rgba(249,123,185,0.4)', delay: 5,   dur: 14 },
  { x: '90%', size: 2.5, color: 'rgba(65,214,255,0.5)',  delay: 8.5, dur: 13 },
]
