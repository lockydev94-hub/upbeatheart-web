'use client'

import type { SiteSettings } from '@/types/firestore'

import DoctorPanel from './hero/DoctorPanel'
import FocusSlider from './hero/FocusSlider'

interface HeroSectionProps {
  settings: SiteSettings
}

/**
 * HeroSection — the first thing a visitor sees.
 *
 *   Left  · who the doctor is    — portrait, credentials, proof, how to book
 *   Right · what the doctor does — a slider through the paediatric-cardiology
 *           focus areas, anchored by a heart that re-tints and grows as the
 *           slides advance from newborn to adult.
 *
 * All hero-specific keyframes live in the one global style block at the bottom
 * of this file; the child panels only reference the class names. Shared
 * entrance utilities (`.anim-*`, `.delay-*`, `.shimmer-text`) come from
 * globals.css, which already silences them under `prefers-reduced-motion`.
 */
export default function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="hero-shell relative overflow-hidden bg-white">

      {/* ══ Ambient background ══ */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="hero-blob-a absolute -left-32 -top-32 w-[520px] h-[520px] rounded-full bg-primary/4 blur-[90px]" />
        <div className="hero-blob-b absolute -right-24 top-0 w-[440px] h-[440px] rounded-full bg-cyan/5 blur-[80px]" />
        <div className="hero-blob-c absolute bottom-0 left-1/2 -translate-x-1/2 w-[620px] h-[280px] rounded-full bg-green/4 blur-[90px]" />

        <svg className="absolute inset-0 w-full h-full opacity-[0.022]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0L0 0 0 48" fill="none" stroke="#1565D8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>
      </div>

      {/* ══ Content ══ */}
      <div className="container-max px-4 md:px-8 relative z-10">
        <div className="hero-grid grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-14 items-center py-10 lg:py-12">

          <DoctorPanel settings={settings} />

          <div className="w-full max-w-[540px] mx-auto lg:mx-0 lg:ml-auto">
            <FocusSlider />
          </div>
        </div>
      </div>

      {/* ══ Hero-only keyframes and classes ══ */}
      <style jsx global>{`
        /* Full-height hero on desktop; natural height on phones so the
           stacked columns are never clipped. */
        .hero-shell { min-height: auto; }
        .hero-grid  { min-height: auto; }
        @media (min-width: 1024px) {
          .hero-shell,
          .hero-grid { min-height: calc(100vh - var(--header-h, 100px)); }
        }

        /* Angle used by both spinning conic gradients below. */
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes heroAngleSpin { to { --angle: 360deg; } }

        /* ── Card border ring ─────────────────────────────────────────── */
        .hero-ring {
          background: conic-gradient(from var(--angle), #1565D8, #18B8E6, #18B55A, #4F8FF5, #1565D8);
          opacity: 0.45;
          animation: heroAngleSpin 4s linear infinite;
        }

        /* ── Portrait halo ────────────────────────────────────────────── */
        .hero-portrait-halo {
          background: conic-gradient(from var(--angle), #1565D8, #18B8E6, #18B55A, #EC4899, #1565D8);
          animation: heroAngleSpin 6s linear infinite;
        }

        /* ── Light sweep across the portrait ──────────────────────────── */
        .hero-portrait-sheen {
          background: linear-gradient(105deg, transparent 32%, rgba(255,255,255,0.42) 48%, transparent 64%);
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
          0%   { transform: scale(0.88); opacity: 0.5; }
          70%  { opacity: 0; }
          100% { transform: scale(1.45); opacity: 0; }
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

        /* ── Defect spotted, then patched (core-focus slide) ──────────── */
        /* One 5s story: the hole shows for ~2s, the patch draws over it,
           both hold, then everything clears and the loop restarts. */
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

        /* ── Age badge popping in beside the heart ────────────────────── */
        .hero-chip-in { animation: heroChipIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes heroChipIn {
          0%   { opacity: 0; transform: scale(0.8); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* ── Autoplay progress under the slider ───────────────────────── */
        @keyframes heroStageProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ── Drifting background blobs ────────────────────────────────── */
        .hero-blob-a { animation: heroDriftA 19s ease-in-out infinite; }
        .hero-blob-b { animation: heroDriftB 23s ease-in-out infinite; }
        .hero-blob-c { animation: heroDriftC 27s ease-in-out infinite; }
        @keyframes heroDriftA {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(38px, 26px); }
        }
        @keyframes heroDriftB {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(-30px, 34px); }
        }
        @keyframes heroDriftC {
          0%, 100% { transform: translate(-50%, 0); }
          50%      { transform: translate(-50%, -22px); }
        }

        /* ── Respect the visitor's motion preference ──────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .hero-ring,
          .hero-portrait-halo,
          .hero-portrait-sheen,
          .hero-beat,
          .hero-beat-ring,
          .hero-spin-cw,
          .hero-spin-ccw,
          .hero-ecg-sweep,
          .hero-defect,
          .hero-patch,
          .hero-live-ping,
          .hero-chip-in,
          .hero-blob-a,
          .hero-blob-b,
          .hero-blob-c {
            animation: none !important;
          }
          .hero-chip-in { opacity: 1 !important; transform: none !important; }
          .hero-beat-ring,
          .hero-portrait-sheen { display: none; }
          .hero-cta::after { transition: none; }
        }
      `}</style>
    </section>
  )
}
